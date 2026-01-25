/**
 * Bible.fi Post-Quantum Cryptography Module
 * Implements NIST FIPS 203/204 compliant post-quantum cryptography
 * Using @noble/post-quantum for ML-KEM (Kyber) and ML-DSA (Dilithium)
 * 
 * "The LORD is my rock, and my fortress, and my deliverer; my God, my strength,
 * in whom I will trust" - Psalm 18:2
 */

import { ml_kem768, ml_kem1024 } from '@noble/post-quantum/ml-kem.js';
import { ml_dsa65, ml_dsa87 } from '@noble/post-quantum/ml-dsa.js';
import { slh_dsa_sha2_256f } from '@noble/post-quantum/slh-dsa.js';
import CryptoJS from 'crypto-js';

// ============================================================================
// ML-KEM (CRYSTALS-Kyber) - Post-Quantum Key Encapsulation
// NIST FIPS 203 compliant
// ============================================================================

export interface MLKEMKeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export interface MLKEMEncapsulation {
  ciphertext: Uint8Array;
  sharedSecret: Uint8Array;
}

/**
 * ML-KEM (Kyber) Post-Quantum Key Exchange
 * Security Level: 768 (Category 3) or 1024 (Category 5)
 */
export class PostQuantumKEM {
  private level: 'ML-KEM-768' | 'ML-KEM-1024';
  private kem: typeof ml_kem768 | typeof ml_kem1024;

  constructor(securityLevel: 'standard' | 'high' = 'standard') {
    if (securityLevel === 'high') {
      this.level = 'ML-KEM-1024';
      this.kem = ml_kem1024;
    } else {
      this.level = 'ML-KEM-768';
      this.kem = ml_kem768;
    }
  }

  /**
   * Generate a post-quantum key pair
   */
  async generateKeyPair(): Promise<MLKEMKeyPair> {
    try {
      const keypair = this.kem.keygen();
      return {
        publicKey: keypair.publicKey,
        secretKey: keypair.secretKey
      };
    } catch (error) {
      console.error('[PQ-KEM] Key generation failed:', error);
      throw new Error('Post-quantum key generation failed');
    }
  }

  /**
   * Encapsulate a shared secret using recipient's public key
   * Returns ciphertext and shared secret for symmetric encryption
   */
  async encapsulate(publicKey: Uint8Array): Promise<MLKEMEncapsulation> {
    try {
      const encapsulated = this.kem.encapsulate(publicKey);
      return {
        ciphertext: encapsulated.cipherText,
        sharedSecret: encapsulated.sharedSecret
      };
    } catch (error) {
      console.error('[PQ-KEM] Encapsulation failed:', error);
      throw new Error('Post-quantum encapsulation failed');
    }
  }

  /**
   * Decapsulate ciphertext using secret key to recover shared secret
   */
  async decapsulate(ciphertext: Uint8Array, secretKey: Uint8Array): Promise<Uint8Array> {
    try {
      return this.kem.decapsulate(ciphertext, secretKey);
    } catch (error) {
      console.error('[PQ-KEM] Decapsulation failed:', error);
      throw new Error('Post-quantum decapsulation failed');
    }
  }

  /**
   * Get the security level info
   */
  getSecurityInfo(): { level: string; publicKeySize: number; secretKeySize: number; ciphertextSize: number } {
    const sizes = this.level === 'ML-KEM-1024' 
      ? { publicKeySize: 1568, secretKeySize: 3168, ciphertextSize: 1568 }
      : { publicKeySize: 1184, secretKeySize: 2400, ciphertextSize: 1088 };
    
    return { level: this.level, ...sizes };
  }
}

// ============================================================================
// ML-DSA (CRYSTALS-Dilithium) - Post-Quantum Digital Signatures
// NIST FIPS 204 compliant
// ============================================================================

export interface MLDSAKeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

/**
 * ML-DSA (Dilithium) Post-Quantum Digital Signatures
 * Security Level: 65 (Category 3) or 87 (Category 5)
 */
export class PostQuantumSigner {
  private level: 'ML-DSA-65' | 'ML-DSA-87';
  private dsa: typeof ml_dsa65 | typeof ml_dsa87;
  private keypair: MLDSAKeyPair | null = null;

