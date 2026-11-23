import { describe, it, expect } from 'vitest';
import { projectStakingRewards } from './defiPreview';
import { estimateSwapOutput } from '@/hooks/useWalletAssets';

describe('defi previews', () => {
  it('takes a 10% tithe from rewards', () => {
    const p = projectStakingRewards(1000, 8, 365)!;
    expect(p.grossReward).toBeCloseTo(80);
    expect(p.tithe).toBeCloseTo(8);
    expect(p.endBalance).toBeCloseTo(1072);
  });
  it('returns null for empty amount', () => {
    expect(projectStakingRewards(0, 8, 30)).toBeNull();
  });
  it('estimates swap output from prices minus 0.3% fee', () => {
    expect(estimateSwapOutput(1, 2500, 1)).toBeCloseTo(2492.5);
  });
});
