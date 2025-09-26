import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ComplianceMetrics {
  kycRequired: boolean;
  amlFlags: string[];
  jurisdictionCheck: boolean;
  transactionMonitoring: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdate: string;
}

interface ComplianceAlert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const ComplianceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    kycRequired: false,
    amlFlags: [],
    jurisdictionCheck: true,
    transactionMonitoring: true,
    riskLevel: 'low',
    lastUpdate: new Date().toISOString(),
  });

  const [alerts, setAlerts] = useState<ComplianceAlert[]>([
    {
      id: '1',
      type: 'info',
      message: 'Compliance monitoring active - all systems operational',
      timestamp: new Date().toISOString(),
      resolved: false,
    }
  ]);

  const [complianceScore, setComplianceScore] = useState(98);

  useEffect(() => {
    const monitorCompliance = async () => {
      try {
        // Simulated compliance monitoring
        const patterns = [
          { pattern: "rapid_transactions", threshold: 10, timeWindow: "1h" },
          { pattern: "large_deposits", threshold: 50000, currency: "USD" },
          { pattern: "sanctioned_address", severity: "critical" },
        ];

        // Check for compliance patterns
        const newAlerts: ComplianceAlert[] = [];
        
        for (const pattern of patterns) {
          const detected = await checkPattern(pattern);
          if (detected) {
            newAlerts.push({
              id: Date.now().toString() + pattern.pattern,
              type: pattern.severity === 'critical' ? 'critical' : 'warning',
              message: `Alert: ${pattern.pattern} detected`,
              timestamp: new Date().toISOString(),
              resolved: false,
            });
            
            if (pattern.severity === 'critical') {
              await fileComplianceReport(pattern);
            }
          }
        }
        
        if (newAlerts.length > 0) {
          setAlerts(prev => [...prev, ...newAlerts]);
        }
        
        // Update metrics
        setMetrics(prev => ({
          ...prev,
          lastUpdate: new Date().toISOString(),
          amlFlags: newAlerts.filter(a => a.type === 'critical').map(a => a.message),
        }));
        
      } catch (error) {
        console.error('Compliance monitoring error:', error);
      }
    };

    const interval = setInterval(monitorCompliance, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkPattern = async (pattern: any): Promise<boolean> => {
    // Simulated pattern detection
    return Math.random() > 0.95; // 5% chance of detection for demo
  };

  const fileComplianceReport = async (incident: any) => {
    console.log('Filing compliance report for:', incident);
    // In production, this would file actual compliance reports
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Compliance Monitoring Dashboard
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time compliance monitoring for Bible.fi platform
          </p>
        </CardHeader>
      </Card>

      {/* Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compliance Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">
              {complianceScore}%
            </div>
            <div className="flex-1">
              <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                  style={{ width: `${complianceScore}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Excellent compliance standing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">KYC Status</span>
            </div>
            <div className={`text-lg font-bold ${
              metrics.kycRequired ? 'text-red-500' : 'text-green-500'
            }`}>
              {metrics.kycRequired ? 'Required' : 'Compliant'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">AML Monitoring</span>
            </div>
            <div className="text-lg font-bold text-green-500">
              Active
            </div>
            <div className="text-xs text-muted-foreground">
              {metrics.amlFlags.length} flags
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Jurisdiction</span>
            </div>
            <div className={`text-lg font-bold ${
              metrics.jurisdictionCheck ? 'text-green-500' : 'text-red-500'
            }`}>
              {metrics.jurisdictionCheck ? 'Verified' : 'Restricted'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Risk Level</span>
            </div>
            <div className={`text-lg font-bold ${getRiskColor(metrics.riskLevel)}`}>
              {metrics.riskLevel.toUpperCase()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.filter(alert => !alert.resolved).map((alert) => (
              <Alert key={alert.id} className={`
                ${alert.type === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''}
                ${alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' : ''}
                ${alert.type === 'info' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : ''}
              `}>
                <div className="flex items-center gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <AlertDescription className="mb-2">
                      {alert.message}
                    </AlertDescription>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {new Date(alert.timestamp).toLocaleString()}
                      </Badge>
                      <Badge variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                        {alert.type}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  >
                    Resolve
                  </button>
                </div>
              </Alert>
            ))}
            
            {alerts.filter(alert => !alert.resolved).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No active compliance alerts</p>
                <p className="text-xs">All systems operating normally</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Biblical Footer */}
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground italic">
          "Let all things be done decently and in order" - 1 Corinthians 14:40
        </p>
      </div>
    </div>
  );
};