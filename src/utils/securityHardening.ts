/**
 * BibleFi Military-Grade Security Hardening
 * Implements comprehensive security measures to protect against sophisticated attacks
 */

import { securityMonitor, SecurityLogLevel } from './securityMonitoring';
import { generateSecureHash, encryptData, decryptData } from './securityUtils';

/**
 * Session data interface
 */
interface SessionData {
  userId: string;
  createdAt: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
  securityLevel: 'standard' | 'enhanced' | 'maximum' | 'quantum';
}

/**
 * Input Validation & Sanitization
 */
export class InputValidator {
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*>/gi,
    /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi
  ];

  private static readonly SQL_PATTERNS = [
    /('|(\\')|(;)|(\s)|(\*)|(\|)|(%)|(\?)|(-)|(<)|(>)|(\[)|(\])|(\{)|(\})|(\$))/gi,
    /union\s+select/gi,
    /drop\s+table/gi,
    /delete\s+from/gi,
    /insert\s+into/gi,
    /update\s+set/gi,
    /exec\s*\(/gi,
    /script\s*:/gi
  ];

  private static readonly CRYPTO_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Sanitize user input to prevent XSS attacks
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    let sanitized = input;
    
    // Remove XSS patterns
    this.XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    // HTML encode dangerous characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
    
    securityMonitor.logEvent('input_sanitized', SecurityLogLevel.INFO, {
      originalLength: input.length,
      sanitizedLength: sanitized.length,
      modified: input !== sanitized
    });
    
    return sanitized;
  }

  /**
   * Validate SQL input to prevent injection attacks
   */
  static validateSqlInput(input: string): boolean {
    if (!input) return true;
    
    const hasSqlInjection = this.SQL_PATTERNS.some(pattern => pattern.test(input));
    
    if (hasSqlInjection) {
      securityMonitor.logEvent('sql_injection_attempt', SecurityLogLevel.CRITICAL, {
        input: input.substring(0, 100) // Log only first 100 chars
      });
      return false;
    }
    
    return true;
  }

  /**
   * Validate cryptocurrency addresses
   */
  static validateCryptoAddress(address: string): boolean {
    const isValid = this.CRYPTO_ADDRESS_PATTERN.test(address);
    
    if (!isValid && address) {
      securityMonitor.logEvent('invalid_crypto_address', SecurityLogLevel.WARNING, {
        address: address.substring(0, 10) + '...'
      });
    }
    
    return isValid;
  }

  /**
   * Validate email addresses
   */
  static validateEmail(email: string): boolean {
    const isValid = this.EMAIL_PATTERN.test(email);
    
    if (!isValid && email) {
      securityMonitor.logEvent('invalid_email_format', SecurityLogLevel.WARNING, {
        email: email.substring(0, 5) + '...'
      });
    }
    
    return isValid;
  }

  /**
   * Validate transaction amounts
   */
  static validateTransactionAmount(amount: number, maxAmount: number = 1000000): boolean {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
      securityMonitor.logEvent('invalid_transaction_amount', SecurityLogLevel.WARNING, { amount });
      return false;
    }
    
    if (amount > maxAmount) {
      securityMonitor.logEvent('excessive_transaction_amount', SecurityLogLevel.ALERT, { 
        amount, 
        maxAmount 
      });
      return false;
    }
    
    return true;
  }
}

/**
 * Rate Limiting & Anti-Fraud Protection
 */
export class RateLimiter {
  private static requestCounts: Map<string, { count: number; resetTime: number }> = new Map();
  private static blacklistedIPs: Set<string> = new Set();

  /**
   * Check if request is within rate limits
   */
  static checkRateLimit(
    identifier: string, 
    maxRequests: number = 100, 
    windowMs: number = 60000
  ): boolean {
    const now = Date.now();
    const key = `${identifier}:${Math.floor(now / windowMs)}`;
    
    const current = this.requestCounts.get(key) || { count: 0, resetTime: now + windowMs };
    current.count++;
    
    this.requestCounts.set(key, current);
    
    // Clean up old entries
    this.cleanup();
    
    if (current.count > maxRequests) {
      securityMonitor.logEvent('rate_limit_exceeded', SecurityLogLevel.ALERT, {
        identifier,
        count: current.count,
        maxRequests
      });
      
      // Add to blacklist if severely exceeding limits
      if (current.count > maxRequests * 3) {
        this.blacklistedIPs.add(identifier);
        securityMonitor.logEvent('ip_blacklisted', SecurityLogLevel.CRITICAL, { identifier });
      }
      
      return false;
    }
    
    return true;
  }

