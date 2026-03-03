
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Check, X, Eye, EyeOff, RefreshCw, Trash2 } from 'lucide-react';
import { useSecurityMonitor } from '@/contexts/SecurityMonitorContext';
import { useSecurityContext } from '@/contexts/SecurityContext';
import { SecurityLogLevel, SecurityEvent } from '@/utils/securityMonitoring';
import { format } from 'date-fns';

const SecurityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    isMonitoringEnabled,
    enableMonitoring,
    disableMonitoring,
    securityEvents,
    clearSecurityLog,
    detectedAnomalies,
    lastAnomalyTimestamp
  } = useSecurityMonitor();
  
  const { securityLevel } = useSecurityContext();
  
  // Filter events by level
  const criticalEvents = securityEvents.filter(e => e.level === SecurityLogLevel.CRITICAL);
  const alertEvents = securityEvents.filter(e => e.level === SecurityLogLevel.ALERT);
  const warningEvents = securityEvents.filter(e => e.level === SecurityLogLevel.WARNING);
  
  const getSecurityStatus = () => {
    if (criticalEvents.length > 0) return 'critical';
    if (alertEvents.length > 0) return 'alert';
    if (warningEvents.length > 0) return 'warning';
    return 'secure';
  };
  
  const securityStatus = getSecurityStatus();
  
  const formatEventTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch (e) {
      return timestamp;
    }
  };
  
  const getLevelBadge = (level: SecurityLogLevel) => {
    switch(level) {
      case SecurityLogLevel.CRITICAL:
        return <Badge variant="destructive">Critical</Badge>;
      case SecurityLogLevel.ALERT:
        return <Badge variant="destructive" className="bg-amber-500">Alert</Badge>;
      case SecurityLogLevel.WARNING:
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500">Warning</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500">Info</Badge>;
    }
  };
  
  const getSecurityLevelBadge = (level: string) => {
    switch(level) {
      case 'quantum':
        return <Badge variant="outline" className="bg-purple-500/20 text-purple-500 border-purple-500">Quantum</Badge>;
      case 'maximum':
        return <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500">Maximum</Badge>;
      case 'enhanced':
        return <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500">Enhanced</Badge>;
      case 'standard':
        return <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500">Standard</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card className="shadow-lg border-t-2 border-purple-600">
      <CardHeader className="bg-gradient-to-r from-purple-900/30 to-purple-800/10 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield size={18} className="text-purple-400" />
              Security Dashboard
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Monitor security status and threats
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getSecurityLevelBadge(securityLevel)}
            {isMonitoringEnabled ? (
              <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500">
                <Eye size={12} className="mr-1" /> Monitoring Active
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-500/20 text-gray-500 border-gray-500">
                <EyeOff size={12} className="mr-1" /> Monitoring Paused
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 pt-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events Log</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="p-0">
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-md ${
                securityStatus === 'secure' ? 'bg-green-500/10 border border-green-500/30' :
                securityStatus === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                securityStatus === 'alert' ? 'bg-amber-500/10 border border-amber-500/30' :
                'bg-red-500/10 border border-red-500/30'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Security Status</h3>
                  {securityStatus === 'secure' ? (
                    <Check size={18} className="text-green-500" />
                  ) : securityStatus === 'warning' ? (
                    <AlertTriangle size={18} className="text-yellow-500" />
                  ) : (
                    <AlertTriangle size={18} className="text-red-500" />
                  )}
                </div>
                <p className={`text-lg font-semibold ${
                  securityStatus === 'secure' ? 'text-green-500' :
                  securityStatus === 'warning' ? 'text-yellow-500' :
                  securityStatus === 'alert' ? 'text-amber-500' :
                  'text-red-500'
                }`}>
                  {securityStatus === 'secure' ? 'Secure' :
                   securityStatus === 'warning' ? 'Warning' :
                   securityStatus === 'alert' ? 'Alert' :
                   'Critical'}
                </p>
              </div>
              
              <div className="p-4 rounded-md bg-blue-500/10 border border-blue-500/30">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Events Monitored</h3>
                  <RefreshCw size={16} className="text-blue-500" />
                </div>
                <p className="text-lg font-semibold text-blue-500">{securityEvents.length}</p>
              </div>
              
              <div className="p-4 rounded-md bg-purple-500/10 border border-purple-500/30">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Anomalies Detected</h3>
                  <AlertTriangle size={16} className="text-purple-500" />
                </div>
                <p className="text-lg font-semibold text-purple-500">{detectedAnomalies}</p>
                {lastAnomalyTimestamp && (
                  <p className="text-xs text-purple-400 mt-1">
                    Last: {formatEventTime(lastAnomalyTimestamp)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Recent Events</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {securityEvents.slice(-5).reverse().map((event, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border border-gray-200 rounded bg-gray-50 dark:bg-gray-900/50 dark:border-gray-800">
                    <div className="flex items-center space-x-2">
                      {getLevelBadge(event.level)}
                      <span className="text-sm font-medium">{event.eventType}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatEventTime(event.timestamp)}
                    </span>
                  </div>
                ))}
                
                {securityEvents.length === 0 && (
                  <div className="text-center p-4 text-muted-foreground">
                    No security events recorded
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="events" className="p-0">
          <CardContent className="pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Security Event Log</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearSecurityLog}
                className="flex items-center gap-1"
              >
                <Trash2 size={14} />
                Clear Log
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {securityEvents.length > 0 ? (
                [...securityEvents].reverse().map((event, idx) => (
                  <div key={idx} className="p-2 border border-gray-200 rounded bg-gray-50 dark:bg-gray-900/50 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        {getLevelBadge(event.level)}
                        <span className="font-medium">{event.eventType}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatEventTime(event.timestamp)}
                      </span>
                    </div>
                    
                    {Object.keys(event.details).length > 0 && (
                      <div className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                        <pre className="text-xs whitespace-pre-wrap">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-md">
                  No security events to display
                </div>
              )}
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="settings" className="p-0">
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Security Monitoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable security monitoring for this session
                  </p>
                </div>
                <Button
                  variant={isMonitoringEnabled ? "outline" : "default"}
                  onClick={() => isMonitoringEnabled ? disableMonitoring() : enableMonitoring()}
                  size="sm"
                >
                  {isMonitoringEnabled ? (
                    <><EyeOff size={16} className="mr-2" /> Disable</>
                  ) : (
                    <><Eye size={16} className="mr-2" /> Enable</>
                  )}
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Current Security Level</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['standard', 'enhanced', 'maximum', 'quantum'].map((level) => (
                    <div key={level} className={`p-3 text-center rounded-md border ${
                      level === securityLevel ? 
                        'bg-purple-500/10 border-purple-500' : 
                        'border-gray-200 dark:border-gray-700'
                    }`}>
                      <p className={`text-sm font-semibold capitalize ${
                        level === securityLevel ? 'text-purple-500' : ''
                      }`}>
                        {level}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * You can change the security level in the main app settings
                </p>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="bg-gray-50 dark:bg-gray-900/30 text-xs text-muted-foreground">
        BibleFi Security System - Military-grade protection with quantum resistance
      </CardFooter>
    </Card>
  );
};

export default SecurityDashboard;
