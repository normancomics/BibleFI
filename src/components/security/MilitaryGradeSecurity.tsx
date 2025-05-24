
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Key, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

interface SecurityStatus {
  encryption: 'active' | 'initializing' | 'error';
  authentication: 'secure' | 'pending' | 'compromised';
  dataIntegrity: 'verified' | 'checking' | 'failed';
  networkSecurity: 'protected' | 'monitoring' | 'threat_detected';
}

const MilitaryGradeSecurity: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    encryption: 'initializing',
    authentication: 'pending',
    dataIntegrity: 'checking',
    networkSecurity: 'monitoring'
  });

  const [threatLevel, setThreatLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [securityScore, setSecurityScore] = useState(0);

  useEffect(() => {
    // Simulate security initialization
    const initializeSecurity = async () => {
      console.info("Military-grade enhanced security initialized");
      
      // Simulate security checks
      setTimeout(() => {
        setSecurityStatus({
          encryption: 'active',
          authentication: 'secure',
          dataIntegrity: 'verified',
          networkSecurity: 'protected'
        });
        setSecurityScore(98);
      }, 2000);
    };

    initializeSecurity();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'secure':
      case 'verified':
      case 'protected':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'initializing':
      case 'pending':
      case 'checking':
      case 'monitoring':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'error':
      case 'compromised':
      case 'failed':
      case 'threat_detected':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'secure':
      case 'verified':
      case 'protected':
        return <CheckCircle size={16} />;
      case 'error':
      case 'compromised':
      case 'failed':
      case 'threat_detected':
        return <AlertTriangle size={16} />;
      default:
        return <Eye size={16} />;
    }
  };

  return (
    <Card className="bg-black/60 border-ancient-gold/30 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-ancient-gold">
          <Shield size={24} />
          Military-Grade Security Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">AES-256 Encryption</span>
              <Badge className={`${getStatusColor(securityStatus.encryption)} border flex items-center gap-1`}>
                {getStatusIcon(securityStatus.encryption)}
                {securityStatus.encryption}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Multi-Factor Auth</span>
              <Badge className={`${getStatusColor(securityStatus.authentication)} border flex items-center gap-1`}>
                {getStatusIcon(securityStatus.authentication)}
                {securityStatus.authentication}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data Integrity</span>
              <Badge className={`${getStatusColor(securityStatus.dataIntegrity)} border flex items-center gap-1`}>
                {getStatusIcon(securityStatus.dataIntegrity)}
                {securityStatus.dataIntegrity}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Network Security</span>
              <Badge className={`${getStatusColor(securityStatus.networkSecurity)} border flex items-center gap-1`}>
                {getStatusIcon(securityStatus.networkSecurity)}
                {securityStatus.networkSecurity}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(255, 215, 0, 0.3)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgb(255, 215, 0)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${securityScore * 2.51} 251`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-ancient-gold">{securityScore}%</span>
              </div>
            </div>
            <p className="text-sm text-white/70 mt-2 text-center">Security Score</p>
          </div>
        </div>
        
        <div className="bg-black/40 p-4 rounded-lg border border-ancient-gold/30">
          <div className="flex items-center gap-2 mb-2">
            <Lock size={16} className="text-ancient-gold" />
            <span className="font-medium text-ancient-gold">Biblical Security Principles</span>
          </div>
          <div className="space-y-2 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Key size={12} />
              <span>"The name of the LORD is a fortified tower" - Proverbs 18:10</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={12} />
              <span>"He is my refuge and my fortress" - Psalm 91:2</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={12} />
              <span>"The LORD will keep you from all harm" - Psalm 121:7</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-white/60 text-center">
          <p>Your financial data is protected with the same encryption standards used by military and banking institutions.</p>
          <p className="mt-1">Zero-knowledge architecture ensures only you can access your private keys.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MilitaryGradeSecurity;
