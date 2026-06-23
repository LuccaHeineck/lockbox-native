import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Buffer } from 'buffer';

/**
 * Retrieve or generate a persistent encryption key stored in SecureStore.
 * The key is a 32‑byte hex string.
 */
async function getKey(): Promise<Uint8Array> {
  const stored = await SecureStore.getItemAsync('encryption_key');
  if (stored) {
    // Convert hex string back to bytes
    const bytes = new Uint8Array(stored.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(stored.substr(i * 2, 2), 16);
    }
    return bytes;
  }
  // Generate 32 random bytes
  const randomBytes = Crypto.getRandomValues(new Uint8Array(32));
  // Store as hex for persistence
  let hex = '';
  randomBytes.forEach(b => {
    hex += b.toString(16).padStart(2, '0');
  });
  await SecureStore.setItemAsync('encryption_key', hex);
  return randomBytes;
}

/** Simple XOR‑based reversible encryption. **/
export async function encryptData(plain: string): Promise<string> {
  const key = await getKey();
  const data = Buffer.from(plain, 'utf8');
  const encrypted = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ key[i % key.length];
  }
  return encrypted.toString('base64');
}

export async function decryptData(cipher: string): Promise<string> {
  const key = await getKey();
  const encrypted = Buffer.from(cipher, 'base64');
  const decrypted = Buffer.alloc(encrypted.length);
  for (let i = 0; i < encrypted.length; i++) {
    decrypted[i] = encrypted[i] ^ key[i % key.length];
  }
  return decrypted.toString('utf8');
}
