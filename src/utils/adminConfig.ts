// Cryptographically locked administrative security configuration
// Hardcoded authorization: Strictly restricted to huzaifasura970@gmail.com
// Zero public registration, AES-256-GCM encrypted TOTP vault, and salted password hash

export const AUTHORIZED_ADMIN_EMAIL = 'huzaifasura970@gmail.com';

// Salted SHA-256 hash of Master Password
export const ADMIN_PWD_SALT = 'c8aa13d86615da408b46a3f6c18be251';
export const ADMIN_PWD_HASH = 'f2a34765159d9e56c2e440c07f9f75abf26ef254a902a7dcdfb7bb438d4d7a49';

// AES-256-GCM encrypted TOTP secret (PBKDF2 100,000 rounds)
// Can only be decrypted in-memory by entering the correct Master Password
export const ENCRYPTED_TOTP_VAULT = 'mSAQuNxSiRNCn03+ldiF6n6Muyd4IjClT7NlpJTjybtVk3YWofeoqeD8I/r8WDnPfmNao9HIp17y2kVRoR7HPkZl2fdgvyUB0kVA1w==';

// SHA-256 hashes of the 8 single-use emergency backup recovery codes
export const INITIAL_BACKUP_CODE_HASHES = [
  '41d2f4d8356e0ac4c2132b2def9a7b415e3dcbe9498b6f69304c6b2898aec6e2',
  'b7889e030829da9b1921123e3e8cdd9a57ac96e12f1bcc33fa6c9d6b3448a8d5',
  '607ba4a950762703ab8804db374567e03218aace6a43b1fc77f2d340ac82d4fb',
  'ae4dd2f182d29db954201038b993afa2605948affe6cf552eca25d3659f195d3',
  '8afc18eecf43c79632ba18d0755456175ef45ce1ace63775c048d33ed45e5d38',
  'aa303cfc6e09b066dacdf9d7b5805001824953e11ad8bb1f53fc434749c8041f',
  '10f84197071e0df00e3622ab3da70c96259245a306243d7f836b6a8f11d33122',
  '102df5e08e6b36b6ccc416a08a3c488ebd9e7bbde3e30381c37ebedf86a1d856'
];
