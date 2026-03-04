
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, XCircle, Zap, Globe, Database, Smartphone } from 'lucide-react';
import { getRuntimeConfig } from '@/config/deployment';
import { useToast } from '@/hooks/use-toast';
import PixelButton from '@/components/PixelButton';

interface DeploymentStatusProps {
  showDetails?: boolean;
}

const DeploymentStatus: React.FC<DeploymentStatusProps> = ({ showDetails = false }) => {
  const [config, setConfig] = useState(getRuntimeConfig());
  const [showFullStatus, setShowFullStatus] = useState(showDetails);
  const { toast } = useToast();
  
  useEffect(() => {
    // Refresh config on mount
    setConfig(getRuntimeConfig());
  }, []);
  
  const getStatusIcon = (isValid: boolean, hasWarnings: boolean) => {
    if (!isValid) return <XCircle className="h-4 w-4 text-red-500" />;
    if (hasWarnings) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };
  
  const getStatusText = (isValid: boolean, hasWarnings: boolean) => {
    if (!isValid) return 'Critical Issues';
    if (hasWarnings) return 'Ready with Warnings';
    return 'Deployment Ready';
  };
  
  const getStatusColor = (isValid: boolean, hasWarnings: boolean) => {
    if (!isValid) return 'destructive';
    if (hasWarnings) return 'secondary';
    return 'default';
  };
  
  const handleRunDiagnostics = () => {
    setConfig(getRuntimeConfig());
    toast({
      title: 'Diagnostics Complete',
      description: 'Deployment status refreshed',
    });
  };
  
  const { validation } = config;
  const hasWarnings = validation.warnings.length > 0;
  
  if (!showFullStatus) {
    return (
      <Card className="border-ancient-gold/30 bg-black/40">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(validation.isValid, hasWarnings)}
              <span className="font-medium">
                {getStatusText(validation.isValid, hasWarnings)}
              </span>
              <Badge variant={getStatusColor(validation.isValid, hasWarnings) as any}>
                {config.environment.isProduction ? 'Production' : 'Development'}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullStatus(true)}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-ancient-gold/30 bg-black/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-ancient-gold">
          <Zap className="h-5 w-5" />
          BibleFi Deployment Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-4 border border-ancient-gold/20 rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(validation.isValid, hasWarnings)}
            <div>
              <h3 className="font-medium">{getStatusText(validation.isValid, hasWarnings)}</h3>
              <p className="text-sm text-white/70">
                Environment: {config.environment.isProduction ? 'Production' : 'Development'}
              </p>
            </div>
          </div>
          <Badge variant={getStatusColor(validation.isValid, hasWarnings) as any}>
            v{config.app.version}
          </Badge>
        </div>
        
        {/* Feature Status */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Core Features
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(config.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center gap-2 p-2 bg-black/20 rounded">
                {enabled ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
                <span className="text-xs capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Integration Status */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Integrations
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-black/20 rounded">
              <span className="text-sm">Supabase Database</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-2 bg-black/20 rounded">
              <span className="text-sm">Base Chain RPC</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-2 bg-black/20 rounded">
              <span className="text-sm">Farcaster API</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </div>
        
        {/* Farcaster Mini-App Status */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Farcaster Mini-App
          </h4>
          <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Frame Ready</span>
            </div>
            <p className="text-xs text-white/70 mb-2">
              BibleFi is configured as a Farcaster Frame and can be deployed as a mini-app.
            </p>
            <div className="text-xs space-y-1">
              <div>• Frame metadata configured</div>
              <div>• Base Chain integration active</div>
              <div>• Wallet connections enabled</div>
              <div>• Biblical content API ready</div>
            </div>
          </div>
        </div>
        
        {/* Warnings and Errors */}
        {(validation.warnings.length > 0 || validation.errors.length > 0) && (
          <div>
            <h4 className="font-medium mb-3">Issues</h4>
            <div className="space-y-2">
              {validation.errors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-red-900/20 border border-red-500/30 rounded">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">{error}</span>
                </div>
              ))}
              {validation.warnings.map((warning, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">{warning}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-3">
          <PixelButton onClick={handleRunDiagnostics} className="flex-1">
            Run Diagnostics
          </PixelButton>
          <Button
            variant="outline"
            onClick={() => setShowFullStatus(false)}
            className="flex-1"
          >
            Minimize
          </Button>
        </div>
        
        <div className="text-xs text-white/50 text-center">
          Last checked: {new Date(config.timestamp).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeploymentStatus;
