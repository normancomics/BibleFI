import { useCallback } from 'react';
import { useWisdomProgression } from './useWisdomProgression';
import { useToast } from './use-toast';

// Points awarded for different tithing actions
const TITHE_REWARDS = {
  firstTithe: 25,          // First tithe ever
  standardTithe: 10,       // Regular tithe completion
  superfluidStream: 15,    // Setting up continuous stream
  generousGiving: 20,      // Giving above 10%
  consistentGiver: 5,      // Streak bonus per consecutive week
} as const;

export const useTitheRewards = () => {
  const { toast } = useToast();
  const { 
    addPoints, 
    updateAchievementProgress, 
    incrementStreak,
    saveProgress,
    progress 
  } = useWisdomProgression();

  const awardTithePoints = useCallback((
    amount: number, 
    type: 'direct' | 'superfluid' | 'fiat',
    isFirstTithe: boolean = false
  ) => {
    let totalPoints = 0;
    let messages: string[] = [];

    // First tithe bonus
    if (isFirstTithe) {
      totalPoints += TITHE_REWARDS.firstTithe;
      messages.push(`+${TITHE_REWARDS.firstTithe} First Fruits Blessing`);
    }

    // Standard tithe points
    totalPoints += TITHE_REWARDS.standardTithe;
    messages.push(`+${TITHE_REWARDS.standardTithe} Faithful Giving`);

    // Superfluid stream bonus (continuous giving)
    if (type === 'superfluid') {
      totalPoints += TITHE_REWARDS.superfluidStream;
      messages.push(`+${TITHE_REWARDS.superfluidStream} Continuous Stream Bonus`);
    }

    // Award the points
    addPoints(totalPoints, `Tithe: $${amount}`);

    // Update tithing achievements
    updateAchievementProgress('tithe-starter', 1);
    updateAchievementProgress('consistent-giver', 1);

    // Save progress
    saveProgress();

    // Show reward notification
    const rewardMessage = messages.join(' | ') + ` | Total: +${totalPoints} points`;
    toast({
      title: "🌟 Wisdom Points Earned!",
      description: rewardMessage,
    });

    return totalPoints;
  }, [addPoints, updateAchievementProgress, saveProgress, toast]);

  const awardStreamCreated = useCallback((churchName: string, monthlyAmount: number) => {
    const points = TITHE_REWARDS.superfluidStream + TITHE_REWARDS.standardTithe;
    addPoints(points, `Stream to ${churchName}`);
    updateAchievementProgress('tithe-starter', 1);
    saveProgress();

    toast({
      title: "🔄 Streaming Tithe Activated!",
      description: `+${points} wisdom points for continuous giving`,
    });

    return points;
  }, [addPoints, updateAchievementProgress, saveProgress, toast]);

  const checkFirstTithe = useCallback((): boolean => {
    // Check localStorage for tithe history
    const history = localStorage.getItem('bible-fi-tithe-history');
    if (!history) {
      localStorage.setItem('bible-fi-tithe-history', JSON.stringify({ count: 1, firstTitheDate: new Date() }));
      return true;
    }
    
    const parsed = JSON.parse(history);
    parsed.count = (parsed.count || 0) + 1;
    localStorage.setItem('bible-fi-tithe-history', JSON.stringify(parsed));
    return false;
  }, []);

  return {
    awardTithePoints,
    awardStreamCreated,
    checkFirstTithe,
    currentScore: progress.currentScore,
    currentLevel: progress.level,
  };
};
