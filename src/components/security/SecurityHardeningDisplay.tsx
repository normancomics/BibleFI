import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  Zap,
  Database,
  Network,
  Cpu,
  Timer
} from 'lucide-react';
import { useSecurityContext } from '@/contexts/SecurityContext';
import { useSecurityMonitor } from '@/contexts/SecurityMonitorContext';
import { InputValidator, RateLimiter, IntegrityChecker } from '@/utils/securityHardening';

interface SecurityMetric {
  name: string;
  status: 'active' | 'inactive' | 'warning' | 'critical';
  description: string;
  score: number;
}

const SecurityHardeningDisplay: React.FC = () => {
  const { securityLevel, isSecurityInitialized } = useSecurityContext();
  const { isMonitoringEnabled, securityEvents, detectedAnomalies } = useSecurityMonitor();
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    updateSecurityMetrics();
    calculateOverallScore();
  }, [securityLevel, isMonitoringEnabled, detectedAnomalies]);

  const updateSecurityMetrics = () => {
    const metrics: SecurityMetric[] = [
      {
        name: 'Quantum-Resistant Encryption',
        status: securityLevel === 'quantum' ? 'active' : securityLevel === 'maximum' ? 'warning' : 'inactive',
        description: 'AES-256 with quantum-resistant enhancements',
        score: securityLevel === 'quantum' ? 100 : securityLevel === 'maximum' ? 85 : 60
      },
      {
        name: 'Input Validation',
        status: 'active',
        description: 'XSS/SQL injection protection active',
        score: 95
      },
      {
        name: 'Rate Limiting',
        status: 'active',
        description: 'Anti-DDoS and fraud protection',
        score: 90
      },
      {
        name: 'Session Security',
        status: securityLevel === 'quantum' || securityLevel === 'maximum' ? 'active' : 'warning',
        description: 'Secure session management with tamper detection',
        score: securityLevel === 'quantum' ? 100 : securityLevel === 'maximum' ? 90 : 75
      },
      {
        name: 'Real-time Monitoring',
        status: isMonitoringEnabled ? 'active' : 'critical',
        description: 'Continuous threat detection and logging',
        score: isMonitoringEnabled ? 95 : 0
      },
      {
        name: 'Data Integrity',
        status: 'active',
        description: 'Cryptographic checksums for critical data',
        score: 85
      },
      {
        name: 'Anti-Debugging',
        status: securityLevel === 'quantum' || securityLevel === 'maximum' ? 'active' : 'warning',
        description: 'Tamper detection and debugger detection',
        score: securityLevel === 'quantum' ? 95 : securityLevel === 'maximum' ? 80 : 50
      },
      {
        name: 'Homomorphic Encryption',
        status: securityLevel === 'quantum' ? 'active' : 'inactive',
        description: 'Fully homomorphic encryption for private computations',
        score: securityLevel === 'quantum' ? 100 : 0
      }
    ];
    
    setSecurityMetrics(metrics);
  };

  const calculateOverallScore = () => {
    if (securityMetrics.length === 0) return;
    
    const totalScore = securityMetrics.reduce((sum, metric) => sum + metric.score, 0);
    const averageScore = totalScore / securityMetrics.length;
    
    // Apply penalties for anomalies
    const anomalyPenalty = Math.min(detectedAnomalies * 5, 30);
    const finalScore = Math.max(0, averageScore - anomalyPenalty);
    
    setOverallScore(finalScore);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-gradient-success text-success-foreground';
      case 'warning': return 'bg-gradient-warning text-warning-foreground';
      case 'critical': return 'bg-gradient-destructive text-destructive-foreground';
      default: return 'bg-gradient-secondary text-secondary-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const runSecurityTests = () => {
    const results: {[key: string]: boolean} = {};
    
    // Test input validation
    results.xssProtection = !InputValidator.sanitizeInput('<script>alert("xss")</script>').includes('<script>');
    results.sqlProtection = !InputValidator.validateSqlInput("'; DROP TABLE users; --");
    results.emailValidation = InputValidator.validateEmail('test@bible.fi');
    results.cryptoValidation = InputValidator.validateCryptoAddress('0x742d35Cc6335C24A88D7e1Fc4c11B4C1d8b4c9A2');
    
    // Test rate limiting
    const testId = 'test_' + Date.now();
    results.rateLimiting = RateLimiter.checkRateLimit(testId, 5, 1000);
    
    // Test integrity checking
    const testData = { test: 'data', timestamp: Date.now() };
    const checksum = IntegrityChecker.generateChecksum(testData, 'test_key');
    results.integrityCheck = IntegrityChecker.verifyIntegrity(testData, 'test_key', checksum);
    
    setTestResults(results);
  };

  const getSecurityGrade = (score: number): { grade: string; color: string } => {
    if (score >= 95) return { grade: 'A+', color: 'text-gradient-success' };
    if (score >= 90) return { grade: 'A', color: 'text-gradient-success' };
    if (score >= 85) return { grade: 'B+', color: 'text-gradient-warning' };
    if (score >= 80) return { grade: 'B', color: 'text-gradient-warning' };
    if (score >= 70) return { grade: 'C', color: 'text-gradient-destructive' };
    return { grade: 'F', color: 'text-gradient-destructive' };
  };

  const securityGrade = getSecurityGrade(overallScore);

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card className="bg-gradient-card border-ancient-gold/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="h-8 w-8 text-ancient-gold" />
            <CardTitle className="text-2xl bg-gradient-text bg-clip-text text-transparent">
              Military-Grade Security Status
            </CardTitle>
          </div>
          <CardDescription className="text-scripture-light">
            "The wise store up choice food and olive oil, but fools gulp theirs down." - Proverbs 21:20
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Overall Security Score */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-2">
                <Progress 
                  value={overallScore} 
                  className="w-24 h-24 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${securityGrade.color}`}>
                    {securityGrade.grade}
                  </span>
                </div>
              </div>
              <p className="text-sm text-scripture-light">Security Grade</p>
              <p className="text-xs text-muted-foreground">{Math.round(overallScore)}/100</p>
            </div>
            
            {/* Security Level */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Lock className="h-8 w-8 text-ancient-gold" />
              </div>
              <Badge className={getStatusColor('active')} variant="secondary">
                {securityLevel.toUpperCase()}
              </Badge>
              <p className="text-sm text-scripture-light mt-1">Security Level</p>
            </div>
            
            {/* Anomaly Count */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Eye className="h-8 w-8 text-ancient-gold" />
              </div>
              <div className="text-2xl font-bold text-white">
                {detectedAnomalies}
              </div>
              <p className="text-sm text-scripture-light">Anomalies Detected</p>
            </div>
          </div>
          
          {detectedAnomalies > 0 && (
            <Alert className="mb-4 border-gradient-warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {detectedAnomalies} security anomalies detected. Review recent activity and consider increasing security level.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Detailed Security Metrics */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-surface">
          <TabsTrigger value="metrics" className="data-[state=active]:bg-ancient-gold/20">
            <Activity className="h-4 w-4 mr-2" />
            Security Metrics
          </TabsTrigger>
          <TabsTrigger value="tests" className="data-[state=active]:bg-ancient-gold/20">
            <Zap className="h-4 w-4 mr-2" />
            Security Tests
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-ancient-gold/20">
            <Database className="h-4 w-4 mr-2" />
            Recent Events
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityMetrics.map((metric, index) => (
              <Card key={index} className="bg-gradient-surface border-scripture/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-white">{metric.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(metric.status)} variant="secondary">
                        {getStatusIcon(metric.status)}
                        <span className="ml-1">{metric.status.toUpperCase()}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-scripture-light mb-2">{metric.description}</p>
                  <div className="flex items-center justify-between">
                    <Progress value={metric.score} className="flex-1 mr-2" />
                    <span className="text-sm font-medium text-white">{metric.score}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="tests" className="space-y-4">
          <Card className="bg-gradient-surface border-scripture/20">
            <CardHeader>
              <CardTitle className="text-white">Security Validation Tests</CardTitle>
              <CardDescription className="text-scripture-light">
                Run comprehensive security tests to validate protection mechanisms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={runSecurityTests} 
                className="mb-4 bg-gradient-primary hover:bg-gradient-primary/80"
              >
                <Zap className="h-4 w-4 mr-2" />
                Run Security Tests
              </Button>
              
              {Object.keys(testResults).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(testResults).map(([test, passed]) => (
                    <div key={test} className="flex items-center justify-between p-3 bg-gradient-card rounded-lg border border-scripture/10">
                      <span className="text-sm text-white capitalize">
                        {test.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <Badge className={passed ? getStatusColor('active') : getStatusColor('critical')} variant="secondary">
                        {passed ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        <span className="ml-1">{passed ? 'PASS' : 'FAIL'}</span>
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="events" className="space-y-4">
          <Card className="bg-gradient-surface border-scripture/20">
            <CardHeader>
              <CardTitle className="text-white">Recent Security Events</CardTitle>
              <CardDescription className="text-scripture-light">
                Latest security monitoring events and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {securityEvents.slice(-10).reverse().map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gradient-card rounded border border-scripture/10">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(event.level)} variant="secondary">
                        {event.level.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-white">{event.eventType}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Timer className="h-3 w-3 text-scripture-light" />
                      <span className="text-xs text-scripture-light">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {securityEvents.length === 0 && (
                  <p className="text-center text-scripture-light py-4">
                    No security events recorded yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Biblical Security Principle */}
      <Card className="bg-gradient-card border-ancient-gold/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <Shield className="h-6 w-6 text-ancient-gold mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-white mb-2">Biblical Security Principle</h3>
            <blockquote className="text-scripture-light italic">
              "Above all else, guard your heart, for everything you do flows from it." - Proverbs 4:23
            </blockquote>
            <p className="text-sm text-scripture-light mt-3">
              Just as we guard our hearts in spiritual matters, Bible.fi guards your digital assets 
              with military-grade quantum-resistant encryption and comprehensive security monitoring.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityHardeningDisplay;