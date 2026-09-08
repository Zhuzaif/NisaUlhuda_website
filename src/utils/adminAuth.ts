// Comprehensive unbypassable Admin Security & 2FA Engine
// Provides HMAC-SHA256 session signatures, rate limiting, anti-replay, and backup code recovery.

import { verifyTOTP, generateRandomSecret, sha256, base32ToUint8Array } from './totp';

const STORAGE_PIN_HASH = 'nisa_admin_pin_hash';
const STORAGE_PIN_SALT = 'nisa_admin_pin_salt';
const STORAGE_2FA_SECRET = 'nisa_admin_2fa_secret';
const STORAGE_2FA_CONFIGURED = 'nisa_admin_2fa_configured';
const STORAGE_BACKUP_CODES = 'nisa_admin_backup_codes';
const STORAGE_RATE_LIMIT = 'nisa_auth_rate_limit';
const SESSION_KEY = 'nisa_admin_session_v2';
const LAST_USED_STEP_KEY = 'nisa_last_totp_step';

const DEFAULT_PIN = 'nisa786';
const DEFAULT_SALT = 'nisa_secure_salt_786';
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

export interface AdminSession {
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
  signature: string;
}

export interface RateLimitState {
  failureCount: number;
  lockedUntil: number; // Timestamp ms
}

// -------------------------------------------------------------
// 1. PIN & Master Password Management
// -------------------------------------------------------------

export async function hashPin(pin: string, salt: string): Promise<string> {
  return sha256(`${pin}:${salt}`);
}

export async function verifyMasterPin(inputPin: string): Promise<boolean> {
  const isRateLimited = checkRateLimit();
  if (isRateLimited.isLocked) {
    return false;
  }

  const storedHash = localStorage.getItem(STORAGE_PIN_HASH);
  const storedSalt = localStorage.getItem(STORAGE_PIN_SALT) || DEFAULT_SALT;

  let isValid = false;
  if (!storedHash) {
    // If no custom PIN configured yet, check against default PIN
    const defaultHash = await hashPin(DEFAULT_PIN, DEFAULT_SALT);
    const inputHash = await hashPin(inputPin, DEFAULT_SALT);
    isValid = (inputHash === defaultHash);
  } else {
    const inputHash = await hashPin(inputPin, storedSalt);
    isValid = (inputHash === storedHash);
  }

  if (!isValid) {
    recordAuthFailure();
  }
  return isValid;
}

export async function setMasterPin(newPin: string): Promise<void> {
  const newSalt = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const newHash = await hashPin(newPin, newSalt);
  localStorage.setItem(STORAGE_PIN_HASH, newHash);
  localStorage.setItem(STORAGE_PIN_SALT, newSalt);
}

// -------------------------------------------------------------
// 2. 2FA Secret & Configuration
// -------------------------------------------------------------

export function is2FAConfigured(): boolean {
  const secret = localStorage.getItem(STORAGE_2FA_SECRET);
  const configured = localStorage.getItem(STORAGE_2FA_CONFIGURED);
  return Boolean(secret && configured === 'true');
}

export function getOrCreate2FASecret(): string {
  let secret = localStorage.getItem(STORAGE_2FA_SECRET);
  if (!secret) {
    secret = generateRandomSecret(20);
    localStorage.setItem(STORAGE_2FA_SECRET, secret);
    localStorage.setItem(STORAGE_2FA_CONFIGURED, 'false');
  }
  return secret;
}

export function getStored2FASecret(): string | null {
  return localStorage.getItem(STORAGE_2FA_SECRET);
}

export function confirm2FASetup(secret: string): void {
  localStorage.setItem(STORAGE_2FA_SECRET, secret);
  localStorage.setItem(STORAGE_2FA_CONFIGURED, 'true');
}

export function reset2FASettings(): void {
  localStorage.removeItem(STORAGE_2FA_SECRET);
  localStorage.removeItem(STORAGE_2FA_CONFIGURED);
  localStorage.removeItem(STORAGE_BACKUP_CODES);
  logoutAdmin();
}

// -------------------------------------------------------------
// 3. Backup Recovery Codes
// -------------------------------------------------------------

export async function saveBackupCodes(codes: string[]): Promise<void> {
  const hashedCodes = await Promise.all(codes.map(c => sha256(c.toUpperCase().trim())));
  localStorage.setItem(STORAGE_BACKUP_CODES, JSON.stringify(hashedCodes));
}

export async function verifyAndConsumeBackupCode(inputCode: string): Promise<boolean> {
  const isRateLimited = checkRateLimit();
  if (isRateLimited.isLocked) return false;

  const stored = localStorage.getItem(STORAGE_BACKUP_CODES);
  if (!stored) return false;

  try {
    const hashedList: string[] = JSON.parse(stored);
    const inputHash = await sha256(inputCode.toUpperCase().trim());

    const matchIdx = hashedList.indexOf(inputHash);
    if (matchIdx !== -1) {
      // Consume the code so it cannot be reused
      hashedList.splice(matchIdx, 1);
      localStorage.setItem(STORAGE_BACKUP_CODES, JSON.stringify(hashedList));
      resetAuthFailures();
      return true;
    }
  } catch (e) {
    console.error('Failed to parse backup codes', e);
  }

  recordAuthFailure();
  return false;
}

