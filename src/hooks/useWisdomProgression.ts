import { useState, useCallback, useEffect } from 'react';
import { 
  WisdomProgress, 
  WisdomLevel, 
  BiblicalMilestone, 
  WisdomAchievement,
  WISDOM_LEVELS 
} from '@/types/wisdomProgression';
import { secureStorage } from '@/utils/securityUtils';

const BIBLICAL_MILESTONES: BiblicalMilestone[] = [
  {
    id: 'first-tithe',
    title: 'First Fruits',
    description: 'Complete your first tithe offering',
    scriptureReference: 'Proverbs 3:9',
    scriptureText: 'Honor the LORD with your wealth, with the firstfruits of all your crops.',
    requiredScore: 10,
    icon: '🌾',
    unlocked: false
  },
  {
    id: 'faithful-giver',
    title: 'Faithful Giver',
    description: 'Tithe consistently for 4 weeks',
    scriptureReference: 'Malachi 3:10',
    scriptureText: 'Bring the whole tithe into the storehouse.',
    requiredScore: 50,
    icon: '💝',
    unlocked: false
  },
  {
    id: 'joseph-saver',
    title: 'Joseph\'s Wisdom',
    description: 'Save for 7 consecutive periods',
    scriptureReference: 'Genesis 41:36',
    scriptureText: 'This food should be held in reserve for the country.',
    requiredScore: 100,
    icon: '🏛️',
    unlocked: false
  },
  {
    id: 'good-samaritan',
    title: 'Good Samaritan',
    description: 'Help others through generous giving',
    scriptureReference: 'Luke 10:37',
    scriptureText: 'Go and do likewise.',
    requiredScore: 200,
    icon: '🤝',
    unlocked: false
  },
  {
    id: 'temple-builder',
    title: 'Temple Builder',
    description: 'Support your church consistently',
    scriptureReference: '1 Chronicles 29:3',
    scriptureText: 'I give my personal treasures for the temple of my God.',
    requiredScore: 350,
    icon: '🏗️',
    unlocked: false
  },
  {
    id: 'widow-mite',
    title: 'Widow\'s Faith',
    description: 'Give sacrificially from your heart',
    scriptureReference: 'Mark 12:44',
    scriptureText: 'She gave all she had to live on.',
    requiredScore: 500,
    icon: '💎',
    unlocked: false
  },
  {
    id: 'paul-generosity',
    title: 'Cheerful Giver',
    description: 'Master the art of joyful generosity',
    scriptureReference: '2 Corinthians 9:7',
    scriptureText: 'God loves a cheerful giver.',
    requiredScore: 750,
    icon: '😊',
    unlocked: false
  },
  {
    id: 'solomon-wisdom',
    title: 'Solomon\'s Insight',
    description: 'Achieve complete financial wisdom',
    scriptureReference: '1 Kings 3:12',
    scriptureText: 'I will give you a wise and discerning heart.',
    requiredScore: 1000,
    icon: '👑',
    unlocked: false
  }
];

const WISDOM_ACHIEVEMENTS: WisdomAchievement[] = [
  {
    id: 'first-step',
    title: 'First Step of Faith',
    description: 'Connect your wallet and begin your journey',
    category: 'wisdom',
    points: 5,
    icon: '👣',
    unlocked: false,
    progress: 0,
    target: 1,
    biblicalPrinciple: 'A journey of faith begins with a single step'
  },
  {
    id: 'tithe-starter',
    title: 'Tithe Starter',
    description: 'Complete 3 tithe transactions',
    category: 'tithing',
    points: 15,
    icon: '🌱',
    unlocked: false,
    progress: 0,
    target: 3,
    biblicalPrinciple: 'Faithfulness in little leads to greater blessings'
  },
  {
    id: 'consistent-giver',
    title: 'Consistent Giver',
    description: 'Tithe 10 times',
    category: 'tithing',
    points: 30,
    icon: '📅',
    unlocked: false,
    progress: 0,
    target: 10,
    biblicalPrinciple: 'Steadfast love and faithfulness meet'
  },
  {
    id: 'emergency-fund',
    title: 'Joseph\'s Reserve',
    description: 'Build an emergency savings fund',
    category: 'saving',
    points: 25,
    icon: '🏦',
    unlocked: false,
    progress: 0,
    target: 1,
    biblicalPrinciple: 'Store up in times of plenty for times of need'
  },
  {
    id: 'diversified-portfolio',
    title: 'Ecclesiastes Investor',
    description: 'Diversify across 5 different assets',
    category: 'stewardship',
    points: 35,
    icon: '📊',
    unlocked: false,
    progress: 0,
    target: 5,
    biblicalPrinciple: 'Cast your bread upon many waters'
  },
  {
    id: 'generous-heart',
    title: 'Generous Heart',
    description: 'Give beyond your tithe 5 times',
    category: 'generosity',
    points: 40,
    icon: '❤️',
    unlocked: false,
    progress: 0,
    target: 5,
    biblicalPrinciple: 'It is more blessed to give than to receive'
  },
  {
    id: 'wisdom-seeker',
    title: 'Wisdom Seeker',
    description: 'Study 20 biblical financial principles',
    category: 'wisdom',
    points: 25,
    icon: '📖',
    unlocked: false,
    progress: 0,
    target: 20,
    biblicalPrinciple: 'Seek wisdom like silver and hidden treasures'
  },
  {
    id: 'debt-freedom',
    title: 'Freedom from Bondage',
    description: 'Become debt-free',
    category: 'stewardship',
    points: 100,
    icon: '⛓️',
    unlocked: false,
    progress: 0,
    target: 1,
    biblicalPrinciple: 'The borrower is servant to the lender'
  }
];

