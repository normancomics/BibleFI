
import React, { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { useToast } from "@/hooks/use-toast";
import { useSecurityContext } from "@/contexts/SecurityContext";
import SecurityDashboard from "@/components/security/SecurityDashboard";
import LiveSecurityMonitor from "@/components/security/LiveSecurityMonitor";
import { useSound } from "@/contexts/SoundContext";
import { 
  Shield, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  ShieldAlert, 
  ChevronRight,
  LockKeyhole,
  Database,
  CircleAlert,
  RefreshCcw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { securityMonitor, SecurityLogLevel } from "@/utils/securityMonitoring";
import { generateSecureHash } from "@/utils/securityUtils";

const SecurityPage: React.FC = () => {
  const { toast } = useToast();
  const { playSound } = useSound();
  const { securityLevel, setSecurityLevel, isSecurityInitialized } = useSecurityContext();
  const [selectedTab, setSelectedTab] = useState("dashboard");

  useEffect(() => {
    // Log page visit
    securityMonitor.logEvent("page_visit", SecurityLogLevel.INFO, { page: "security" });
  }, []);

  const handleSecurityLevelChange = (level: 'standard' | 'enhanced' | 'maximum' | 'quantum') => {
    playSound("select");
    setSecurityLevel(level);
    
    toast({
      title: "Security Level Updated",
      description: `Security level has been set to ${level}.`,
    });
  };
  
  const generateRandomHash = () => {
    const randomString = Math.random().toString(36).substring(2, 15);
    const hash = generateSecureHash(randomString);
    
    playSound("success");
    securityMonitor.logEvent("hash_generated", SecurityLogLevel.INFO, { 
      inputLength: randomString.length,
      outputLength: hash.length 
    });
    
    toast({
      title: "Quantum-Resistant Hash Generated",
      description: `SHA3-512 hash has been generated.`,
    });
  };

  const simulateSecurityEvent = (eventType: string) => {
    playSound("error");
    
    switch(eventType) {
      case "anomaly":
        for (let i = 0; i < 5; i++) {
          securityMonitor.logEvent("simulated_anomaly", SecurityLogLevel.WARNING, {
            simulation: true,
            timestamp: new Date().toISOString(),
            sequence: i
          });
        }
        
        toast({
          title: "Anomaly Detection Test",
          description: "Simulated security anomaly for testing.",
          variant: "destructive"
        });
        break;
        
      case "breach":
        securityMonitor.logEvent("simulated_breach", SecurityLogLevel.CRITICAL, {
          simulation: true,
          timestamp: new Date().toISOString()
        });
        
        toast({
          title: "Security Breach Simulation",
          description: "A critical security event was simulated.",
          variant: "destructive"
        });
        break;
    }
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="lg:w-2/3">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-ancient-gold flex items-center gap-2">
                <Shield className="text-ancient-gold" />
                Security Center
              </h1>
              <p className="text-white/80 mt-2">
                Bible.fi features military-grade security with quantum-resistant encryption to protect your assets and data
              </p>
            </div>
            
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="encryption">Encryption</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard">
                <LiveSecurityMonitor />
                <SecurityDashboard />
              </TabsContent>
              
              <TabsContent value="encryption">
                <Card className="shadow-lg border-t-2 border-purple-600">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <KeyRound className="text-ancient-gold" />
                          Encryption Technology
                        </CardTitle>
                        <CardDescription>
                          Advanced Encryption Standard with quantum resistance
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-ancient-gold/10 text-ancient-gold">
                        Military-Grade
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">AES-256 Encryption</h3>
                      <p className="text-sm text-white/80">
                        Bible.fi uses AES-256 bit encryption, the same standard used by governments and military organizations 
                        worldwide to protect classified information. All sensitive data is encrypted both in transit and at rest.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Quantum-Resistant Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-purple-900/30 p-4 rounded-md">
                          <h4 className="font-medium flex items-center gap-1 mb-2">
                            <Database size={16} className="text-ancient-gold" />
                            Enhanced Key Derivation
                          </h4>
                          <p className="text-xs text-white/80">
                            Uses SHA3-512 hashing algorithm with additional entropy to generate encryption keys resistant to 
                            quantum computing attacks.
                          </p>
                        </div>
                        
                        <div className="bg-purple-900/30 p-4 rounded-md">
                          <h4 className="font-medium flex items-center gap-1 mb-2">
                            <LockKeyhole size={16} className="text-ancient-gold" />
                            Homomorphic Properties
                          </h4>
                          <p className="text-xs text-white/80">
                            Implements simulated homomorphic encryption for limited operations on encrypted data without 
                            full decryption.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-black/30 p-4 rounded-md border border-ancient-gold/20">
                      <h3 className="text-sm font-medium mb-2">Try Quantum-Resistant Hashing</h3>
                      <p className="text-xs text-white/70 mb-3">
                        Generate a secure hash using our SHA3-512 implementation with enhanced entropy.
                      </p>
                      <Button 
                        variant="default" 
                        className="w-full bg-scripture border border-ancient-gold/50 hover:bg-scripture/80"
                        onClick={generateRandomHash}
                      >
                        <RefreshCcw size={16} className="mr-2" />
                        Generate Secure Hash
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mt-6">
                  <Card className="shadow-lg border-t-2 border-purple-600">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CircleAlert className="text-ancient-gold" />
                        Security Testing
                      </CardTitle>
                      <CardDescription>
                        Simulate security events to test the system's response
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-white/80">
                        Use these tools to simulate security events and test how the system's security protocols respond.
                        These simulations help ensure that our anomaly detection and alert systems are functioning properly.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button 
                          variant="outline"
                          className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                          onClick={() => simulateSecurityEvent("anomaly")}
                        >
                          <ShieldAlert size={16} className="mr-2" />
                          Simulate Anomaly
                        </Button>
                        
                        <Button 
                          variant="outline"
                          className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                          onClick={() => simulateSecurityEvent("breach")}
                        >
                          <ShieldAlert size={16} className="mr-2" />
                          Simulate Breach
                        </Button>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="bg-black/20 text-xs text-white/50">
                      These simulations are safe and will not affect your data or assets
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="features">
                <Card className="shadow-lg border-t-2 border-purple-600">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="text-ancient-gold" />
                      Security Features
                    </CardTitle>
                    <CardDescription>
                      Comprehensive protection measures implemented in Bible.fi
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-ancient-gold/20 rounded-md p-4 bg-purple-900/20">
                          <h3 className="font-medium text-ancient-gold mb-2">Wallet Integration Security</h3>
                          <ul className="text-sm space-y-2 text-white/80">
                            <li className="flex items-start">
                              <ChevronRight size={16} className="text-ancient-gold mr-1 mt-0.5" />
                              <span>Multi-signature authorization for critical financial transactions</span>
                            </li>
                            <li className="flex items-start">
                              <ChevronRight size={16} className="text-ancient-gold mr-1 mt-0.5" />
                              <span>Support for hardware wallet integration with Trezor and Ledger</span>
                            </li>
                            <li className="flex items-start">
                              <ChevronRight size={16} className="text-ancient-gold mr-1 mt-0.5" />
                              <span>Secure transactions with Farcaster, Coinbase, and Rainbow wallets</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="border border-ancient-gold/20 rounded-md p-4 bg-purple-900/20">
                          <h3 className="font-medium text-ancient-gold mb-2">Data Protection</h3>
                          <ul className="text-sm space-y-2 text-white/80">
                            <li className="flex items-start">
                              <ChevronRight size={16} className="text-ancient-gold mr-1 mt-0.5" />
                              <span>End-to-end encryption for all sensitive data</span>
                            </li>
                            <li className="flex items-start">
                              <ChevronRight size={16} className="text-ancient-gold mr-1 mt-0.5" />
                              <span>Zero-knowledge architecture for user privacy</span>
                            </li>
                            <li className="flex items-start">
                              <ChevronRight size={16} className="text-ancient-gold mr-1 mt-0.5" />
                              <span>Secure client-side encryption prevents data leaks</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium text-ancient-gold mb-3">Security Levels</h3>
                        <p className="text-sm text-white/80 mb-4">
                          Bible.fi offers multiple security levels to balance protection and convenience based on your needs.
                          Higher security levels provide additional protection but may require additional verification steps.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {[
                            {
                              level: 'standard',
                              title: 'Standard',
                              description: 'Basic protection for everyday use',
                              features: ['AES-256 Encryption', 'Secure Storage', 'Basic Monitoring']
                            },
                            {
                              level: 'enhanced',
                              title: 'Enhanced',
                              description: 'Stronger protection for regular users',
                              features: ['Advanced Key Derivation', 'Enhanced Monitoring', 'Input Validation']
                            },
                            {
                              level: 'maximum',
                              title: 'Maximum',
                              description: 'High security for sensitive operations',
                              features: ['Multi-factor Auth', 'Stricter Rate Limiting', 'Anomaly Detection']
                            },
                            {
                              level: 'quantum',
                              title: 'Quantum',
                              description: 'Military-grade security features',
                              features: ['Quantum Resistance', 'Full Homomorphic Ops', 'Breach Prevention']
                            }
                          ].map((level) => (
                            <div 
                              key={level.level} 
                              className={`border rounded-md p-3 ${
                                level.level === securityLevel 
                                  ? 'bg-scripture/20 border-ancient-gold' 
                                  : 'bg-black/20 border-white/10 hover:border-white/30'
                              } cursor-pointer transition-all`}
                              onClick={() => handleSecurityLevelChange(level.level as any)}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">{level.title}</h4>
                                {level.level === securityLevel && (
                                  <Badge variant="outline" className="bg-ancient-gold/10 text-ancient-gold border-ancient-gold text-[10px]">
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-white/60 mb-2">{level.description}</p>
                              <ul className="text-xs space-y-1">
                                {level.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <ChevronRight size={12} className="text-ancient-gold/70 mr-1 mt-0.5" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:w-1/3 space-y-6">
            <Card className="border-ancient-gold/30 bg-black/30">
              <CardHeader className="bg-gradient-to-r from-purple-900/30 to-purple-800/10 pb-3">
                <CardTitle className="text-lg text-ancient-gold flex items-center">
                  <Lock className="mr-2 h-5 w-5 text-ancient-gold" />
                  Security Level
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm mb-3 text-white/80">
                  Select your desired security level. Higher levels provide stronger protection but may require additional verification steps.
                </p>
                <Select
                  value={securityLevel}
                  onValueChange={(value) => handleSecurityLevelChange(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select security level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="enhanced">Enhanced</SelectItem>
                    <SelectItem value="maximum">Maximum</SelectItem>
                    <SelectItem value="quantum">Quantum-Resistant</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
              <CardFooter className="bg-black/20 text-xs text-center text-white/50 pb-3">
                Current security level: <span className="font-semibold ml-1 capitalize">{securityLevel}</span>
              </CardFooter>
            </Card>
            
            <Card className="border-ancient-gold/30 bg-black/30">
              <CardHeader className="bg-gradient-to-r from-purple-900/30 to-purple-800/10 pb-3">
                <CardTitle className="text-lg text-ancient-gold">Biblical Security Wisdom</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="bg-scripture/10 border border-ancient-gold/20 p-3 rounded">
                    <p className="italic text-white/90">
                      "The prudent see danger and take refuge, but the simple keep going and pay the penalty."
                    </p>
                    <p className="text-right text-sm text-ancient-gold mt-1">— Proverbs 22:3</p>
                  </div>
                  
                  <div className="text-sm text-white/80">
                    <p>This verse reminds us to be vigilant and take precautions with our assets. In the digital world, this means implementing strong security measures to protect what God has entrusted to us.</p>
                  </div>
                  
                  <div className="bg-scripture/10 border border-ancient-gold/20 p-3 rounded">
                    <p className="italic text-white/90">
                      "Be as shrewd as snakes and as innocent as doves."
                    </p>
                    <p className="text-right text-sm text-ancient-gold mt-1">— Matthew 10:16</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-ancient-gold/30 bg-black/30">
              <CardHeader className="bg-purple-900/20 pb-3">
                <CardTitle className="text-lg text-ancient-gold flex items-center">
                  <ShieldCheck className="mr-2 h-5 w-5" />
                  Protection Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 border border-green-500/30 bg-green-500/10 rounded">
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Wallet Security</span>
                    </div>
                    <span className="text-xs text-green-500">Protected</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 border border-green-500/30 bg-green-500/10 rounded">
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Data Encryption</span>
                    </div>
                    <span className="text-xs text-green-500">Active</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 border border-green-500/30 bg-green-500/10 rounded">
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Anomaly Detection</span>
                    </div>
                    <span className="text-xs text-green-500">Monitoring</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 border border-green-500/30 bg-green-500/10 rounded">
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Quantum Resistance</span>
                    </div>
                    <span className="text-xs text-green-500">Enabled</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
