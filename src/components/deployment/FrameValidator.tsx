
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ExternalLink, Copy, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FARCASTER_CONFIG } from '@/farcaster/config';
import PixelButton from '@/components/PixelButton';

interface ValidationResult {
  isValid: boolean;
  message: string;
  recommendation?: string;
}

const FrameValidator: React.FC = () => {
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();
  
  const validateFrame = async () => {
    setIsValidating(true);
    const results: Record<string, ValidationResult> = {};
    
    // Validate frame metadata
    results.metadata = {
      isValid: !!FARCASTER_CONFIG.frameConfig.imageUrl,
      message: FARCASTER_CONFIG.frameConfig.imageUrl ? 
        'Frame image configured' : 'Frame image missing',
      recommendation: !FARCASTER_CONFIG.frameConfig.imageUrl ? 
        'Add a frame image URL to frameConfig' : undefined
    };
    
    // Validate buttons
    results.buttons = {
      isValid: FARCASTER_CONFIG.frameConfig.buttons.length > 0,
      message: `${FARCASTER_CONFIG.frameConfig.buttons.length} buttons configured`,
      recommendation: FARCASTER_CONFIG.frameConfig.buttons.length === 0 ? 
        'Add at least one button to the frame' : undefined
    };
    
    // Validate domain
    results.domain = {
      isValid: !FARCASTER_CONFIG.domain.includes('localhost'),
      message: FARCASTER_CONFIG.domain.includes('localhost') ? 
        'Using localhost domain' : `Domain: ${FARCASTER_CONFIG.domain}`,
      recommendation: FARCASTER_CONFIG.domain.includes('localhost') ? 
        'Update domain for production deployment' : undefined
    };
    
    // Validate frame HTML
    try {
      const response = await fetch('/frame.html');
      results.frameHtml = {
        isValid: response.ok,
        message: response.ok ? 'Frame HTML accessible' : 'Frame HTML not found',
        recommendation: !response.ok ? 'Ensure frame.html exists in public directory' : undefined
      };
    } catch (error) {
      results.frameHtml = {
        isValid: false,
        message: 'Frame HTML check failed',
        recommendation: 'Check frame.html file and server configuration'
      };
    }
    
    // Check Base Chain configuration
    results.baseChain = {
      isValid: !!FARCASTER_CONFIG.rpcUrl && FARCASTER_CONFIG.rpcUrl.includes('base'),
      message: FARCASTER_CONFIG.rpcUrl ? 'Base RPC configured' : 'Base RPC missing',
      recommendation: !FARCASTER_CONFIG.rpcUrl ? 'Configure Base Chain RPC URL' : undefined
    };
    
    setValidationResults(results);
    setIsValidating(false);
    
    const allValid = Object.values(results).every(result => result.isValid);
    toast({
      title: allValid ? 'Frame Validation Passed' : 'Frame Validation Issues Found',
      description: allValid ? 
        'Your Farcaster Frame is ready for deployment!' : 
        'Please review the issues below',
      variant: allValid ? 'default' : 'destructive'
    });
  };
  
  const copyFrameUrl = () => {
    const frameUrl = `${window.location.origin}/frame.html`;
    navigator.clipboard.writeText(frameUrl);
    toast({
      title: 'Frame URL Copied',
      description: 'Ready to share on Farcaster!'
    });
  };
  
  const openFramePreview = () => {
    window.open('/frame.html', '_blank');
  };
  
  return (
    <Card className="border-purple-500/30 bg-purple-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-300">
          <Smartphone className="h-5 w-5" />
          Farcaster Frame Validator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <PixelButton 
            onClick={validateFrame} 
            disabled={isValidating}
            className="flex-1"
            farcasterStyle
          >
            {isValidating ? 'Validating...' : 'Validate Frame'}
          </PixelButton>
          <Button variant="outline" onClick={openFramePreview}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={copyFrameUrl}>
            <Copy className="h-4 w-4 mr-2" />
            Copy URL
          </Button>
        </div>
        
        {Object.keys(validationResults).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Validation Results</h4>
            {Object.entries(validationResults).map(([key, result]) => (
              <div key={key} className="flex items-start gap-2 p-3 border border-white/10 rounded-lg">
                {result.isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className="text-sm text-white/70">{result.message}</div>
                  {result.recommendation && (
                    <div className="text-xs text-yellow-400 mt-1">
                      💡 {result.recommendation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="p-3 bg-black/20 border border-purple-500/20 rounded-lg">
          <h5 className="font-medium mb-2">Frame Info</h5>
          <div className="text-sm space-y-1 text-white/80">
            <div>Domain: {FARCASTER_CONFIG.domain}</div>
            <div>Buttons: {FARCASTER_CONFIG.frameConfig.buttons.length}</div>
            <div>Aspect Ratio: {FARCASTER_CONFIG.frameConfig.aspectRatio}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FrameValidator;
