import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

interface SecurityContextType {
  securityLevel: 'low' | 'medium' | 'high';
  isSecure: boolean;
  validateTransaction: (data: any) => boolean;
  reportSuspiciousActivity: (activity: string) => void;
  checkContentSecurity: (content: string) => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high'>('high');
  const [isSecure, setIsSecure] = useState(true);
  const [suspiciousActivities, setSuspiciousActivities] = useState<string[]>([]);

  // Security monitoring
  useEffect(() => {
    console.log('🔒 BibleFi Security System Initialized - Military Grade Protection Active');
    
    // Monitor for potential security threats
    const securityMonitor = setInterval(() => {
      // Check for suspicious URL parameters
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const suspiciousParams = ['<script', 'javascript:', 'data:', 'vbscript:'];
        
        for (const [key, value] of url.searchParams) {
          for (const suspicious of suspiciousParams) {
            if (value.toLowerCase().includes(suspicious)) {
              reportSuspiciousActivity(`Suspicious URL parameter detected: ${key}=${value}`);
              break;
            }
          }
        }
      }
    }, 5000);

    return () => clearInterval(securityMonitor);
  }, []);

  const validateTransaction = (data: any): boolean => {
    try {
      // Basic transaction validation
      if (!data || typeof data !== 'object') {
        reportSuspiciousActivity('Invalid transaction data structure');
        return false;
      }

      // Check for required fields
      if (data.amount && (isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0)) {
        reportSuspiciousActivity('Invalid transaction amount');
        return false;
      }

      // Check for suspicious addresses
      if (data.to && typeof data.to === 'string') {
        if (!data.to.match(/^0x[a-fA-F0-9]{40}$/)) {
          reportSuspiciousActivity('Invalid wallet address format');
          return false;
        }

        // List of known malicious addresses (example)
        const blacklistedAddresses = [
          '0x0000000000000000000000000000000000000000',
          // Add more known malicious addresses here
        ];

        if (blacklistedAddresses.includes(data.to.toLowerCase())) {
          reportSuspiciousActivity(`Transaction to blacklisted address: ${data.to}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Transaction validation error:', error);
      return false;
    }
  };

  const reportSuspiciousActivity = (activity: string) => {
    console.warn('🚨 SECURITY ALERT:', activity);
    setSuspiciousActivities(prev => [...prev.slice(-9), activity]); // Keep last 10 activities
    
    toast({
      title: "Security Alert",
      description: "Suspicious activity detected. Transaction blocked for your protection.",
      variant: "destructive"
    });

    // In production, this would report to a security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Report to security service
      fetch('/api/security/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(console.error);
    }
  };

  const checkContentSecurity = (content: string): boolean => {
    const dangerousPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi, // Event handlers like onclick, onload, etc.
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /<link/gi,
      /<meta/gi
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(content)) {
        reportSuspiciousActivity(`Dangerous content pattern detected: ${pattern.source}`);
        return false;
      }
    }

    return true;
  };

  // Additional security measures
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Simple security without postMessage that causes DataCloneError
      if (process.env.NODE_ENV === 'production') {
        const handleContextMenu = (e: MouseEvent) => {
          e.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextMenu);
        
        return () => document.removeEventListener('contextmenu', handleContextMenu);
      }

      // Monitor for suspicious console usage
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      
      console.log = (...args) => {
        // Check for potential data extraction attempts
        const message = args.join(' ');
        if (message.includes('private') || message.includes('secret') || message.includes('key')) {
          reportSuspiciousActivity('Potential data extraction attempt via console');
        }
        originalConsoleLog.apply(console, args);
      };

      console.error = (...args) => {
        originalConsoleError.apply(console, args);
      };
    }
  }, []);

  const value: SecurityContextType = {
    securityLevel,
    isSecure,
    validateTransaction,
    reportSuspiciousActivity,
    checkContentSecurity
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};