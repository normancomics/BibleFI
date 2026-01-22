import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NetworkStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  className,
  showLabel = false,
}) => {
  const { isConnected, isOnBaseChain, connectionStep, chainId } = useWallet();

  const getStatusConfig = () => {
    if (!isConnected) {
      return {
        icon: WifiOff,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/50',
        pulseColor: '',
        label: 'Not Connected',
        tooltip: 'Connect your wallet to access DeFi features',
      };
    }

    if (connectionStep === 'switching-chain') {
      return {
        icon: Loader2,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        pulseColor: 'bg-amber-500',
        label: 'Switching...',
        tooltip: 'Switching to Base network',
        animate: true,
      };
    }

    if (!isOnBaseChain) {
      return {
        icon: AlertTriangle,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        pulseColor: 'bg-amber-500',
        label: 'Wrong Network',
        tooltip: `Connected to chain ${chainId}. Click to switch to Base.`,
      };
    }

    return {
      icon: Wifi,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      pulseColor: 'bg-green-500',
      label: 'Base',
      tooltip: 'Connected to Base network',
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className={cn(
            'relative flex items-center gap-1.5 rounded-full px-2 py-1 cursor-default',
            config.bgColor,
            className
          )}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Pulse indicator for connected state */}
          <AnimatePresence>
            {isConnected && isOnBaseChain && (
              <motion.span
                className={cn(
                  'absolute left-1.5 h-2 w-2 rounded-full',
                  config.pulseColor
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span
                  className={cn(
                    'absolute inset-0 rounded-full animate-ping opacity-75',
                    config.pulseColor
                  )}
                />
              </motion.span>
            )}
          </AnimatePresence>

          <Icon
            className={cn(
              'h-3.5 w-3.5',
              config.color,
              config.animate && 'animate-spin',
              isConnected && isOnBaseChain && 'ml-2'
            )}
          />

          {showLabel && (
            <span className={cn('text-xs font-medium', config.color)}>
              {config.label}
            </span>
          )}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <div className="flex items-center gap-2">
          {isConnected && isOnBaseChain && (
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          )}
          {config.tooltip}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default NetworkStatusIndicator;