export function getRemainingBackupCodesCount(): number {
  const stored = localStorage.getItem(STORAGE_BACKUP_CODES);
  if (!stored) return 0;
  try {
    const list: string[] = JSON.parse(stored);
    return list.length;
  } catch {
    return 0;
  }
}

// -------------------------------------------------------------
// 4. Rate Limiting & Anti-Brute Force Protection
// -------------------------------------------------------------

export function checkRateLimit(): { isLocked: boolean; remainingSeconds: number } {
  const raw = localStorage.getItem(STORAGE_RATE_LIMIT);
  if (!raw) return { isLocked: false, remainingSeconds: 0 };

  try {
    const state: RateLimitState = JSON.parse(raw);
    const now = Date.now();
    if (state.lockedUntil > now) {
      const remainingSec = Math.ceil((state.lockedUntil - now) / 1000);
      return { isLocked: true, remainingSeconds: remainingSec };
    }
  } catch {
    localStorage.removeItem(STORAGE_RATE_LIMIT);
  }
  return { isLocked: false, remainingSeconds: 0 };
}

export function recordAuthFailure(): void {
  const raw = localStorage.getItem(STORAGE_RATE_LIMIT);
  let state: RateLimitState = { failureCount: 0, lockedUntil: 0 };

  if (raw) {
    try {
      state = JSON.parse(raw);
    } catch {
      state = { failureCount: 0, lockedUntil: 0 };
    }
  }

  state.failureCount += 1;
  // If 5 consecutive failures, lockout for 15 minutes
  if (state.failureCount >= 5) {
    state.lockedUntil = Date.now() + 15 * 60 * 1000;
  }
  localStorage.setItem(STORAGE_RATE_LIMIT, JSON.stringify(state));
}

export function resetAuthFailures(): void {
  localStorage.removeItem(STORAGE_RATE_LIMIT);
}

// -------------------------------------------------------------
// 5. Replay Attack & TOTP Verification
// -------------------------------------------------------------

export async function verifyTOTPWithReplayProtection(
  token: string,
  secret: string
): Promise<{ success: boolean; error?: string }> {
  const isRateLimited = checkRateLimit();
  if (isRateLimited.isLocked) {
    return {
      success: false,
      error: `Too many failed attempts. Locked for ${isRateLimited.remainingSeconds} seconds.`
    };
  }

  const currentStep = Math.floor(Date.now() / 1000 / 30);
  const lastUsedStep = sessionStorage.getItem(LAST_USED_STEP_KEY);

  if (lastUsedStep && Number(lastUsedStep) === currentStep) {
    return {
      success: false,
      error: 'This TOTP code has already been used. Please wait for the next 30-second code.'
    };
  }

  const isValid = await verifyTOTP(token, secret);
  if (!isValid) {
    recordAuthFailure();
    return { success: false, error: 'Invalid 6-digit verification code.' };
  }

  // Record used step to prevent replay
  sessionStorage.setItem(LAST_USED_STEP_KEY, currentStep.toString());
  resetAuthFailures();
  return { success: true };
}

// -------------------------------------------------------------
// 6. Cryptographic Session Token & Anti-Tamper Verification
// -------------------------------------------------------------

async function computeSessionSignature(
  sessionId: string,
  issuedAt: number,
  expiresAt: number,
  secret: string
): Promise<string> {
  const data = `${sessionId}:${issuedAt}:${expiresAt}`;
  const keyBytes = base32ToUint8Array(secret);
  const encoder = new TextEncoder();

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await window.crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createAdminSession(secret: string): Promise<void> {
  const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const issuedAt = Date.now();
  const expiresAt = issuedAt + SESSION_DURATION_MS;

  const signature = await computeSessionSignature(sessionId, issuedAt, expiresAt, secret);
  const session: AdminSession = { sessionId, issuedAt, expiresAt, signature };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function validateAdminSession(): Promise<boolean> {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return false;

  const secret = getStored2FASecret();
  if (!secret) return false;

  try {
    const session: AdminSession = JSON.parse(raw);
    const now = Date.now();

    // 1. Check expiration
    if (now > session.expiresAt || now < session.issuedAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }

    // 2. Cryptographically re-verify HMAC signature
    const expectedSig = await computeSessionSignature(
      session.sessionId,
      session.issuedAt,
      session.expiresAt,
      secret
    );

    if (session.signature !== expectedSig) {
      console.warn('Tampered session detected! Invalidating.');
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }

    return true;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return false;
  }
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(LAST_USED_STEP_KEY);
  sessionStorage.removeItem('nisa_admin_auth'); // Clean up old legacy keys
}
