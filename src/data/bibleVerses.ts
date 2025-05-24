
export interface BibleVerse {
  reference: string;
  text: string;
  category: "wealth" | "giving" | "work" | "stewardship" | "taxes" | "debt" | "contentment" | "generosity" | "planning" | "investing";
  key: string;
  principle?: string;
  application?: string;
}

export const financialVerses: BibleVerse[] = [
  {
    reference: "Proverbs 13:11",
    text: "Wealth gained hastily will dwindle, but whoever gathers little by little will increase it.",
    category: "wealth",
    key: "gather-little-by-little",
    principle: "Sustainable wealth is built gradually through consistent effort",
    application: "Set up regular DeFi investments rather than chasing high-risk, quick returns"
  },
  {
    reference: "Proverbs 21:20",
    text: "The wise store up choice food and olive oil, but fools gulp theirs down.",
    category: "stewardship",
    key: "store-up",
    principle: "Save for the future rather than consuming everything immediately",
    application: "Allocate a portion of earnings to long-term yield farming strategies"
  },
  {
    reference: "Proverbs 22:7",
    text: "The rich rule over the poor, and the borrower is slave to the lender.",
    category: "debt",
    key: "borrower-slave",
    principle: "Avoid unnecessary debt that creates financial bondage",
    application: "Be cautious with leverage in DeFi; ensure collateralization is sustainable"
  },
  {
    reference: "Matthew 22:21",
    text: "Render unto Caesar the things that are Caesar's, and unto God the things that are God's.",
    category: "taxes",
    key: "render-caesar",
    principle: "Honor civic obligations while prioritizing spiritual commitments",
    application: "Maintain proper tax records for crypto transactions; tithe faithfully"
  },
  {
    reference: "Malachi 3:10",
    text: "Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this, says the LORD Almighty, and see if I will not throw open the floodgates of heaven and pour out so much blessing that there will not be room enough to store it.",
    category: "giving",
    key: "whole-tithe",
    principle: "Faithful giving leads to unexpected blessing",
    application: "Integrate automatic tithing into your DeFi strategy"
  },
  {
    reference: "Proverbs 10:4",
    text: "Lazy hands make for poverty, but diligent hands bring wealth.",
    category: "work",
    key: "diligent-hands",
    principle: "Prosperity results from consistent, dedicated work",
    application: "Research platforms carefully before investing; monitor positions regularly"
  },
  {
    reference: "Ecclesiastes 11:2",
    text: "Invest in seven ventures, yes, in eight; you do not know what disaster may come upon the land.",
    category: "investing",
    key: "diversify",
    principle: "Diversification protects against unforeseen calamities",
    application: "Spread investments across multiple tokens, platforms and strategies"
  },
  {
    reference: "Luke 14:28",
    text: "For which of you, intending to build a tower, does not sit down first and count the cost, whether he has enough to finish it?",
    category: "planning",
    key: "count-cost",
    principle: "Careful planning prevents costly abandonments",
    application: "Calculate gas fees, impermanent loss risks, and time commitments before investing"
  },
  {
    reference: "1 Timothy 6:10",
    text: "For the love of money is a root of all kinds of evil. Some people, eager for money, have wandered from the faith and pierced themselves with many griefs.",
    category: "contentment",
    key: "love-of-money",
    principle: "Prioritizing wealth acquisition leads to spiritual damage",
    application: "Set reasonable financial goals based on needs, not greed"
  },
  {
    reference: "Acts 20:35",
    text: "In everything I did, I showed you that by this kind of hard work we must help the weak, remembering the words the Lord Jesus himself said: 'It is more blessed to give than to receive.'",
    category: "giving",
    key: "blessed-give",
    principle: "Giving brings greater joy than accumulating",
    application: "Consider charitable DAOs and impact investing opportunities"
  },
  // Adding more comprehensive biblical financial principles
  {
    reference: "Proverbs 3:9-10",
    text: "Honor the LORD with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing, and your vats will brim over with new wine.",
    category: "giving",
    key: "firstfruits",
    principle: "Give God the first portion, not the leftovers",
    application: "Set up automated tithing that executes before other allocations"
  },
  {
    reference: "Proverbs 6:6-8",
    text: "Go to the ant, you sluggard; consider its ways and be wise! It has no commander, no overseer or ruler, yet it stores its provisions in summer and gathers its food at harvest.",
    category: "planning",
    key: "ant-prepare",
    principle: "Prepare in times of abundance for times of scarcity",
    application: "Build a stablecoin reserve during bull markets"
  },
  {
    reference: "Proverbs 11:24-25",
    text: "One person gives freely, yet gains even more; another withholds unduly, but comes to poverty. A generous person will prosper; whoever refreshes others will be refreshed.",
    category: "generosity",
    key: "give-freely",
    principle: "Generosity paradoxically leads to abundance",
    application: "Contribute to biblical charity pools and impact investments"
  },
  {
    reference: "Proverbs 27:23-24",
    text: "Be sure you know the condition of your flocks, give careful attention to your herds; for riches do not endure forever, and a crown is not secure for all generations.",
    category: "stewardship",
    key: "know-condition",
    principle: "Monitor your investments carefully; nothing lasts forever",
    application: "Regularly review protocol security, yields, and market conditions"
  },
  {
    reference: "Philippians 4:11-12",
    text: "I have learned to be content whatever the circumstances. I know what it is to be in need, and I know what it is to have plenty. I have learned the secret of being content in any and every situation, whether well fed or hungry, whether living in plenty or in want.",
    category: "contentment",
    key: "content-circumstances",
    principle: "Financial peace comes from contentment, not wealth level",
    application: "Set reasonable ROI targets; avoid FOMO-driven decisions"
  },
  {
    reference: "1 Timothy 6:17-19",
    text: "Command those who are rich in this present world not to be arrogant nor to put their hope in wealth, which is so uncertain, but to put their hope in God, who richly provides us with everything for our enjoyment. Command them to do good, to be rich in good deeds, and to be generous and willing to share.",
    category: "stewardship",
    key: "hope-in-god",
    principle: "Wealth should be used for good, not pride",
    application: "Use DeFi gains to increase charitable giving capabilities"
  },
  {
    reference: "Deuteronomy 8:18",
    text: "But remember the LORD your God, for it is he who gives you the ability to produce wealth.",
    category: "wealth",
    key: "ability-from-god",
    principle: "God is the ultimate source of wealth-building ability",
    application: "Express gratitude for opportunities and understanding in DeFi"
  },
  {
    reference: "Matthew 6:33",
    text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.",
    category: "planning",
    key: "seek-first-kingdom",
    principle: "Spiritual priorities lead to material provision",
    application: "Approach DeFi with ethical considerations first, returns second"
  },
  {
    reference: "Proverbs 17:16",
    text: "Why should fools have money in hand to buy wisdom, when they are not able to understand it?",
    category: "investing",
    key: "understanding-before-investing",
    principle: "Knowledge should precede investment",
    application: "Study protocols thoroughly before committing funds"
  },
  {
    reference: "Romans 13:8",
    text: "Let no debt remain outstanding, except the continuing debt to love one another.",
    category: "debt",
    key: "no-outstanding-debt",
    principle: "Minimize ongoing debt obligations",
    application: "Use DeFi lending cautiously; prioritize repayment"
  }
];

