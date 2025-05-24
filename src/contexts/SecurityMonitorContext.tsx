
import React, { createContext, useContext, useState, useEffect } from 'react';
import securityMonitor, { SecurityEvent, SecurityLogLevel } from '@/utils/securityMonitoring';
import { useSecurityContext } from '@/contexts/SecurityContext';

interface SecurityMonitorContextType {
  enableMonitoring: () => void;
  disableMonitoring: () => void;
  isMonitoringEnabled: boolean;
  securityEvents: SecurityEvent[];
  clearSecurityLog: () => void;
  setThreshold: (threshold: number) => void;
  threshold: number;
  detectedAnomalies: number;
  lastAnomalyTimestamp: string | null;
}

const defaultValues: SecurityMonitorContextType = {
  enableMonitoring: () => {},
  disableMonitoring: () => {},
  isMonitoringEnabled: true,
  securityEvents: [],
  clearSecurityLog: () => {},
  setThreshold: () => {},
  threshold: 3,
  detectedAnomalies: 0,
  lastAnomalyTimestamp: null
};

const SecurityMonitorContext = createContext<SecurityMonitorContextType>(defaultValues);

export const useSecurityMonitor = () => useContext(SecurityMonitorContext);

export const SecurityMonitorProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState<boolean>(true);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [threshold, setThreshold] = useState<number>(3);
  const [detectedAnomalies, setDetectedAnomalies] = useState<number>(0);
  const [lastAnomalyTimestamp, setLastAnomalyTimestamp] = useState<string | null>(null);
  
  const { securityLevel } = useSecurityContext();
  
  useEffect(() => {
    // Adjust monitoring threshold based on security level
    let newThreshold = 3; // default
    
    switch(securityLevel) {
      case 'standard':
        newThreshold = 5;
        break;
      case 'enhanced':
        newThreshold = 3;
        break;
      case 'maximum':
        newThreshold = 2;
        break;
      case 'quantum':
        newThreshold = 1;
        break;
    }
    
    setThreshold(newThreshold);
    securityMonitor.setAnomalyThreshold(newThreshold);
  }, [securityLevel]);
  
  useEffect(() => {
    // Poll security events periodically
    const intervalId = setInterval(() => {
      if (isMonitoringEnabled) {
        const events = securityMonitor.getSecurityLog();
        setSecurityEvents(events);
        
        // Count anomalies
        const anomalies = events.filter(e => 
          e.eventType === 'security_anomaly_detected' ||
          e.level === SecurityLogLevel.ALERT ||
          e.level === SecurityLogLevel.CRITICAL
        );
        
        setDetectedAnomalies(anomalies.length);
        
        // Set last anomaly timestamp
        if (anomalies.length > 0) {
          const sorted = [...anomalies].sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setLastAnomalyTimestamp(sorted[0].timestamp);
        }
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [isMonitoringEnabled]);
  
  const enableMonitoring = () => {
    securityMonitor.toggleMonitoring(true);
    setIsMonitoringEnabled(true);
  };
  
  const disableMonitoring = () => {
    securityMonitor.toggleMonitoring(false);
    setIsMonitoringEnabled(false);
  };
  
  const clearSecurityLog = () => {
    securityMonitor.clearLog();
    setSecurityEvents([]);
    setDetectedAnomalies(0);
    setLastAnomalyTimestamp(null);
  };
  
  const updateThreshold = (newThreshold: number) => {
    securityMonitor.setAnomalyThreshold(newThreshold);
    setThreshold(newThreshold);
  };
  
  const value = {
    enableMonitoring,
    disableMonitoring,
    isMonitoringEnabled,
    securityEvents,
    clearSecurityLog,
    setThreshold: updateThreshold,
    threshold,
    detectedAnomalies,
    lastAnomalyTimestamp,
  };
  
  return (
    <SecurityMonitorContext.Provider value={value}>
      {children}
    </SecurityMonitorContext.Provider>
  );
};

export default SecurityMonitorProvider;