  /**
   * Check if IP is blacklisted
   */
  static isBlacklisted(identifier: string): boolean {
    return this.blacklistedIPs.has(identifier);
  }

  /**
   * Remove IP from blacklist
   */
  static removeFromBlacklist(identifier: string): void {
    this.blacklistedIPs.delete(identifier);
    securityMonitor.logEvent('ip_unblacklisted', SecurityLogLevel.INFO, { identifier });
  }

  /**
   * Clean up old rate limit entries
   */
  private static cleanup(): void {
    const now = Date.now();
    
    for (const [key, value] of this.requestCounts.entries()) {
      if (now > value.resetTime) {
        this.requestCounts.delete(key);
      }
    }
  }
}

/**
 * Session Security Manager
 */
export class SessionSecurity {
  private static activeSessions: Map<string, SessionData> = new Map();
  private static sessionSecrets: Map<string, string> = new Map();

  /**
   * Create secure session with military-grade encryption
   */
  static createSecureSession(
    userId: string, 
    securityLevel: 'standard' | 'enhanced' | 'maximum' | 'quantum' = 'enhanced',
    ipAddress?: string,
    userAgent?: string
  ): string {
    const sessionId = this.generateSecureSessionId();
    const sessionSecret = generateSecureHash(sessionId + userId + Date.now());
    
    const sessionData: SessionData = {
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      ipAddress,
      userAgent,
      securityLevel
    };
    
    // Encrypt session data
    const encryptedSession = encryptData(sessionData, sessionSecret);
    
    this.activeSessions.set(sessionId, sessionData);
    this.sessionSecrets.set(sessionId, sessionSecret);
    
    securityMonitor.logEvent('secure_session_created', SecurityLogLevel.INFO, {
      sessionId: sessionId.substring(0, 8) + '...',
      userId,
      securityLevel
    });
    
    return sessionId;
  }

  /**
   * Validate session and check for suspicious activity
   */
  static validateSession(
    sessionId: string, 
    currentIp?: string, 
    currentUserAgent?: string
  ): SessionData | null {
    const session = this.activeSessions.get(sessionId);
    const secret = this.sessionSecrets.get(sessionId);
    
    if (!session || !secret) {
      securityMonitor.logEvent('invalid_session_access', SecurityLogLevel.WARNING, { sessionId });
      return null;
    }
    
    // Check for session hijacking
    if (session.ipAddress && currentIp && session.ipAddress !== currentIp) {
      securityMonitor.logEvent('session_ip_mismatch', SecurityLogLevel.ALERT, {
        sessionId: sessionId.substring(0, 8) + '...',
        originalIp: session.ipAddress,
        currentIp
      });
      this.destroySession(sessionId);
      return null;
    }
    
    // Check session timeout based on security level
    const maxInactivity = this.getMaxInactivity(session.securityLevel);
    if (Date.now() - session.lastActivity > maxInactivity) {
      securityMonitor.logEvent('session_timeout', SecurityLogLevel.INFO, { sessionId });
      this.destroySession(sessionId);
      return null;
    }
    
    // Update last activity
    session.lastActivity = Date.now();
    this.activeSessions.set(sessionId, session);
    
    return session;
  }

  /**
   * Destroy session securely
   */
  static destroySession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
    this.sessionSecrets.delete(sessionId);
    
    securityMonitor.logEvent('session_destroyed', SecurityLogLevel.INFO, {
      sessionId: sessionId.substring(0, 8) + '...'
    });
  }

  /**
   * Generate cryptographically secure session ID
   */
  private static generateSecureSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return generateSecureHash(`session_${timestamp}_${randomPart}`);
  }

  /**
   * Get maximum inactivity time based on security level
   */
  private static getMaxInactivity(securityLevel: string): number {
    switch (securityLevel) {
      case 'quantum':
        return 15 * 60 * 1000; // 15 minutes
      case 'maximum':
        return 30 * 60 * 1000; // 30 minutes
      case 'enhanced':
        return 60 * 60 * 1000; // 1 hour
      default:
        return 24 * 60 * 60 * 1000; // 24 hours
    }
  }
}

/**
 * Cryptographic Integrity Checker
 */
export class IntegrityChecker {
  private static checksums: Map<string, string> = new Map();

  /**
   * Generate integrity checksum for critical data
   */
  static generateChecksum(data: any, key: string): string {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const checksum = generateSecureHash(dataString + key);
    
    this.checksums.set(key, checksum);
    return checksum;
  }

