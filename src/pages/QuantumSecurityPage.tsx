import React from 'react';
import NavBar from '@/components/NavBar';
import SoundSystemManager from '@/components/enhanced/SoundSystemManager';
import QuantumSecurityDashboard from '@/components/security/QuantumSecurityDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const QuantumSecurityPage: React.FC = () => {
  return (
    <SoundSystemManager>
      <div className="min-h-screen bg-background">
        <NavBar />
        
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Security
            </Button>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent mb-4">
                Quantum Security Center
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Military-grade quantum-resistant security protecting BibleFi with AES-256 encryption, 
                homomorphic computation, zero-knowledge proofs, and post-quantum cryptography.
              </p>
            </div>
          </motion.div>

          {/* Main Dashboard */}
          <QuantumSecurityDashboard />
        </main>
      </div>
    </SoundSystemManager>
  );
};

export default QuantumSecurityPage;