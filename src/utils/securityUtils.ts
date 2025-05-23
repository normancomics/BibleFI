
import CryptoJS from 'crypto-js';

/**
 * Bible.fi Security Utilities
 * Implements AES-256 encryption for sensitive data
 */

/**
 * Encrypts data using AES-256
 * @param data - Data to encrypt (can be string or object)
 * @param secret - Secret key for encryption
 * @returns Encrypted string
 */
export function encryptData(data: any, secret: string): string {
  // Convert objects to JSON strings
  const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
  
  // Use AES encryption from CryptoJS
  const encrypted = CryptoJS.AES.encrypt(stringData, secret).toString();
  
  return encrypted;
}

/**
 * Decrypts AES-256 encrypted data
 * @param encryptedData - The encrypted string
 * @param secret - Secret key used for encryption
 * @returns Decrypted data (automatically parses JSON if applicable)
 */
export function decryptData(encryptedData: string, secret: string): any {
  try {
    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(encryptedData, secret);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    // Attempt to parse as JSON, return as string if parsing fails
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}

/**
 * Generates a secure hash for sensitive operations
 * @param input - Input data to hash
 * @returns SHA-256 hash
 */
export function generateSecureHash(input: string): string {
  return CryptoJS.SHA256(input).toString();
}

/**
 * Creates a secure token for session validation
 * @param userId - User identifier
 * @param expiryMinutes - Minutes until expiration
 * @returns Encrypted token
 */
export function createSecureToken(userId: string, expiryMinutes: number = 60): string {
  const now = new Date();
  const expiry = new Date(now.getTime() + expiryMinutes * 60000);
  
  const payload = {
    userId,
    created: now.toISOString(),
    expires: expiry.toISOString()
  };
  
  // Use a combination of userId and current timestamp as the encryption key
  const secret = generateSecureHash(userId + now.getTime());
  
  return encryptData(payload, secret);
}

/**
 * Implements secure storage for sensitive data
 */
export const secureStorage = {
  /**
   * Store encrypted data in localStorage
   */
  setItem: (key: string, data: any, secret?: string): void => {
    // Use default app secret or provided secret
    const encryptionKey = secret || (import.meta.env.VITE_ENCRYPTION_KEY || 'bible-fi-default-secret');
    const encryptedData = encryptData(data, encryptionKey);
    localStorage.setItem(key, encryptedData);
  },
  
  /**
   * Retrieve and decrypt data from localStorage
   */
  getItem: (key: string, secret?: string): any => {
    const encryptedData = localStorage.getItem(key);
    
    if (!encryptedData) return null;
    
    // Use default app secret or provided secret
    const encryptionKey = secret || (import.meta.env.VITE_ENCRYPTION_KEY || 'bible-fi-default-secret');
    return decryptData(encryptedData, encryptionKey);
  },
  
  /**
   * Remove item from secure storage
   */
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  }
};
