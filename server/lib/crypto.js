import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getKey() {
  const keyHex = process.env.TOKEN_ENC_KEY;
  if (!keyHex) {
    throw new Error('TOKEN_ENC_KEY environment variable is required');
  }
  if (keyHex.length !== 64) {
    throw new Error('TOKEN_ENC_KEY must be 32 bytes (64 hex characters)');
  }
  return Buffer.from(keyHex, 'hex');
}

export function encrypt(text) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);
  
  const tag = cipher.getAuthTag();
  
  return Buffer.concat([iv, encrypted, tag]).toString('base64');
}

export function decrypt(encryptedData) {
  const key = getKey();
  const buf = Buffer.from(encryptedData, 'base64');
  
  if (buf.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error('Invalid encrypted data');
  }
  
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(buf.length - TAG_LENGTH);
  const encrypted = buf.subarray(IV_LENGTH, buf.length - TAG_LENGTH);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
  
  return decrypted.toString('utf8');
}