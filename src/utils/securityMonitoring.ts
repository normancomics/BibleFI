
import { generateSecureHash } from './securityUtils';

/**
 * Security Monitoring System for BibleFi
 * Implements runtime security checks and anomaly detection
 */

// Log levels for security events
export enum SecurityLogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ALERT = 'alert',
  CRITICAL = 'critical'
}

// Security events that can be monitored
export type SecurityEvent = {
  timestamp: string;
  eventType: string;
  level: SecurityLogLevel;
  details: any;
  fingerprint?: string;
};

class SecurityMonitor {
  private securityEvents: SecurityEvent[] = [];
  private fingerprintHistory: Set<string> = new Set();
  private anomalyThreshold: number = 3; // Default threshold
  private isMonitoring: boolean = true;
  private lastUserActivity: Date = new Date();
  
  // Initialize security monitoring system
  constructor() {
    this.setupActivityMonitoring();
    console.log('BibleFi Security Monitoring System initialized');
  }
  
  // Log a security event
  public logEvent(
    eventType: string, 
    level: SecurityLogLevel = SecurityLogLevel.INFO, 
    details: any = {}
  ): void {
    if (!this.isMonitoring) return;
    
    const timestamp = new Date().toISOString();
    const eventFingerprint = this.generateEventFingerprint(eventType, details);
    
    const event: SecurityEvent = {
      timestamp,
      eventType,
      level,
      details,
      fingerprint: eventFingerprint
    };
    
    this.securityEvents.push(event);
    this.fingerprintHistory.add(eventFingerprint);
    
    // Log critical events to console
    if (level === SecurityLogLevel.CRITICAL || level === SecurityLogLevel.ALERT) {
      console.warn(`SECURITY ${level.toUpperCase()}: ${eventType}`, details);
    }
    
    // Check for anomalies
    if (this.detectAnomaly(event)) {
      this.handleAnomaly(event);
    }
    
    // Limit the size of the events array
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }
  }
  
  // Generate a fingerprint for an event to detect duplicates
  private generateEventFingerprint(eventType: string, details: any): string {
    const eventString = `${eventType}:${JSON.stringify(details)}`;
    return generateSecureHash(eventString).substring(0, 16);
  }
  
  // Detect unusual patterns or potential attacks
  private detectAnomaly(event: SecurityEvent): boolean {
    // Count similar events in the last minute
    const lastMinute = new Date(Date.now() - 60000).toISOString();
    const similarEvents = this.securityEvents.filter(e => 
      e.eventType === event.eventType && 
      e.timestamp > lastMinute
    );
    
    return similarEvents.length > this.anomalyThreshold;
  }
  
  // Handle detected anomalies
  private handleAnomaly(event: SecurityEvent): void {
    // Disable anomaly handling to prevent recursive logging
    return;
  }
  
  // Calculate event frequency
  private getEventFrequency(eventType: string): number {
    const eventsOfType = this.securityEvents.filter(e => e.eventType === eventType);
    const oldestEvent = eventsOfType[0]?.timestamp;
    
    if (!oldestEvent || eventsOfType.length <= 1) return 0;
    
    const oldestTime = new Date(oldestEvent).getTime();
    const timeSpanMs = Date.now() - oldestTime;
    const timeSpanMinutes = timeSpanMs / 60000;
    
    return eventsOfType.length / (timeSpanMinutes || 1);
  }
  
  // Set up monitoring for user activity to detect unusual patterns
  private setupActivityMonitoring(): void {
    if (typeof window !== 'undefined') {
      const updateActivity = () => {
        this.lastUserActivity = new Date();
      };
      
      window.addEventListener('mousemove', updateActivity);
      window.addEventListener('keydown', updateActivity);
      window.addEventListener('click', updateActivity);
      window.addEventListener('touchstart', updateActivity);
      
      // Check for suspiciously rapid interactions
      let clickCounter = 0;
      window.addEventListener('click', () => {
        clickCounter++;
        setTimeout(() => clickCounter--, 1000);
        
        if (clickCounter > 10) {
          this.logEvent('rapid_interaction_detected', SecurityLogLevel.WARNING, { 
            clicks: clickCounter 
          });
        }
      });
    }
  }
  
  // Get inactivity time in seconds
  public getInactivityTime(): number {
    return (new Date().getTime() - this.lastUserActivity.getTime()) / 1000;
  }
  
  // Get security log for analysis
  public getSecurityLog(): SecurityEvent[] {
    return [...this.securityEvents];
  }
  
  // Set anomaly detection threshold
  public setAnomalyThreshold(threshold: number): void {
    this.anomalyThreshold = Math.max(1, threshold); // Minimum threshold is 1
  }
  
  // Pause or resume monitoring
  public toggleMonitoring(enable: boolean): void {
    this.isMonitoring = enable;
    this.logEvent(
      enable ? 'security_monitoring_enabled' : 'security_monitoring_disabled',
      SecurityLogLevel.INFO
    );
  }
  
  // Clear security log
  public clearLog(): void {
    this.securityEvents = [];
    this.fingerprintHistory.clear();
  }
}

// Create singleton instance
export const securityMonitor = new SecurityMonitor();

// Utility functions
export const monitorWalletActivity = (walletAddress: string, action: string): void => {
  securityMonitor.logEvent('wallet_activity', SecurityLogLevel.INFO, { 
    address: walletAddress,
    action
  });
};

export const monitorApiCall = (endpoint: string, method: string, statusCode: number): void => {
  securityMonitor.logEvent('api_call', 
    statusCode >= 400 ? SecurityLogLevel.WARNING : SecurityLogLevel.INFO, 
    { endpoint, method, statusCode }
  );
};

export const detectSuspiciousActivity = (
  activityType: string, 
  details: any
): boolean => {
  // Log the activity
  securityMonitor.logEvent(`suspicious_activity_check:${activityType}`, SecurityLogLevel.INFO, details);
  
  // Implement basic heuristics for suspicious activities
  switch(activityType) {
    case 'transaction':
      const { amount, destination } = details;
      // Flag unusually large transactions
      if (amount > 1000) {
        securityMonitor.logEvent('large_transaction', SecurityLogLevel.WARNING, details);
        return true;
      }
      break;
      
    case 'login':
      const { location, device, time } = details;
      // Flag logins from unusual locations or at unusual times
      const hour = new Date(time).getHours();
      if (hour >= 0 && hour <= 5) {
        securityMonitor.logEvent('unusual_login_time', SecurityLogLevel.WARNING, details);
        return true;
      }
      break;
      
    case 'api_usage':
      const { frequency, endpoints } = details;
      // Flag rapid API calls
      if (frequency > 10) {
        securityMonitor.logEvent('api_rate_limit', SecurityLogLevel.WARNING, details);
        return true;
      }
      break;
  }
  
  return false;
};

export default securityMonitor;
