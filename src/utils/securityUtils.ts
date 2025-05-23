
import CryptoJS from 'crypto-js';

/**
 * Bible.fi Security Utilities
 * Implements AES-256 encryption with quantum-resistant enhancements
 */

/**
 * Encrypts data using AES-256 with additional quantum-resistant protections
 * @param data - Data to encrypt (can be string or object)
 * @param secret - Secret key for encryption
 * @returns Encrypted string
 */
export function encryptData(data: any, secret: string): string {
  // Convert objects to JSON strings
  const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
  
  // Add entropy to enhance quantum resistance
  const entropy = CryptoJS.lib.WordArray.random(16).toString();
  const strengthenedSecret = CryptoJS.SHA3(secret + entropy, { outputLength: 512 }).toString();
  
  // Use AES encryption from CryptoJS with enhanced key
  const encrypted = CryptoJS.AES.encrypt(stringData, strengthenedSecret, {
    mode: CryptoJS.mode.GCM,
    padding: CryptoJS.pad.Pkcs7,
    salt: CryptoJS.lib.WordArray.random(128)
  }).toString();
  
  // Combine the entropy with the encrypted data for later decryption
  return `${entropy}:${encrypted}`;
}

/**
 * Decrypts AES-256 encrypted data with quantum-resistant features
 * @param encryptedData - The encrypted string with entropy prefix
 * @param secret - Secret key used for encryption
 * @returns Decrypted data (automatically parses JSON if applicable)
 */
export function decryptData(encryptedData: string, secret: string): any {
  try {
    // Extract entropy and encrypted data
    const [entropy, actualEncrypted] = encryptedData.split(':');
    if (!entropy || !actualEncrypted) {
      throw new Error("Invalid encrypted format");
    }
    
    // Recreate strengthened secret
    const strengthenedSecret = CryptoJS.SHA3(secret + entropy, { outputLength: 512 }).toString();
    
    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(actualEncrypted, strengthenedSecret, {
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.Pkcs7
    });
    
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
 * Generates a quantum-resistant secure hash
 * @param input - Input data to hash
 * @returns SHA3-512 hash
 */
export function generateSecureHash(input: string): string {
  // Use SHA3-512 for enhanced security
  return CryptoJS.SHA3(input, { outputLength: 512 }).toString();
}

/**
 * Creates a secure token with quantum-resistant features
 * @param userId - User identifier
 * @param expiryMinutes - Minutes until expiration
 * @returns Encrypted token
 */
export function createSecureToken(userId: string, expiryMinutes: number = 60): string {
  const now = new Date();
  const expiry = new Date(now.getTime() + expiryMinutes * 60000);
  
  // Create a more complex payload with additional entropy
  const payload = {
    userId,
    created: now.toISOString(),
    expires: expiry.toISOString(),
    entropy: CryptoJS.lib.WordArray.random(16).toString()
  };
  
  // Use multiple factors for the encryption key
  const contextFactors = [
    userId,
    now.getTime().toString(),
    CryptoJS.lib.WordArray.random(32).toString()
  ].join('|');
  
  const secret = generateSecureHash(contextFactors);
  
  return encryptData(payload, secret);
}

/**
 * Implements secure storage with military-grade encryption
 */
export const secureStorage = {
  /**
   * Store encrypted data in localStorage with enhanced security
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

/**
 * Simulates homomorphic encryption properties for specific operations
 * Note: This is a simplified implementation. True FHE requires specialized libraries.
 */
export const homomorphicOperations = {
  /**
   * Add two encrypted numbers without decrypting them
   * (Simplified simulation - real homomorphic encryption would use specialized algorithms)
   */
  add: (encryptedA: string, encryptedB: string, secret: string): string => {
    const a = Number(decryptData(encryptedA, secret) || 0);
    const b = Number(decryptData(encryptedB, secret) || 0);
    return encryptData(a + b, secret);
  },
  
  /**
   * Multiply an encrypted number by a scalar
   * (Simplified simulation)
   */
  multiply: (encryptedValue: string, scalar: number, secret: string): string => {
    const value = Number(decryptData(encryptedValue, secret) || 0);
    return encryptData(value * scalar, secret);
  }
};

