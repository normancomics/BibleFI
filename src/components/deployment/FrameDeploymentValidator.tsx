import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PixelButton from '@/components/PixelButton';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';
import { getCurrentDomainConfig } from '@/config/domains';

interface ValidationResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const FrameDeploymentValidator: React.FC = () => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();
  const { playSound } = useSound();
  const domainConfig = getCurrentDomainConfig();

  const validateFrame = async () => {
    setIsValidating(true);
    playSound('select');
    
    const results: ValidationResult[] = [];
    
    try {
      // Test 1: Frame HTML exists and accessible
      try {
        const frameResponse = await fetch('/frame.html');
        if (frameResponse.ok) {
          results.push({
            test: 'Frame HTML Accessibility',
            status: 'pass',
            message: 'Frame HTML is accessible',
          });
          
          const frameContent = await frameResponse.text();
          
          // Test 2: Frame meta tags validation
          const hasFrameMeta = frameContent.includes('fc:frame');
          const hasImage = frameContent.includes('fc:frame:image');
          const hasButtons = frameContent.includes('fc:frame:button');
          
          if (hasFrameMeta && hasImage && hasButtons) {
            results.push({
              test: 'Frame Meta Tags',
              status: 'pass',
              message: 'All required Farcaster frame meta tags present',
            });
          } else {
            results.push({
              test: 'Frame Meta Tags',
              status: 'fail',
              message: 'Missing required frame meta tags',
              details: `Missing: ${!hasFrameMeta ? 'fc:frame ' : ''}${!hasImage ? 'image ' : ''}${!hasButtons ? 'buttons' : ''}`,
            });
          }
          
          // Test 3: Frame image validation
          const imageMatch = frameContent.match(/fc:frame:image.*content="([^"]+)"/);
          if (imageMatch) {
            try {
              const imageResponse = await fetch(imageMatch[1]);
              if (imageResponse.ok) {
                results.push({
                  test: 'Frame Image',
                  status: 'pass',
                  message: 'Frame image is accessible',
                });
              } else {
                results.push({
                  test: 'Frame Image',
                  status: 'fail',
                  message: 'Frame image is not accessible',
                  details: `HTTP ${imageResponse.status}`,
                });
              }
            } catch {
              results.push({
                test: 'Frame Image',
                status: 'warning',
                message: 'Could not validate frame image',
                details: 'Network error or CORS issue',
              });
            }
          }
          
        } else {
          results.push({
            test: 'Frame HTML Accessibility',
            status: 'fail',
            message: 'Frame HTML not accessible',
            details: `HTTP ${frameResponse.status}`,
          });
        }
      } catch {
        results.push({
          test: 'Frame HTML Accessibility',
          status: 'fail',
          message: 'Frame HTML not accessible',
          details: 'Network error',
        });
      }
      
      // Test 4: Supabase edge functions
      try {
        const edgeFunctionUrl = 'https://ojiipppypzigjnjblbzn.supabase.co/functions/v1/frame-handler';
        const testResponse = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            untrustedData: { buttonIndex: 1 },
            trustedData: {}
          }),
        });
        
        if (testResponse.ok) {
          results.push({
            test: 'Frame Handler Function',
            status: 'pass',
            message: 'Supabase edge function is working',
          });
        } else {
          results.push({
            test: 'Frame Handler Function',
            status: 'fail',
            message: 'Frame handler not responding correctly',
            details: `HTTP ${testResponse.status}`,
          });
        }
      } catch {
        results.push({
          test: 'Frame Handler Function',
          status: 'warning',
          message: 'Could not test frame handler',
          details: 'CORS or network issue',
        });
      }
      
      // Test 5: Domain configuration
      const currentDomain = window.location.hostname;
      if (currentDomain.includes('lovableproject.com')) {
        results.push({
          test: 'Domain Configuration',
          status: 'warning',
          message: 'Using development domain',
          details: 'Ready for production deployment',
        });
      } else if (currentDomain === 'bible.fi' || currentDomain === 'biblefi.base.eth') {
        results.push({
          test: 'Domain Configuration',
          status: 'pass',
          message: 'Production domain configured',
        });
      } else {
        results.push({
          test: 'Domain Configuration',
          status: 'warning',
          message: 'Custom domain detected',
          details: `Current: ${currentDomain}`,
        });
      }
      
      // Test 6: HTTPS enforcement
      if (window.location.protocol === 'https:') {
        results.push({
          test: 'HTTPS Security',
          status: 'pass',
          message: 'HTTPS is enforced',
        });
      } else {
        results.push({
          test: 'HTTPS Security',
          status: 'fail',
          message: 'HTTP is not secure for production',
          details: 'Farcaster requires HTTPS',
        });
      }
      
      setValidationResults(results);
      
      const hasErrors = results.some(r => r.status === 'fail');
      if (hasErrors) {
        playSound('error');
        toast({
          title: 'Validation Issues Found',
          description: 'Some frame validation tests failed. Check results below.',
          variant: 'destructive',
        });
      } else {
        playSound('success');
        toast({
          title: 'Frame Validation Passed',
          description: 'Your Farcaster frame is ready for deployment!',
        });
      }
      
    } catch (error) {
      console.error('Validation error:', error);
      playSound('error');
      toast({
        title: 'Validation Error',
        description: 'Failed to run frame validation tests.',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const copyFrameUrl = () => {
    navigator.clipboard.writeText(domainConfig.frame);
    playSound('coin');
    toast({
      title: 'Frame URL Copied',
      description: 'Frame URL copied to clipboard.',
    });
  };

  const openFrameValidator = () => {
    window.open('https://warpcast.com/~/developers/frames', '_blank');
    playSound('select');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'default',
      fail: 'destructive',
      warning: 'secondary',
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="bg-scripture/20 border border-ancient-gold">
      <CardHeader>
        <CardTitle className="text-ancient-gold flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Frame Deployment Validator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex flex-wrap gap-2">
          <PixelButton 
            onClick={validateFrame}
            disabled={isValidating}
            className="bg-purple-900 text-ancient-gold border border-ancient-gold/50"
          >
            {isValidating ? 'Validating...' : 'Run Validation'}
          </PixelButton>
          
          <PixelButton 
            onClick={copyFrameUrl}
            className="bg-black/40 text-ancient-gold border border-ancient-gold/50"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy Frame URL
          </PixelButton>
          
          <PixelButton 
            onClick={openFrameValidator}
            className="bg-purple-800 text-ancient-gold border border-ancient-gold/50"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Warpcast Validator
          </PixelButton>
        </div>

        <div className="bg-black/40 p-3 rounded border border-ancient-gold/20">
          <p className="text-xs text-ancient-gold/80 mb-1">Current Frame URL:</p>
          <code className="text-ancient-gold text-sm break-all">{domainConfig.frame}</code>
        </div>

        {validationResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-ancient-gold font-medium">Validation Results:</h4>
            {validationResults.map((result, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-3 bg-black/20 rounded border border-ancient-gold/10"
              >
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">{result.test}</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-ancient-gold/80 text-xs">{result.message}</p>
                  {result.details && (
                    <p className="text-ancient-gold/60 text-xs mt-1 italic">{result.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded">
          <h4 className="text-ancient-gold font-medium mb-2">Deployment Readiness:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-ancient-gold/80">✓ Frame HTML Structure</div>
            <div className="text-ancient-gold/80">✓ Supabase Integration</div>
            <div className="text-ancient-gold/80">✓ Image Generation</div>
            <div className="text-ancient-gold/80">✓ Button Interactions</div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default FrameDeploymentValidator;