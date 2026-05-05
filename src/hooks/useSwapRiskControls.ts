import { useCallback, useEffect, useState } from 'react';

export interface SwapRiskControls {
  maxSlippage: number; // percent (e.g. 1.5)
  maxGasEth: number;   // max acceptable network fee in ETH
  pauseSwaps: boolean; // emergency pause
}

const STORAGE_KEY = 'biblefi_swap_risk_controls_v1';

const DEFAULTS: SwapRiskControls = {
  maxSlippage: 2.0,
  maxGasEth: 0.005,
  pauseSwaps: false,
};

function load(): SwapRiskControls {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      maxSlippage: Number.isFinite(parsed.maxSlippage) ? parsed.maxSlippage : DEFAULTS.maxSlippage,
      maxGasEth: Number.isFinite(parsed.maxGasEth) ? parsed.maxGasEth : DEFAULTS.maxGasEth,
      pauseSwaps: Boolean(parsed.pauseSwaps),
    };
  } catch {
    return DEFAULTS;
  }
}

export function useSwapRiskControls() {
  const [controls, setControls] = useState<SwapRiskControls>(() => load());

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(controls)); } catch { /* noop */ }
  }, [controls]);

  const update = useCallback((patch: Partial<SwapRiskControls>) => {
    setControls((c) => ({ ...c, ...patch }));
  }, []);

  const reset = useCallback(() => setControls(DEFAULTS), []);

  return { controls, update, reset, defaults: DEFAULTS };
}