export const getVersesByCategory = (category: BibleVerse["category"]) => {
  return financialVerses.filter(verse => verse.category === category);
};

export const getRandomVerse = () => {
  return financialVerses[Math.floor(Math.random() * financialVerses.length)];
};

export const getRandomVerseByCategory = (category: BibleVerse["category"]) => {
  const verses = getVersesByCategory(category);
  return verses[Math.floor(Math.random() * verses.length)];
};

// Generate a financial wisdom score based on user's actions
export const calculateWisdomScore = (actions: {
  hasDiversifiedPortfolio: boolean;
  hasSavingsReserve: boolean;
  hasAutomatedTithing: boolean;
  avoidingHighRisk: boolean;
  regularInvestments: boolean;
  educationEfforts: boolean;
  charitableGiving: boolean;
  debtMinimization: boolean;
}): number => {
  let score = 0;
  if (actions.hasDiversifiedPortfolio) score += 15;
  if (actions.hasSavingsReserve) score += 15;
  if (actions.hasAutomatedTithing) score += 20;
  if (actions.avoidingHighRisk) score += 10;
  if (actions.regularInvestments) score += 10;
  if (actions.educationEfforts) score += 10;
  if (actions.charitableGiving) score += 15;
  if (actions.debtMinimization) score += 15;
  
  return Math.min(score, 100);
};

// Get personalized wisdom based on wisdom score
export const getWisdomRecommendation = (score: number): {verse: BibleVerse, advice: string} => {
  let category: BibleVerse["category"];
  let advice: string;
  
  if (score < 30) {
    category = "planning";
    advice = "Start by creating a clear financial plan based on biblical principles. Set aside time to learn basic DeFi concepts and establish a regular tithing practice.";
  } else if (score < 50) {
    category = "stewardship";
    advice = "You're making progress! Focus on being a good steward by monitoring your investments more closely and diversifying your holdings.";
  } else if (score < 70) {
    category = "investing";
    advice = "Your wisdom is growing! Consider more strategic ways to support ministry work through your investments while maintaining diligent research practices.";
  } else if (score < 90) {
    category = "generosity";
    advice = "You're demonstrating good biblical financial wisdom! Explore how you can increase your impact through generosity while maintaining excellent stewardship.";
  } else {
    category = "contentment";
    advice = "Excellent! You're practicing biblical financial principles with consistency. Consider mentoring others while maintaining your balanced approach to wealth.";
  }
  
  return {
    verse: getRandomVerseByCategory(category),
    advice
  };
};
