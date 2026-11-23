/**
 * Pure preview math for staking / vault deposits.
 * Tithe is always 10% of rewards (Malachi 3:10 — "Bring ye all the tithes").
 */
export const TITHE_RATE = 0.1;

export function projectStakingRewards(amount: number, apyPct: number, days: number) {
  if (!(amount > 0) || !(apyPct >= 0) || !(days > 0)) return null;
  const grossReward = amount * (apyPct / 100) * (days / 365);
  const tithe = grossReward * TITHE_RATE;
  return { grossReward, tithe, netReward: grossReward - tithe, endBalance: amount + grossReward - tithe };
}
