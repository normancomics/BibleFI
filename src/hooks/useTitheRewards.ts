import { useCallback, useState, useEffect } from 'react';
import { useWisdomProgression } from './useWisdomProgression';
import { useToast } from './use-toast';
import { secureStorage } from '@/utils/securityUtils';

// Points awarded for different tithing actions
const TITHE_REWARDS = {
  firstTithe: 25,          // First tithe ever
  standardTithe: 10,       // Regular tithe completion
  superfluidStream: 15,    // Setting up continuous stream
  generousGiving: 20,      // Giving above 10%
  consistentGiver: 5,      // Streak bonus per consecutive week
  weeklyStreak: {
    week1: 10,             // First week streak
    week2: 15,             // Two weeks
    week4: 25,             // One month
    week8: 50,             // Two months
    week12: 100,           // Three months - Solomon's consistency
  },
} as const;

interface TithingHistory {
  count: number;
  firstTitheDate: Date | null;
  weeklyStreakCount: number;
  lastTitheWeek: number;
  lastTitheYear: number;
  totalTithed: number;
}

const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const useTitheRewards = () => {
  const { toast } = useToast();
  const { 
    addPoints, 
    updateAchievementProgress, 
    incrementStreak,
    saveProgress,
    progress 
  } = useWisdomProgression();

  const [titheHistory, setTitheHistory] = useState<TithingHistory>({
    count: 0,
    firstTitheDate: null,
    weeklyStreakCount: 0,
    lastTitheWeek: 0,
    lastTitheYear: 0,
    totalTithed: 0,
  });

  // Load tithe history on mount
  useEffect(() => {
    const saved = localStorage.getItem('bible-fi-tithe-history');
    if (saved) {
      const parsed = JSON.parse(saved);
      setTitheHistory({
        ...parsed,
        firstTitheDate: parsed.firstTitheDate ? new Date(parsed.firstTitheDate) : null,
      });
    }
  }, []);

  const saveTitheHistory = useCallback((history: TithingHistory) => {
    localStorage.setItem('bible-fi-tithe-history', JSON.stringify(history));
    setTitheHistory(history);
  }, []);

  const checkAndAwardWeeklyStreak = useCallback((currentHistory: TithingHistory): number => {
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();

    let streakBonus = 0;
    let newStreakCount = currentHistory.weeklyStreakCount;

    // Check if this is a consecutive week
    const isConsecutiveWeek = 
      (currentHistory.lastTitheYear === currentYear && currentHistory.lastTitheWeek === currentWeek - 1) ||
      (currentHistory.lastTitheYear === currentYear - 1 && currentHistory.lastTitheWeek === 52 && currentWeek === 1);

    const isSameWeek = currentHistory.lastTitheYear === currentYear && currentHistory.lastTitheWeek === currentWeek;

    if (!isSameWeek) {
      if (isConsecutiveWeek || currentHistory.weeklyStreakCount === 0) {
        newStreakCount = currentHistory.weeklyStreakCount + 1;
        
        // Award streak milestones
        if (newStreakCount === 1) {
          streakBonus = TITHE_REWARDS.weeklyStreak.week1;
        } else if (newStreakCount === 2) {
          streakBonus = TITHE_REWARDS.weeklyStreak.week2;
        } else if (newStreakCount === 4) {
          streakBonus = TITHE_REWARDS.weeklyStreak.week4;
        } else if (newStreakCount === 8) {
          streakBonus = TITHE_REWARDS.weeklyStreak.week8;
        } else if (newStreakCount === 12) {
          streakBonus = TITHE_REWARDS.weeklyStreak.week12;
        } else if (newStreakCount > 0) {
          streakBonus = TITHE_REWARDS.consistentGiver;
        }
      } else {
        // Streak broken
        newStreakCount = 1;
        streakBonus = TITHE_REWARDS.weeklyStreak.week1;
      }

      // Update history with new week
      const updatedHistory = {
        ...currentHistory,
        weeklyStreakCount: newStreakCount,
        lastTitheWeek: currentWeek,
        lastTitheYear: currentYear,
      };
      saveTitheHistory(updatedHistory);
    }

    return streakBonus;
  }, [saveTitheHistory]);

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

    // Check weekly streak
    const streakBonus = checkAndAwardWeeklyStreak(titheHistory);
    if (streakBonus > 0) {
      totalPoints += streakBonus;
      messages.push(`+${streakBonus} Weekly Streak Bonus 🔥`);
    }

    // Award the points
    addPoints(totalPoints, `Tithe: $${amount}`);

    // Update tithing achievements
    updateAchievementProgress('tithe-starter', 1);
    updateAchievementProgress('consistent-giver', 1);

    // Update overall wisdom streak
    incrementStreak();

    // Update tithe history
    const updatedHistory = {
      ...titheHistory,
      count: titheHistory.count + 1,
      totalTithed: titheHistory.totalTithed + amount,
    };
    saveTitheHistory(updatedHistory);

    // Save progress
    saveProgress();

    // Show reward notification
    const rewardMessage = messages.join(' | ') + ` | Total: +${totalPoints} points`;
    toast({
      title: "🌟 Wisdom Points Earned!",
      description: rewardMessage,
    });

    // Special milestone notifications
    if (titheHistory.weeklyStreakCount === 4) {
      toast({
        title: "🏆 Monthly Faithfulness!",
        description: "You've tithed consistently for a full month! 'Well done, good and faithful servant.' - Matthew 25:21",
      });
    } else if (titheHistory.weeklyStreakCount === 12) {
      toast({
        title: "👑 Solomon's Consistency!",
        description: "12 weeks of faithful tithing! You walk in the wisdom of Solomon.",
      });
    }

    return totalPoints;
  }, [addPoints, updateAchievementProgress, incrementStreak, saveProgress, toast, titheHistory, checkAndAwardWeeklyStreak, saveTitheHistory]);

  const awardStreamCreated = useCallback((churchName: string, monthlyAmount: number) => {
    const points = TITHE_REWARDS.superfluidStream + TITHE_REWARDS.standardTithe;
    addPoints(points, `Stream to ${churchName}`);
    updateAchievementProgress('tithe-starter', 1);
    
    // Check weekly streak for streams too
    const streakBonus = checkAndAwardWeeklyStreak(titheHistory);
    const totalPoints = points + streakBonus;
    
    saveProgress();

    toast({
      title: "🔄 Streaming Tithe Activated!",
      description: `+${totalPoints} wisdom points for continuous giving${streakBonus > 0 ? ' (includes streak bonus!)' : ''}`,
    });

    return totalPoints;
  }, [addPoints, updateAchievementProgress, saveProgress, toast, checkAndAwardWeeklyStreak, titheHistory]);

  const checkFirstTithe = useCallback((): boolean => {
    // Check localStorage for tithe history
    const history = localStorage.getItem('bible-fi-tithe-history');
    if (!history) {
      const newHistory: TithingHistory = {
        count: 1,
        firstTitheDate: new Date(),
        weeklyStreakCount: 0,
        lastTitheWeek: 0,
        lastTitheYear: 0,
        totalTithed: 0,
      };
      saveTitheHistory(newHistory);
      return true;
    }
    
    return false;
  }, [saveTitheHistory]);

  const getWeeklyStreakInfo = useCallback(() => {
    return {
      currentStreak: titheHistory.weeklyStreakCount,
      totalTithes: titheHistory.count,
      totalTithed: titheHistory.totalTithed,
      nextMilestone: titheHistory.weeklyStreakCount < 4 ? 4 :
                     titheHistory.weeklyStreakCount < 8 ? 8 :
                     titheHistory.weeklyStreakCount < 12 ? 12 : null,
    };
  }, [titheHistory]);

  return {
    awardTithePoints,
    awardStreamCreated,
    checkFirstTithe,
    currentScore: progress.currentScore,
    currentLevel: progress.level,
    weeklyStreak: titheHistory.weeklyStreakCount,
    getWeeklyStreakInfo,
  };
};
