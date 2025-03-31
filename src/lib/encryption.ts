
/**
 * Basic encryption/decryption utilities using Web Crypto API
 */

// Generate a random encryption key
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export key to string format for storage
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

// Import key from string format
export async function importKey(keyStr: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(keyStr);
  return await window.crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt file data
export async function encryptData(data: ArrayBuffer, key: CryptoKey): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data
  );
  
  return { encrypted, iv };
}

// Decrypt file data
export async function decryptData(encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> {
  return await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encryptedData
  );
}

// Helper functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Function to create a wrapper that combines the encrypted data and the IV
export function combineEncryptedDataAndIV(encryptedData: ArrayBuffer, iv: Uint8Array): ArrayBuffer {
  const combined = new Uint8Array(iv.length + 4 + encryptedData.byteLength);
  
  // Store IV length as first 4 bytes
  const ivLengthBytes = new Uint8Array(4);
  const view = new DataView(ivLengthBytes.buffer);
  view.setUint32(0, iv.length, true);
  
  combined.set(ivLengthBytes, 0);
  combined.set(iv, 4);
  combined.set(new Uint8Array(encryptedData), 4 + iv.length);
  
  return combined.buffer;
}

// Function to extract the encrypted data and IV from a combined buffer
export function extractEncryptedDataAndIV(combined: ArrayBuffer): { encryptedData: ArrayBuffer; iv: Uint8Array } {
  const combinedArray = new Uint8Array(combined);
  
  // Get IV length from first 4 bytes
  const view = new DataView(combined.slice(0, 4));
  const ivLength = view.getUint32(0, true);
  
  // Extract IV
  const iv = combinedArray.slice(4, 4 + ivLength);
  
  // Extract encrypted data
  const encryptedData = combined.slice(4 + ivLength);
  
  return { encryptedData, iv };
}

// Function to securely hash a password for key derivation
export async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  // Convert password to ArrayBuffer
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  // Import password as raw key
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Derive a key using PBKDF2
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Generate random salt for key derivation
export function generateSalt(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(16));
}
