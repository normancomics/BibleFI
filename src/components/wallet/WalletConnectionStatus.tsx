import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Wallet, Link } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConnectionStep = 'idle' | 'connecting' | 'signing' | 'switching-chain' | 'connected' | 'error';

interface WalletConnectionStatusProps {
  step: ConnectionStep;
  walletName?: string;
  errorMessage?: string;
  className?: string;
}

const stepConfig: Record<ConnectionStep, { icon: React.ReactNode; label: string; color: string }> = {
  idle: {
    icon: <Wallet className="h-5 w-5" />,
    label: 'Ready to connect',
    color: 'text-muted-foreground',
  },
  connecting: {
    icon: <Loader2 className="h-5 w-5 animate-spin" />,
    label: 'Connecting wallet...',
    color: 'text-primary',
  },
  signing: {
    icon: <Loader2 className="h-5 w-5 animate-spin" />,
    label: 'Waiting for signature...',
    color: 'text-amber-500',
  },
  'switching-chain': {
    icon: <Link className="h-5 w-5 animate-pulse" />,
    label: 'Switching to Base...',
    color: 'text-blue-500',
  },
  connected: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    label: 'Connected!',
    color: 'text-green-500',
  },
  error: {
    icon: <XCircle className="h-5 w-5" />,
    label: 'Connection failed',
    color: 'text-destructive',
  },
};

export const WalletConnectionStatus: React.FC<WalletConnectionStatusProps> = ({
  step,
  walletName,
  errorMessage,
  className,
}) => {
  const config = stepConfig[step];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'flex items-center gap-3 rounded-lg border bg-card p-4',
          step === 'error' && 'border-destructive/50 bg-destructive/5',
          step === 'connected' && 'border-green-500/50 bg-green-500/5',
          className
        )}
      >
        <div className={cn('flex-shrink-0', config.color)}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium', config.color)}>
            {config.label}
          </p>
          {walletName && step !== 'idle' && step !== 'error' && (
            <p className="text-xs text-muted-foreground truncate">
              {walletName}
            </p>
          )}
          {errorMessage && step === 'error' && (
            <p className="text-xs text-destructive/80 truncate">
              {errorMessage}
            </p>
          )}
        </div>
        {(step === 'connecting' || step === 'signing' || step === 'switching-chain') && (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-primary/60"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default WalletConnectionStatus;