  constructor(securityLevel: 'standard' | 'high' = 'standard') {
    if (securityLevel === 'high') {
      this.level = 'ML-DSA-87';
      this.dsa = ml_dsa87;
    } else {
      this.level = 'ML-DSA-65';
      this.dsa = ml_dsa65;
    }
  }

  /**
   * Generate a post-quantum signing key pair
   */
  async generateKeyPair(): Promise<MLDSAKeyPair> {
    try {
      const keypair = this.dsa.keygen();
      this.keypair = {
        publicKey: keypair.publicKey,
        secretKey: keypair.secretKey
      };
      return this.keypair;
    } catch (error) {
      console.error('[PQ-DSA] Key generation failed:', error);
      throw new Error('Post-quantum signature key generation failed');
    }
  }

  /**
   * Sign a message with post-quantum security
   */
  async sign(message: Uint8Array | string, secretKey?: Uint8Array): Promise<Uint8Array> {
    try {
      const sk = secretKey || this.keypair?.secretKey;
      if (!sk) {
        throw new Error('No secret key available. Generate keypair first.');
      }
      
      const msgBytes = typeof message === 'string' 
        ? new TextEncoder().encode(message) 
        : message;
      
      return this.dsa.sign(sk, msgBytes);
    } catch (error) {
      console.error('[PQ-DSA] Signing failed:', error);
      throw new Error('Post-quantum signing failed');
    }
  }

  /**
   * Verify a post-quantum signature
   */
  async verify(signature: Uint8Array, message: Uint8Array | string, publicKey: Uint8Array): Promise<boolean> {
    try {
      const msgBytes = typeof message === 'string' 
        ? new TextEncoder().encode(message) 
        : message;
      
      return this.dsa.verify(publicKey, msgBytes, signature);
    } catch (error) {
      console.error('[PQ-DSA] Verification failed:', error);
      return false;
    }
  }

  /**
   * Get the security level info
   */
  getSecurityInfo(): { level: string; publicKeySize: number; secretKeySize: number; signatureSize: number } {
    const sizes = this.level === 'ML-DSA-87'
      ? { publicKeySize: 2592, secretKeySize: 4896, signatureSize: 4627 }
      : { publicKeySize: 1952, secretKeySize: 4032, signatureSize: 3309 };
    
    return { level: this.level, ...sizes };
  }
}

// ============================================================================
// SLH-DSA (SPHINCS+) - Stateless Hash-Based Signatures
// Most conservative post-quantum option
// ============================================================================

export interface SLHDSAKeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

/**
 * SLH-DSA (SPHINCS+) Hash-Based Digital Signatures
 * Considered the most conservative post-quantum signature scheme
 */
export class HashBasedSigner {
  private slh = slh_dsa_sha2_256f;
  private keypair: SLHDSAKeyPair | null = null;

  /**
   * Generate a stateless hash-based signing key pair
   */
  async generateKeyPair(): Promise<SLHDSAKeyPair> {
    try {
      const keypair = this.slh.keygen();
      this.keypair = {
        publicKey: keypair.publicKey,
        secretKey: keypair.secretKey
      };
      return this.keypair;
    } catch (error) {
      console.error('[SLH-DSA] Key generation failed:', error);
      throw new Error('Hash-based signature key generation failed');
    }
  }

  /**
   * Sign a message with hash-based signature
   */
  async sign(message: Uint8Array | string, secretKey?: Uint8Array): Promise<Uint8Array> {
    try {
      const sk = secretKey || this.keypair?.secretKey;
      if (!sk) {
        throw new Error('No secret key available. Generate keypair first.');
      }
      
      const msgBytes = typeof message === 'string' 
        ? new TextEncoder().encode(message) 
        : message;
      
      return this.slh.sign(sk, msgBytes);
    } catch (error) {
      console.error('[SLH-DSA] Signing failed:', error);
      throw new Error('Hash-based signing failed');
    }
  }

  /**
   * Verify a hash-based signature
   */
  async verify(signature: Uint8Array, message: Uint8Array | string, publicKey: Uint8Array): Promise<boolean> {
    try {
      const msgBytes = typeof message === 'string' 
        ? new TextEncoder().encode(message) 
        : message;
      
      return this.slh.verify(publicKey, msgBytes, signature);
    } catch (error) {
      console.error('[SLH-DSA] Verification failed:', error);
      return false;
    }
  }

