import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  InputValidator, 
  RateLimiter, 
  SessionSecurity, 
  IntegrityChecker,
  TamperDetection 
} from '@/utils/securityHardening';
import { securityMonitor, SecurityLogLevel } from '@/utils/securityMonitoring';
import { useSecurityContext } from '@/contexts/SecurityContext';
import { toast } from 'sonner';

interface ComprehensiveSecurityContextType {
  // Input validation
  validateAndSanitize: (input: string) => string;
  validateCryptoAddress: (address: string) => boolean;
  validateEmail: (email: string) => boolean;
  validateTransactionAmount: (amount: number) => boolean;
  
  // Rate limiting
  checkRateLimit: (identifier: string, action: string) => boolean;
  isBlacklisted: (identifier: string) => boolean;
  
  // Session management
  createSecureSession: (userId: string) => string;
  validateSession: (sessionId: string) => any;
  destroySession: (sessionId: string) => void;
  
  // Data integrity
  generateDataChecksum: (data: any, key: string) => string;
  verifyDataIntegrity: (data: any, key: string, checksum?: string) => boolean;
  
  // Security state
  securityWarnings: string[];
  isUnderAttack: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

const ComprehensiveSecurityContext = createContext<ComprehensiveSecurityContextType>({
  validateAndSanitize: () => '',
  validateCryptoAddress: () => false,
  validateEmail: () => false,
  validateTransactionAmount: () => false,
  checkRateLimit: () => false,
  isBlacklisted: () => false,
  createSecureSession: () => '',
  validateSession: () => null,
  destroySession: () => {},
  generateDataChecksum: () => '',
  verifyDataIntegrity: () => false,
  securityWarnings: [],
  isUnderAttack: false,
  threatLevel: 'low'
});

export const useComprehensiveSecurity = () => useContext(ComprehensiveSecurityContext);

interface Props {
  children: React.ReactNode;
}

export const ComprehensiveSecurityProvider: React.FC<Props> = ({ children }) => {
  const { securityLevel, isSecurityInitialized } = useSecurityContext();
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);
  const [isUnderAttack, setIsUnderAttack] = useState(false);
  const [threatLevel, setThreatLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [userIdentifier, setUserIdentifier] = useState<string>('');

  useEffect(() => {
    if (isSecurityInitialized) {
      initializeComprehensiveSecurity();
      setupSecurityMonitoring();
    }
  }, [isSecurityInitialized, securityLevel]);

  const initializeComprehensiveSecurity = () => {
    // Generate user identifier for rate limiting
    const identifier = generateUserIdentifier();
    setUserIdentifier(identifier);
    
    securityMonitor.logEvent('comprehensive_security_initialized', SecurityLogLevel.INFO, {
      securityLevel,
      identifier: identifier.substring(0, 8) + '...'
    });
    
    // Initialize tamper detection for maximum security levels
    if (securityLevel === 'maximum' || securityLevel === 'quantum') {
      TamperDetection.initialize();
    }
  };

  const setupSecurityMonitoring = () => {
    // Monitor security events and update threat level
    const monitoringInterval = setInterval(() => {
      const recentEvents = securityMonitor.getSecurityLog()
        .filter(event => {
          const eventTime = new Date(event.timestamp).getTime();
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
          return eventTime > fiveMinutesAgo;
        });

      updateThreatLevel(recentEvents);
      updateSecurityWarnings(recentEvents);
    }, 10000); // Check every 10 seconds

    return () => clearInterval(monitoringInterval);
  };

  const generateUserIdentifier = (): string => {
    const factors = [
      navigator.userAgent,
      screen.width.toString(),
      screen.height.toString(),
      navigator.language,
      new Date().getTimezoneOffset().toString()
    ];
    
    return factors.join('|').substring(0, 32);
  };

  const updateThreatLevel = (recentEvents: any[]) => {
    const criticalEvents = recentEvents.filter(e => e.level === SecurityLogLevel.CRITICAL).length;
    const alertEvents = recentEvents.filter(e => e.level === SecurityLogLevel.ALERT).length;
    const warningEvents = recentEvents.filter(e => e.level === SecurityLogLevel.WARNING).length;

    let newThreatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let underAttack = false;

    if (criticalEvents > 0) {
      newThreatLevel = 'critical';
      underAttack = true;
    } else if (alertEvents > 2) {
      newThreatLevel = 'high';
      underAttack = true;
    } else if (alertEvents > 0 || warningEvents > 5) {
      newThreatLevel = 'medium';
    }

    if (newThreatLevel !== threatLevel) {
      setThreatLevel(newThreatLevel);
      securityMonitor.logEvent('threat_level_changed', SecurityLogLevel.INFO, {
        oldLevel: threatLevel,
        newLevel: newThreatLevel
      });
    }

    if (underAttack !== isUnderAttack) {
      setIsUnderAttack(underAttack);
      if (underAttack) {
        toast.error('Security Alert: Potential attack detected!', {
          description: 'Enhanced security measures activated. Monitor your activity carefully.',
          duration: 10000
        });
      }
    }
  };

  const updateSecurityWarnings = (recentEvents: any[]) => {
    const warnings: string[] = [];
    
    // Check for specific attack patterns
    const injectionAttempts = recentEvents.filter(e => 
      e.eventType.includes('injection') || e.eventType.includes('xss')
    ).length;
    
    if (injectionAttempts > 0) {
      warnings.push(`${injectionAttempts} injection attempt(s) blocked`);
    }

    const rateLimitExceeded = recentEvents.filter(e => 
      e.eventType === 'rate_limit_exceeded'
    ).length;
    
    if (rateLimitExceeded > 0) {
      warnings.push('Rate limits exceeded - potential DDoS attempt');
    }

    const sessionAnomalies = recentEvents.filter(e => 
      e.eventType.includes('session') && e.level !== SecurityLogLevel.INFO
    ).length;
    
    if (sessionAnomalies > 0) {
      warnings.push('Session security anomalies detected');
    }

    setSecurityWarnings(warnings);
  };

  // Security function implementations
  const validateAndSanitize = (input: string): string => {
    const sanitized = InputValidator.sanitizeInput(input);
    
    if (sanitized !== input) {
      securityMonitor.logEvent('input_sanitized', SecurityLogLevel.WARNING, {
        originalLength: input.length,
        sanitizedLength: sanitized.length
      });
    }
    
    return sanitized;
  };

  const validateCryptoAddress = (address: string): boolean => {
    const isValid = InputValidator.validateCryptoAddress(address);
    
    if (!isValid && address) {
      securityMonitor.logEvent('invalid_crypto_address_blocked', SecurityLogLevel.WARNING, {
        addressPrefix: address.substring(0, 10)
      });
    }
    
    return isValid;
  };

  const validateEmail = (email: string): boolean => {
    return InputValidator.validateEmail(email);
  };

  const validateTransactionAmount = (amount: number): boolean => {
    const maxAmount = securityLevel === 'quantum' ? 100000 : 
                    securityLevel === 'maximum' ? 500000 : 1000000;
    
    const isValid = InputValidator.validateTransactionAmount(amount, maxAmount);
    
    if (!isValid) {
      securityMonitor.logEvent('suspicious_transaction_amount', SecurityLogLevel.ALERT, {
        amount,
        maxAllowed: maxAmount,
        securityLevel
      });
    }
    
    return isValid;
  };

  const checkRateLimit = (identifier: string, action: string): boolean => {
    // Adjust rate limits based on security level and threat level
    const baseLimit = securityLevel === 'quantum' ? 50 : 
                     securityLevel === 'maximum' ? 100 : 200;
    
    const threatMultiplier = threatLevel === 'critical' ? 0.5 : 
                           threatLevel === 'high' ? 0.7 : 
                           threatLevel === 'medium' ? 0.8 : 1.0;
    
    const adjustedLimit = Math.floor(baseLimit * threatMultiplier);
    
    const allowed = RateLimiter.checkRateLimit(identifier, adjustedLimit);
    
    if (!allowed) {
      securityMonitor.logEvent('rate_limit_protection_triggered', SecurityLogLevel.ALERT, {
        identifier: identifier.substring(0, 8) + '...',
        action,
        limit: adjustedLimit,
        threatLevel
      });
    }
    
    return allowed;
  };

  const isBlacklisted = (identifier: string): boolean => {
    return RateLimiter.isBlacklisted(identifier);
  };

  const createSecureSession = (userId: string): string => {
    return SessionSecurity.createSecureSession(
      userId, 
      securityLevel,
      userIdentifier
    );
  };

  const validateSession = (sessionId: string): any => {
    return SessionSecurity.validateSession(sessionId, userIdentifier);
  };

  const destroySession = (sessionId: string): void => {
    SessionSecurity.destroySession(sessionId);
  };

  const generateDataChecksum = (data: any, key: string): string => {
    return IntegrityChecker.generateChecksum(data, key);
  };

  const verifyDataIntegrity = (data: any, key: string, checksum?: string): boolean => {
    const isValid = IntegrityChecker.verifyIntegrity(data, key, checksum);
    
    if (!isValid) {
      securityMonitor.logEvent('data_integrity_violation', SecurityLogLevel.CRITICAL, {
        key,
        timestamp: new Date().toISOString()
      });
    }
    
    return isValid;
  };

  const contextValue: ComprehensiveSecurityContextType = {
    validateAndSanitize,
    validateCryptoAddress,
    validateEmail,
    validateTransactionAmount,
    checkRateLimit,
    isBlacklisted,
    createSecureSession,
    validateSession,
    destroySession,
    generateDataChecksum,
    verifyDataIntegrity,
    securityWarnings,
    isUnderAttack,
    threatLevel
  };

  return (
    <ComprehensiveSecurityContext.Provider value={contextValue}>
      {children}
    </ComprehensiveSecurityContext.Provider>
  );
};

export default ComprehensiveSecurityProvider;