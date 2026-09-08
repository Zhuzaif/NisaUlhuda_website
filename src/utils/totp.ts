// RFC 6238 TOTP (Time-based One-Time Password) implementation
// Compatible with Google Authenticator, Microsoft Authenticator, and Authy.
// Uses native browser Web Crypto API (SubtleCrypto) for high performance and zero external dependencies.

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decode an RFC 4648 Base32 string into a Uint8Array.
 */
export function base32ToUint8Array(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/[\s=-]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_CHARS.indexOf(clean[i]);
    if (idx === -1) {
      continue; // Skip unrecognized characters
    }
    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

/**
 * Encode a Uint8Array into an RFC 4648 Base32 string.
 */
export function uint8ArrayToBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Generate a cryptographically secure random Base32 secret for Google Authenticator (160 bits / 20 bytes).
 */
export function generateRandomSecret(byteLength = 20): string {
  const randomBytes = new Uint8Array(byteLength);
  window.crypto.getRandomValues(randomBytes);
  return uint8ArrayToBase32(randomBytes);
}

/**
 * Calculate the 6-digit TOTP code for a secret and optional time window offset.
 * Standard step: 30 seconds. Algorithm: HMAC-SHA1.
 */
export async function generateTOTP(secretBase32: string, windowOffset = 0): Promise<string> {
  const keyBytes = base32ToUint8Array(secretBase32);
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = 30;
  const counter = Math.floor(epoch / timeStep) + windowOffset;

  // 8-byte big-endian counter buffer
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  counterView.setBigUint64(0, BigInt(counter));

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'HMAC', hash: { name: 'SHA-1' } },
    false,
    ['sign']
  );

  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
  const hmac = new Uint8Array(signature);

  // Dynamic truncation per RFC 4226
  const offset = hmac[hmac.length - 1] & 0x0f;
  const codeInt =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = codeInt % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Verify a 6-digit TOTP code against a secret key.
 * Allows current 30s window + / - 1 step (to handle slight clock differences).
 */
export async function verifyTOTP(token: string, secretBase32: string): Promise<boolean> {
  const clean = token.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(clean)) {
    return false;
  }

  // Check windows: 0 (current), -1 (previous 30s), +1 (next 30s)
  for (const step of [0, -1, 1]) {
    const expected = await generateTOTP(secretBase32, step);
    if (expected === clean) {
      return true;
    }
  }

  return false;
}

/**
 * Construct the standard otpauth URI scanned by Google Authenticator and other TOTP apps.
 */
export function getOtpAuthUri(
  secretBase32: string,
  accountName = 'admin@nisaulhuda.app',
  issuer = 'Nisa Ul Huda'
): string {
  const encIssuer = encodeURIComponent(issuer);
  const encAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encIssuer}:${encAccount}?secret=${secretBase32}&issuer=${encIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generate 8 single-use emergency backup recovery codes (e.g. "9384-2194").
 */
export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  const charset = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  for (let i = 0; i < count; i++) {
    const bytes = new Uint8Array(8);
    window.crypto.getRandomValues(bytes);
    let code = '';
    for (let j = 0; j < 8; j++) {
      code += charset[bytes[j] % charset.length];
    }
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
  }
  return codes;
}

/**
 * Calculate SHA-256 hash string for a text value.
 */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
