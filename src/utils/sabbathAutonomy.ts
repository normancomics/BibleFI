export const SABBATH_AUTONOMOUS_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export const SABBATH_DEFAULT_PLAN = {
  fromSymbol: 'ETH',
  toSymbol: 'USDC',
  amount: '1',
  wisdomScore: 72,
  slippageBps: 30,
} as const;

export function isSabbathSunday(now: Date = new Date()): boolean {
  return now.getDay() === 0;
}

