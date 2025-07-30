import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, Key, Calculator, Zap, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  advancedHomomorphicOperations, 
  QuantumResistantSigner, 
  ZKProofSystem,
  SecureMultiPartyComputation,
  generateSecureHash 
} from '@/utils/securityUtils';

export const QuantumEncryptionDemo: React.FC = () => {
  const { toast } = useToast();
  const [fheValue1, setFheValue1] = useState('100');
  const [fheValue2, setFheValue2] = useState('200');
  const [encryptedValue1, setEncryptedValue1] = useState<string>('');
  const [encryptedValue2, setEncryptedValue2] = useState<string>('');
  const [homomorphicResult, setHomomorphicResult] = useState<string>('');
  const [decryptedResult, setDecryptedResult] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [signer] = useState(() => new QuantumResistantSigner());
  const [signatureData, setSignatureData] = useState('');
  const [signature, setSignature] = useState('');
  const [zkSecret, setZkSecret] = useState('');
  const [zkProof, setZkProof] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [quantumHash, setQuantumHash] = useState('');

  const demonstrateFHE = async () => {
    setLoading(true);
    try {
      // Encrypt both values
      const enc1 = await advancedHomomorphicOperations.encryptNumber(Number(fheValue1));
      const enc2 = await advancedHomomorphicOperations.encryptNumber(Number(fheValue2));
      
      setEncryptedValue1(enc1);
      setEncryptedValue2(enc2);
      
      // Perform homomorphic addition without decrypting
      const result = await advancedHomomorphicOperations.homomorphicAdd(enc1, enc2);
      setHomomorphicResult(result);
      
      // Decrypt the result to verify
      const decrypted = await advancedHomomorphicOperations.decryptNumber(result);
      setDecryptedResult(decrypted);
      
      toast({
        title: "FHE Operation Complete",
        description: `Computed ${fheValue1} + ${fheValue2} = ${decrypted} without ever decrypting the operands!`,
      });
    } catch (error) {
      toast({
        title: "FHE Error",
        description: "Failed to perform homomorphic operation",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const generateQuantumSignature = () => {
    if (!signatureData) return;
    
    const sig = signer.sign(signatureData);
    setSignature(sig);
    
    toast({
      title: "Quantum-Resistant Signature Generated",
      description: "Data signed with lattice-based cryptography",
    });
  };

  const verifyQuantumSignature = () => {
    if (!signatureData || !signature) return;
    
    const isValid = signer.verify(signatureData, signature);
    
    toast({
      title: isValid ? "Signature Valid" : "Signature Invalid",
      description: isValid ? "Quantum-resistant signature verified" : "Signature verification failed",
      variant: isValid ? "default" : "destructive",
    });
  };

  const generateZKProof = () => {
    if (!zkSecret) return;
    
    const challenge = generateSecureHash("bible-fi-challenge");
    const proof = ZKProofSystem.generateProof(zkSecret, challenge);
    setZkProof(proof);
    
    toast({
      title: "Zero-Knowledge Proof Generated",
      description: "Proof created without revealing the secret",
    });
  };

  const verifyZKProof = () => {
    if (!zkProof) return;
    
    const challenge = generateSecureHash("bible-fi-challenge");
    const isValid = ZKProofSystem.verifyProof(zkProof, challenge);
    
    toast({
      title: isValid ? "ZK Proof Valid" : "ZK Proof Invalid",
      description: isValid ? "Zero-knowledge proof verified" : "Proof verification failed",
      variant: isValid ? "default" : "destructive",
    });
  };

  const generateQuantumHash = () => {
    if (!hashInput) return;
    
    const hash = generateSecureHash(hashInput);
    setQuantumHash(hash);
    
    toast({
      title: "Quantum-Resistant Hash Generated",
      description: "SHA3-512 hash created for maximum security",
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className="w-6 h-6 text-purple-400" />
          Quantum-Resistant Encryption Demo
        </CardTitle>
        <CardDescription>
          Experience fully homomorphic encryption, quantum-resistant signatures, and zero-knowledge proofs
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs defaultValue="fhe" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="fhe" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              FHE
            </TabsTrigger>
            <TabsTrigger value="signatures" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Signatures
            </TabsTrigger>
            <TabsTrigger value="zk" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Zero-Knowledge
            </TabsTrigger>
            <TabsTrigger value="hash" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Quantum Hash
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="fhe" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Value</label>
                <Input
                  type="number"
                  value={fheValue1}
                  onChange={(e) => setFheValue1(e.target.value)}
                  placeholder="Enter first number"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Second Value</label>
                <Input
                  type="number"
                  value={fheValue2}
                  onChange={(e) => setFheValue2(e.target.value)}
                  placeholder="Enter second number"
                />
              </div>
            </div>
            
            <Button 
              onClick={demonstrateFHE} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Computing..." : "Perform Homomorphic Addition"}
            </Button>
            
            {encryptedValue1 && (
              <div className="space-y-4 p-4 bg-secondary/20 rounded-lg">
                <div>
                  <Badge variant="outline">Encrypted Value 1</Badge>
                  <p className="text-xs mt-1 font-mono break-all">{encryptedValue1.substring(0, 50)}...</p>
                </div>
                <div>
                  <Badge variant="outline">Encrypted Value 2</Badge>
                  <p className="text-xs mt-1 font-mono break-all">{encryptedValue2.substring(0, 50)}...</p>
                </div>
                <div>
                  <Badge variant="outline">Homomorphic Result</Badge>
                  <p className="text-xs mt-1 font-mono break-all">{homomorphicResult.substring(0, 50)}...</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">
                    Decrypted Result: <strong>{decryptedResult}</strong>
                  </span>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="signatures" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data to Sign</label>
              <Input
                value={signatureData}
                onChange={(e) => setSignatureData(e.target.value)}
                placeholder="Enter data to sign"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={generateQuantumSignature} className="flex-1">
                Generate Signature
              </Button>
              <Button onClick={verifyQuantumSignature} variant="outline" className="flex-1">
                Verify Signature
              </Button>
            </div>
            
            {signature && (
              <div className="p-4 bg-secondary/20 rounded-lg">
                <Badge variant="outline">Quantum-Resistant Signature</Badge>
                <p className="text-xs mt-1 font-mono break-all">{signature}</p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Public Key: {signer.getPublicKey().substring(0, 32)}...
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="zk" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Secret (Never Revealed)</label>
              <Input
                type="password"
                value={zkSecret}
                onChange={(e) => setZkSecret(e.target.value)}
                placeholder="Enter your secret"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={generateZKProof} className="flex-1">
                Generate ZK Proof
              </Button>
              <Button onClick={verifyZKProof} variant="outline" className="flex-1">
                Verify Proof
              </Button>
            </div>
            
            {zkProof && (
              <div className="p-4 bg-secondary/20 rounded-lg">
                <Badge variant="outline">Zero-Knowledge Proof</Badge>
                <p className="text-xs mt-1 font-mono break-all">{zkProof}</p>
                <p className="text-xs mt-2 text-muted-foreground">
                  This proof demonstrates knowledge of the secret without revealing it
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="hash" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input to Hash</label>
              <Input
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="Enter data to hash"
              />
            </div>
            
            <Button onClick={generateQuantumHash} className="w-full">
              Generate SHA3-512 Hash
            </Button>
            
            {quantumHash && (
              <div className="p-4 bg-secondary/20 rounded-lg">
                <Badge variant="outline">Quantum-Resistant Hash (SHA3-512)</Badge>
                <p className="text-xs mt-1 font-mono break-all">{quantumHash}</p>
                <p className="text-xs mt-2 text-muted-foreground">
                  512-bit hash resistant to quantum attacks
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 p-4 bg-accent/20 rounded-lg">
          <h4 className="font-semibold mb-2">Biblical Security Principle</h4>
          <p className="text-sm text-muted-foreground">
            "The simple believe anything, but the prudent give thought to their steps." - Proverbs 14:15
          </p>
          <p className="text-xs mt-2 text-muted-foreground">
            Bible.fi implements military-grade quantum-resistant encryption to protect your financial data and privacy.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};