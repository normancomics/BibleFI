import React from 'react';
import { useSuperfluid } from '@/hooks/useSuperfluid';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Waves } from 'lucide-react';

/**
 * Tiny navbar pill showing Superfluid background init state.
 * Read-only — never surfaces toasts; signer-bound actions handle their own errors.
 */
const SuperfluidStatusPill: React.FC = () => {
  const { isInitialized } = useSuperfluid();

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`hidden md:inline-flex items-center gap-1 text-[10px] font-mono border-ancient-gold/30 ${
              isInitialized
                ? 'text-grace-green'
                : 'text-foreground/60'
            }`}
          >
            {isInitialized ? (
              <Waves className="h-3 w-3" />
            ) : (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
            <span>SF: {isInitialized ? 'Ready' : 'Connecting'}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">
            {isInitialized
              ? 'Superfluid read-only client connected to Base'
              : 'Superfluid initializing in background…'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SuperfluidStatusPill;
