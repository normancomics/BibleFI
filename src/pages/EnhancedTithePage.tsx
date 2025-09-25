import React from 'react';
import NavBar from '@/components/NavBar';
import SoundSystemManager from '@/components/enhanced/SoundSystemManager';
import EnhancedStreamingTithe from '@/components/tithe/EnhancedStreamingTithe';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const EnhancedTithePage: React.FC = () => {
  return (
    <SoundSystemManager>
      <div className="min-h-screen bg-background">
        <NavBar />
        
        <main className="container mx-auto px-4 py-8 max-w-4xl">
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
              Back to Home
            </Button>
          </motion.div>

          {/* Enhanced Tithing Interface */}
          <EnhancedStreamingTithe />
        </main>
      </div>
    </SoundSystemManager>
  );
};

export default EnhancedTithePage;