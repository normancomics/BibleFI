export type WisdomLevel = 
  | 'seeker'
  | 'steward'
  | 'shepherd'
  | 'elder'
  | 'solomon';

export interface BiblicalMilestone {
  id: string;
  title: string;
  description: string;
  scriptureReference: string;
  scriptureText: string;
  requiredScore: number;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface WisdomAchievement {
  id: string;
  title: string;
  description: string;
  category: 'tithing' | 'saving' | 'generosity' | 'stewardship' | 'wisdom';
  points: number;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
  biblicalPrinciple: string;
}

export interface WisdomProgress {
  currentScore: number;
  level: WisdomLevel;
  levelProgress: number;
  nextLevelScore: number;
  totalAchievements: number;
  unlockedAchievements: number;
  streak: number;
  lastActivity?: Date;
}

export const WISDOM_LEVELS: Record<WisdomLevel, { 
  name: string; 
  minScore: number; 
  maxScore: number;
  title: string;
  verse: string;
  reference: string;
}> = {
  seeker: {
    name: 'Seeker',
    minScore: 0,
    maxScore: 99,
    title: 'Seeker of Wisdom',
    verse: 'The fear of the LORD is the beginning of wisdom.',
    reference: 'Proverbs 9:10'
  },
  steward: {
    name: 'Steward',
    minScore: 100,
    maxScore: 299,
    title: 'Faithful Steward',
    verse: 'Well done, good and faithful servant.',
    reference: 'Matthew 25:21'
  },
  shepherd: {
    name: 'Shepherd',
    minScore: 300,
    maxScore: 599,
    title: 'Shepherd of Resources',
    verse: 'The LORD is my shepherd; I shall not want.',
    reference: 'Psalm 23:1'
  },
  elder: {
    name: 'Elder',
    minScore: 600,
    maxScore: 999,
    title: 'Elder of Wisdom',
    verse: 'Grey hair is a crown of glory.',
    reference: 'Proverbs 16:31'
  },
  solomon: {
    name: 'Solomon',
    minScore: 1000,
    maxScore: Infinity,
    title: 'Wisdom of Solomon',
    verse: 'God gave Solomon wisdom and very great insight.',
    reference: '1 Kings 4:29'
  }
};