  getSecurityInfo(): { algorithm: string; securityLevel: string } {
    return {
      algorithm: 'SLH-DSA-SHA2-256f (SPHINCS+)',
      securityLevel: 'Category 5 (256-bit quantum security)'
    };
  }
}

// ============================================================================
// Post-Quantum Secure Channel
// Combines ML-KEM for key exchange with AES-256 for symmetric encryption
// ============================================================================

export interface SecureChannelParams {
  localKeypair: MLKEMKeyPair;
  remotePublicKey: Uint8Array;
  sharedSecret: Uint8Array;
}

/**
 * Establish a post-quantum secure channel using ML-KEM + AES-256
 */
export class PostQuantumSecureChannel {
  private kem: PostQuantumKEM;
  private channelParams: SecureChannelParams | null = null;

  constructor(securityLevel: 'standard' | 'high' = 'standard') {
    this.kem = new PostQuantumKEM(securityLevel);
  }

  /**
   * Initialize as the initiator of the secure channel
   */
  async initiate(remotePublicKey: Uint8Array): Promise<{ ciphertext: Uint8Array; sessionReady: boolean }> {
    try {
      const localKeypair = await this.kem.generateKeyPair();
      const encapsulation = await this.kem.encapsulate(remotePublicKey);
      
      this.channelParams = {
        localKeypair,
        remotePublicKey,
        sharedSecret: encapsulation.sharedSecret
      };
      
      return {
        ciphertext: encapsulation.ciphertext,
        sessionReady: true
      };
    } catch (error) {
      console.error('[PQ-Channel] Initiation failed:', error);
      throw error;
    }
  }

  /**
   * Respond to a secure channel initiation
   */
  async respond(ciphertext: Uint8Array, localSecretKey: Uint8Array): Promise<{ sharedSecret: Uint8Array }> {
    try {
      const sharedSecret = await this.kem.decapsulate(ciphertext, localSecretKey);
      return { sharedSecret };
    } catch (error) {
      console.error('[PQ-Channel] Response failed:', error);
      throw error;
    }
  }

  /**
   * Encrypt data using the established shared secret
   */
  encryptWithChannel(data: string): string {
    if (!this.channelParams?.sharedSecret) {
      throw new Error('Secure channel not established');
    }
    
    const keyHex = Array.from(this.channelParams.sharedSecret)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Hex.parse(keyHex), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return iv.toString() + ':' + encrypted.toString();
  }

  /**
   * Decrypt data using the established shared secret
   */
  decryptWithChannel(encryptedData: string): string {
    if (!this.channelParams?.sharedSecret) {
      throw new Error('Secure channel not established');
    }
    
    const [ivHex, ciphertext] = encryptedData.split(':');
    const keyHex = Array.from(this.channelParams.sharedSecret)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const decrypted = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Hex.parse(keyHex), {
      iv: CryptoJS.enc.Hex.parse(ivHex),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert Uint8Array to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g) || [];
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
}

/**
 * Get post-quantum security status
 */
export function getPostQuantumStatus(): {
  kemAvailable: boolean;
  dsaAvailable: boolean;
  slhDsaAvailable: boolean;
  algorithms: string[];
  nistCompliant: boolean;
} {
  return {
    kemAvailable: true,
    dsaAvailable: true,
    slhDsaAvailable: true,
    algorithms: [
      'ML-KEM-768 (FIPS 203)',
      'ML-KEM-1024 (FIPS 203)',
      'ML-DSA-65 (FIPS 204)',
      'ML-DSA-87 (FIPS 204)',
      'SLH-DSA-SHA2-256f (FIPS 205)'
    ],
    nistCompliant: true
  };
}

// ============================================================================
// Export singleton instances for convenience
// ============================================================================

export const pqKEM = new PostQuantumKEM('standard');
export const pqSigner = new PostQuantumSigner('standard');
export const pqHashSigner = new HashBasedSigner();
export const pqSecureChannel = new PostQuantumSecureChannel('standard');

// High security variants
export const pqKEMHigh = new PostQuantumKEM('high');
export const pqSignerHigh = new PostQuantumSigner('high');
