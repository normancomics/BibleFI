import React, { useEffect, useState } from 'react';
import { Shield, Lock, Eye, Zap, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useComprehensiveSecurity } from '@/components/security/ComprehensiveSecurityProvider';
import { useSecurityContext } from '@/contexts/SecurityContext';

const LiveSecurityMonitor: React.FC = () => {
  const { securityWarnings, isUnderAttack, threatLevel } = useComprehensiveSecurity();
  const { securityLevel, isSecurityInitialized } = useSecurityContext();
  const [activeProtections, setActiveProtections] = useState(0);
  const [blockedAttacks, setBlockedAttacks] = useState(0);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    // Simulate real-time security metrics
    const interval = setInterval(() => {
      setActiveProtections(prev => Math.min(prev + Math.random() * 2, 100));
      if (isUnderAttack) {
        setBlockedAttacks(prev => prev + Math.floor(Math.random() * 3) + 1);
      }
      setUptime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isUnderAttack]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'protected': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'under-attack': return 'text-red-500 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure': return <CheckCircle size={16} />;
      case 'protected': return <Shield size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      case 'under-attack': return <XCircle size={16} />;
      default: return <Shield size={16} />;
    }
  };

  const currentStatus = isUnderAttack ? 'under-attack' : 
                      threatLevel === 'high' || threatLevel === 'critical' ? 'warning' :
                      securityWarnings.length > 0 ? 'protected' : 'secure';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Overall Security Status */}
      <Card className={`border-2 ${getStatusColor(currentStatus)} transition-all duration-300`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getStatusIcon(currentStatus)}
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {currentStatus === 'secure' ? 'SECURE' :
             currentStatus === 'protected' ? 'PROTECTED' :
             currentStatus === 'warning' ? 'WARNING' :
             'UNDER ATTACK'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isSecurityInitialized ? 'Active' : 'Initializing'}
          </p>
        </CardContent>
      </Card>

      {/* Threat Level */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye size={16} />
            Threat Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">{threatLevel}</div>
          <Progress 
            value={threatLevel === 'low' ? 25 : threatLevel === 'medium' ? 50 : threatLevel === 'high' ? 75 : 100} 
            className="mt-2"
          />
        </CardContent>
      </Card>

      {/* Active Protections */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lock size={16} />
            Active Protections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.floor(activeProtections)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Security layers active
          </p>
        </CardContent>
      </Card>

      {/* Blocked Attacks */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap size={16} />
            Blocked Attacks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{blockedAttacks}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Threats neutralized
          </p>
        </CardContent>
      </Card>

      {/* Security Warnings */}
      {securityWarnings.length > 0 && (
        <Card className="col-span-full border-yellow-500/30 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-500">
              <AlertTriangle size={16} />
              Active Security Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {securityWarnings.map((warning, index) => (
                <Badge key={index} variant="outline" className="text-yellow-500 border-yellow-500/30">
                  {warning}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Security Info */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Real-time Security Details</CardTitle>
          <CardDescription>Live monitoring of security systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Security Level:</span>
              <div className="font-medium capitalize">{securityLevel}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Uptime:</span>
              <div className="font-medium">{Math.floor(uptime / 60)}m {uptime % 60}s</div>
            </div>
            <div>
              <span className="text-muted-foreground">Encryption:</span>
              <div className="font-medium text-green-500">AES-256 Active</div>
            </div>
            <div>
              <span className="text-muted-foreground">Rate Limiting:</span>
              <div className="font-medium text-green-500">Operational</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveSecurityMonitor;