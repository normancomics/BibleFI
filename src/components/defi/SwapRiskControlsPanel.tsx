import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Shield, RotateCcw, AlertOctagon } from 'lucide-react';
import type { SwapRiskControls } from '@/hooks/useSwapRiskControls';

interface Props {
  controls: SwapRiskControls;
  update: (patch: Partial<SwapRiskControls>) => void;
  reset: () => void;
}

const SwapRiskControlsPanel: React.FC<Props> = ({ controls, update, reset }) => {
  return (
    <Card className="bg-card/60 backdrop-blur-sm border-ancient-gold/30">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2 text-ancient-gold">
          <Shield className="h-4 w-4" />
          Risk Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Max Slippage (%)</Label>
          <Input
            type="number"
            step="0.1"
            min="0.1"
            max="50"
            value={controls.maxSlippage}
            onChange={(e) => update({ maxSlippage: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-[10px] text-muted-foreground">
            Quotes exceeding this slippage will be blocked.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Max Network Fee (ETH)</Label>
          <Input
            type="number"
            step="0.0001"
            min="0"
            value={controls.maxGasEth}
            onChange={(e) => update({ maxGasEth: parseFloat(e.target.value) || 0 })}
          />
          <p className="text-[10px] text-muted-foreground">
            Swaps with estimated gas above this cap will require confirmation.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-destructive" />
            <div>
              <Label className="text-sm">Pause Swaps</Label>
              <p className="text-[10px] text-muted-foreground">Emergency stop — blocks all swap execution.</p>
            </div>
          </div>
          <Switch
            checked={controls.pauseSwaps}
            onCheckedChange={(v) => update({ pauseSwaps: v })}
          />
        </div>

        <Button variant="ghost" size="sm" onClick={reset} className="w-full text-xs">
          <RotateCcw className="h-3 w-3 mr-1.5" />
          Reset to defaults
        </Button>

        <p className="text-[10px] italic text-muted-foreground text-center">
          "The prudent see danger and take refuge." — Proverbs 22:3
        </p>
      </CardContent>
    </Card>
  );
};

export default SwapRiskControlsPanel;
