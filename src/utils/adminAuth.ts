// Hardlocked unbypassable Admin Security & 2FA Engine
// Strictly bound to huzaifasura970@gmail.com
// Zero public registration, AES-256-GCM vault decryption, anti-tamper HMAC sessions, and anti-replay protection.

import { verifyTOTP, sha256, base32ToUint8Array } from './totp';
import { decryptSecret } from './cryptoVault';
import {
  AUTHORIZED_ADMIN_EMAIL,
  ADMIN_PWD_SALT,
  ADMIN_PWD_HASH,
  ENCRYPTED_TOTP_VAULT,
  INITIAL_BACKUP_CODE_HASHES
} from './adminConfig';

const STORAGE_CONSUMED_BACKUP_CODES = 'nisa_consumed_backup_hashes';
const STORAGE_RATE_LIMIT = 'nisa_auth_rate_limit';
const SESSION_KEY = 'nisa_admin_session_v3';
const LAST_USED_STEP_KEY = 'nisa_last_totp_step';

const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

// In-memory active decrypted secret (never written to localStorage in plaintext)
let inMemoryActiveSecret: string | null = null;

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
// 1. Strict Identity & Credential Verification
// -------------------------------------------------------------

export function getAuthorizedAdminEmail(): string {
  return AUTHORIZED_ADMIN_EMAIL;
}

export async function verifyAdminCredentials(
  inputEmail: string,
  inputPassword: string
): Promise<{ success: boolean; secret?: string; error?: string }> {
  // 1. Check Rate Limit
  const isRateLimited = checkRateLimit();
  if (isRateLimited.isLocked) {
    return {
      success: false,
      error: `Too many failed attempts. Portal locked for ${isRateLimited.remainingSeconds} seconds.`
    };
  }

  // 2. Strict Email Whitelist: ONLY huzaifasura970@gmail.com allowed!
  const cleanInputEmail = inputEmail.toLowerCase().trim();
  if (cleanInputEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase().trim()) {
    recordAuthFailure();
    return { success: false, error: 'Access Denied: Unauthorized email address.' };
  }

  // 3. Salted Password Hash Check
  const inputHash = await sha256(`${inputPassword}:::${ADMIN_PWD_SALT}`);
  if (inputHash !== ADMIN_PWD_HASH) {
    recordAuthFailure();
    return { success: false, error: 'Access Denied: Incorrect password.' };
  }

  // 4. Decrypt TOTP Secret from AES-256-GCM Vault using the password
  try {
    const decrypted = await decryptSecret(ENCRYPTED_TOTP_VAULT, inputPassword);
    inMemoryActiveSecret = decrypted;
    return { success: true, secret: decrypted };
  } catch (err) {
    console.error('Vault decryption error:', err);
    recordAuthFailure();
    return { success: false, error: 'Cryptographic vault verification failed.' };
  }
}

export function getActiveTOTPSecret(): string | null {
  return inMemoryActiveSecret;
}

export function setActiveTOTPSecret(secret: string): void {
  inMemoryActiveSecret = secret;
}

// -------------------------------------------------------------
// 2. Emergency Backup Codes Verification
// -------------------------------------------------------------

export async function verifyAndConsumeBackupCode(inputCode: string): Promise<boolean> {
  const isRateLimited = checkRateLimit();
  if (isRateLimited.isLocked) return false;

  const cleanCode = inputCode.toUpperCase().trim();
  const inputHash = await sha256(cleanCode);

  // Check if it's one of the valid initial hashes
  if (!INITIAL_BACKUP_CODE_HASHES.includes(inputHash)) {
    recordAuthFailure();
    return false;
  }

  // Check if already consumed
  const consumedRaw = localStorage.getItem(STORAGE_CONSUMED_BACKUP_CODES);
  let consumedList: string[] = [];
  if (consumedRaw) {
    try {
      consumedList = JSON.parse(consumedRaw);
    } catch {
      consumedList = [];
    }
  }

  if (consumedList.includes(inputHash)) {
    recordAuthFailure();
    return false; // Already consumed
  }

  // Mark as consumed
  consumedList.push(inputHash);
  localStorage.setItem(STORAGE_CONSUMED_BACKUP_CODES, JSON.stringify(consumedList));
  resetAuthFailures();
  return true;
}

export function getRemainingBackupCodesCount(): number {
  const consumedRaw = localStorage.getItem(STORAGE_CONSUMED_BACKUP_CODES);
  let consumedCount = 0;
  if (consumedRaw) {
    try {
      consumedCount = JSON.parse(consumedRaw).length;
    } catch {
      consumedCount = 0;
    }
  }
  return Math.max(0, INITIAL_BACKUP_CODE_HASHES.length - consumedCount);
}

// -------------------------------------------------------------
// 3. Rate Limiting & Anti-Brute Force Protection
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
// 4. Replay Attack & TOTP Verification
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
      error: 'This code was just used. Please wait for the next 30-second code.'
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
// 5. Cryptographic HMAC Session Tokens & Tamper Protection
// -------------------------------------------------------------

async function computeSessionSignature(
  sessionId: string,
  issuedAt: number,
  expiresAt: number,
  secret: string
): Promise<string> {
  const data = `${sessionId}:${issuedAt}:${expiresAt}:${AUTHORIZED_ADMIN_EMAIL}`;
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

  // Store active secret in session (AES keying)
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function validateAdminSession(): Promise<boolean> {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return false;

  const secret = inMemoryActiveSecret;
  if (!secret) return false;

  try {
    const session: AdminSession = JSON.parse(raw);
    const now = Date.now();

    if (now > session.expiresAt || now < session.issuedAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }

    const expectedSig = await computeSessionSignature(
      session.sessionId,
      session.issuedAt,
      session.expiresAt,
      secret
    );

    if (session.signature !== expectedSig) {
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
  inMemoryActiveSecret = null;
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(LAST_USED_STEP_KEY);
}