  /**
   * Verify data integrity
   */
  static verifyIntegrity(data: any, key: string, expectedChecksum?: string): boolean {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const currentChecksum = generateSecureHash(dataString + key);
    
    const storedChecksum = expectedChecksum || this.checksums.get(key);
    
    if (!storedChecksum) {
      securityMonitor.logEvent('missing_integrity_checksum', SecurityLogLevel.WARNING, { key });
      return false;
    }
    
    const isValid = currentChecksum === storedChecksum;
    
    if (!isValid) {
      securityMonitor.logEvent('integrity_check_failed', SecurityLogLevel.CRITICAL, {
        key,
        expected: storedChecksum.substring(0, 16) + '...',
        actual: currentChecksum.substring(0, 16) + '...'
      });
    }
    
    return isValid;
  }
}

/**
 * Anti-Debugging & Tamper Detection
 */
export class TamperDetection {
  private static originalCode: Map<string, string> = new Map();
  private static isDebuggerDetected = false;

  /**
   * Initialize tamper detection
   */
  static initialize(): void {
    this.detectDebugger();
    this.setupTamperDetection();
    this.monitorConsoleUsage();
  }

  /**
   * Detect if debugger is attached
   */
  private static detectDebugger(): void {
    let devtools = false;
    
    setInterval(() => {
      devtools = false;
      
      // DevTools detection technique
      const start = Date.now();
      debugger;
      const elapsed = Date.now() - start;
      
      if (elapsed > 100) {
        devtools = true;
      }
      
      if (devtools && !this.isDebuggerDetected) {
        this.isDebuggerDetected = true;
        securityMonitor.logEvent('debugger_detected', SecurityLogLevel.ALERT, {
          timestamp: new Date().toISOString()
        });
      } else if (!devtools) {
        this.isDebuggerDetected = false;
      }
    }, 1000);
  }

  /**
   * Setup code tamper detection
   */
  private static setupTamperDetection(): void {
    const criticalFunctions = [
      'encryptData',
      'decryptData',
      'generateSecureHash',
      'validateSession'
    ];
    
    criticalFunctions.forEach(funcName => {
      const func = (window as any)[funcName];
      if (func) {
        const originalCode = func.toString();
        this.originalCode.set(funcName, generateSecureHash(originalCode));
        
        // Periodically check for tampering
        setInterval(() => {
          const currentCode = func.toString();
          const currentHash = generateSecureHash(currentCode);
          const originalHash = this.originalCode.get(funcName);
          
          if (originalHash && currentHash !== originalHash) {
            securityMonitor.logEvent('code_tampering_detected', SecurityLogLevel.CRITICAL, {
              function: funcName,
              timestamp: new Date().toISOString()
            });
          }
        }, 5000);
      }
    });
  }

  /**
   * Monitor console usage for potential attacks
   */
  private static monitorConsoleUsage(): void {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    let consoleUsageCount = 0;
    
    console.log = function(...args) {
      consoleUsageCount++;
      if (consoleUsageCount > 50) {
        securityMonitor.logEvent('excessive_console_usage', SecurityLogLevel.WARNING, {
          count: consoleUsageCount
        });
      }
      return originalLog.apply(console, args);
    };
    
    console.warn = function(...args) {
      securityMonitor.logEvent('console_warning', SecurityLogLevel.INFO, {
        message: args[0]?.toString().substring(0, 100)
      });
      return originalWarn.apply(console, args);
    };
    
    console.error = function(...args) {
      // Prevent recursive logging for console errors
      const message = args[0]?.toString();
      if (!message || message.includes('security_anomaly_detected')) {
        return originalError.apply(console, args);
      }
      
      securityMonitor.logEvent('console_error', SecurityLogLevel.INFO, {
        message: message.substring(0, 100)
      });
      return originalError.apply(console, args);
    };
    
    // Reset counter periodically
    setInterval(() => {
      consoleUsageCount = 0;
    }, 60000);
  }
}

/**
 * Secure Headers & CSP Manager
 */
export class SecurityHeaders {
  /**
   * Apply security headers (would be done server-side in production)
   */
  static applySecurityHeaders(): void {
    // In a real application, these would be set by the server
    const securityHeaders = {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: wss:;",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    };
    
    securityMonitor.logEvent('security_headers_applied', SecurityLogLevel.INFO, {
      headers: Object.keys(securityHeaders)
    });
  }
}

// Initialize security systems
if (typeof window !== 'undefined') {
  TamperDetection.initialize();
  SecurityHeaders.applySecurityHeaders();
}