const getWisdomLevel = (score: number): WisdomLevel => {
  if (score >= 1000) return 'solomon';
  if (score >= 600) return 'elder';
  if (score >= 300) return 'shepherd';
  if (score >= 100) return 'steward';
  return 'seeker';
};

const calculateLevelProgress = (score: number, level: WisdomLevel): number => {
  const levelData = WISDOM_LEVELS[level];
  const range = levelData.maxScore - levelData.minScore;
  const progress = score - levelData.minScore;
  return Math.min(100, Math.floor((progress / range) * 100));
};

export const useWisdomProgression = () => {
  const [progress, setProgress] = useState<WisdomProgress>({
    currentScore: 0,
    level: 'seeker',
    levelProgress: 0,
    nextLevelScore: 100,
    totalAchievements: WISDOM_ACHIEVEMENTS.length,
    unlockedAchievements: 0,
    streak: 0
  });

  const [milestones, setMilestones] = useState<BiblicalMilestone[]>(BIBLICAL_MILESTONES);
  const [achievements, setAchievements] = useState<WisdomAchievement[]>(WISDOM_ACHIEVEMENTS);

  // Load saved progress from secureStorage
  useEffect(() => {
    const saved = secureStorage.getItem('bible-fi-wisdom-progress');
    if (saved) {
      try {
        setProgress(saved.progress || progress);
        setMilestones(saved.milestones || BIBLICAL_MILESTONES);
        setAchievements(saved.achievements || WISDOM_ACHIEVEMENTS);
      } catch (e) {
        console.error('Failed to load wisdom progress:', e);
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback(() => {
    localStorage.setItem('bible-fi-wisdom-progress', JSON.stringify({
      progress,
      milestones,
      achievements
    }));
  }, [progress, milestones, achievements]);

  const addPoints = useCallback((points: number, reason?: string) => {
    setProgress(prev => {
      const newScore = prev.currentScore + points;
      const newLevel = getWisdomLevel(newScore);
      const levelData = WISDOM_LEVELS[newLevel];
      
      return {
        ...prev,
        currentScore: newScore,
        level: newLevel,
        levelProgress: calculateLevelProgress(newScore, newLevel),
        nextLevelScore: levelData.maxScore === Infinity ? newScore : levelData.maxScore,
        lastActivity: new Date()
      };
    });

    // Check and unlock milestones
    setMilestones(prev => prev.map(m => {
      if (!m.unlocked && progress.currentScore + points >= m.requiredScore) {
        return { ...m, unlocked: true, unlockedAt: new Date() };
      }
      return m;
    }));
  }, [progress.currentScore]);

  const updateAchievementProgress = useCallback((achievementId: string, progressAmount: number) => {
    setAchievements(prev => prev.map(a => {
      if (a.id === achievementId) {
        const newProgress = Math.min(a.target, a.progress + progressAmount);
        const nowUnlocked = newProgress >= a.target;
        
        if (nowUnlocked && !a.unlocked) {
          addPoints(a.points, `Achievement: ${a.title}`);
          setProgress(p => ({
            ...p,
            unlockedAchievements: p.unlockedAchievements + 1
          }));
        }
        
        return { ...a, progress: newProgress, unlocked: nowUnlocked };
      }
      return a;
    }));
  }, [addPoints]);

  const incrementStreak = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      streak: prev.streak + 1,
      lastActivity: new Date()
    }));
    addPoints(5, 'Daily streak bonus');
  }, [addPoints]);

  const getCurrentLevelInfo = useCallback(() => {
    return WISDOM_LEVELS[progress.level];
  }, [progress.level]);

  const getNextMilestone = useCallback(() => {
    return milestones.find(m => !m.unlocked);
  }, [milestones]);

  return {
    progress,
    milestones,
    achievements,
    addPoints,
    updateAchievementProgress,
    incrementStreak,
    getCurrentLevelInfo,
    getNextMilestone,
    saveProgress,
    WISDOM_LEVELS
  };
};
