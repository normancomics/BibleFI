import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import NetworkDetailsModal from './NetworkDetailsModal';

interface NetworkStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  className,
  showLabel = false,
}) => {
  const { isConnected, isOnBaseChain, connectionStep, chainId, switchToBase } = useWallet();
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const getStatusConfig = () => {
    if (!isConnected) {
      return {
        icon: WifiOff,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/50',
        pulseColor: '',
        label: 'Not Connected',
        tooltip: 'Connect your wallet to access DeFi features',
        clickable: false,
        showDetails: false,
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
        clickable: false,
        showDetails: false,
      };
    }

    if (!isOnBaseChain) {
      return {
        icon: AlertTriangle,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10 hover:bg-amber-500/20',
        pulseColor: 'bg-amber-500',
        label: 'Wrong Network',
        tooltip: 'Click to switch to Base network',
        clickable: true,
        showDetails: false,
      };
    }

    return {
      icon: Wifi,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10 hover:bg-green-500/20',
      pulseColor: 'bg-green-500',
      label: 'Base',
      tooltip: 'Click to view network details',
      clickable: true,
      showDetails: true,
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const handleClick = () => {
    if (config.showDetails) {
      setShowDetailsModal(true);
    } else if (config.clickable && !isOnBaseChain) {
      switchToBase();
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            type="button"
            onClick={handleClick}
            disabled={!config.clickable && !config.showDetails}
            className={cn(
              'relative flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors',
              config.bgColor,
              (config.clickable || config.showDetails) && 'cursor-pointer active:scale-95',
              !config.clickable && !config.showDetails && 'cursor-default',
              className
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={(config.clickable || config.showDetails) ? { scale: 1.05 } : undefined}
            whileTap={(config.clickable || config.showDetails) ? { scale: 0.95 } : undefined}
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
          </motion.button>
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

      <NetworkDetailsModal 
        open={showDetailsModal} 
        onOpenChange={setShowDetailsModal} 
      />
    </>
  );
};

export default NetworkStatusIndicator;
