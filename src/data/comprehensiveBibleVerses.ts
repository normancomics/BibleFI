import { BibleVerse } from './bibleVerses';

export interface ComprehensiveBibleVerse extends BibleVerse {
  principle?: string;
  application?: string;
  defi_relevance?: string;
  financial_keywords?: string[];
}

export const comprehensiveBibleVerses = [
  {
    text: "The rich rule over the poor, and the borrower is slave to the lender.",
    reference: "Proverbs 22:7",
    category: "debt",
    principle: "Debt creates an unequal power relationship between the borrower and lender.",
    application: "Avoid unnecessary debt and work toward financial independence.",
    defi_relevance: "DeFi lending protocols should be approached with caution, understanding the obligations and risks involved.",
    financial_keywords: ["debt", "lending", "borrowing", "financial freedom"]
  },
  {
    text: "The wicked borrow and do not repay, but the righteous give generously.",
    reference: "Psalm 37:21",
    category: "debt",
    principle: "Repaying debts is a matter of integrity and righteousness.",
    application: "Honor your financial commitments and be generous when possible.",
    defi_relevance: "Smart contracts in DeFi enforce repayment, but the principle of honoring obligations remains important.",
    financial_keywords: ["debt", "repayment", "generosity", "integrity"]
  },
  {
    text: "Give to everyone what you owe them: If you owe taxes, pay taxes; if revenue, then revenue; if respect, then respect; if honor, then honor.",
    reference: "Romans 13:7",
    category: "stewardship",
    principle: "Christians should fulfill all financial obligations, including those to governing authorities.",
    application: "Pay taxes and other financial obligations promptly and fully.",
    defi_relevance: "Even in decentralized systems, consider the ethical implications of tax obligations related to crypto gains.",
    financial_keywords: ["taxes", "obligations", "financial responsibility"]
  },
  {
    text: "Dishonest money dwindles away, but whoever gathers money little by little makes it grow.",
    reference: "Proverbs 13:11",
    category: "wealth",
    principle: "Wealth gained through dishonest means doesn't last, while patient, honest accumulation leads to sustainable growth.",
    application: "Build wealth gradually through honest work and consistent saving rather than get-rich-quick schemes.",
    defi_relevance: "Be wary of DeFi projects promising unrealistic returns; focus on sustainable yield strategies.",
    financial_keywords: ["honesty", "patience", "saving", "sustainable growth"]
  },
  {
    text: "Whoever loves money never has enough; whoever loves wealth is never satisfied with their income. This too is meaningless.",
    reference: "Ecclesiastes 5:10",
    category: "wealth",
    principle: "The pursuit of wealth for its own sake leads to perpetual dissatisfaction.",
    application: "Seek contentment regardless of financial circumstances and use wealth as a tool, not an end goal.",
    defi_relevance: "Don't let the pursuit of yield in DeFi become an obsession that's never satisfied.",
    financial_keywords: ["contentment", "greed", "materialism"]
  },
  {
    text: "Honor the Lord with your wealth, with the firstfruits of all your crops.",
    reference: "Proverbs 3:9",
    category: "giving",
    principle: "God should be honored first with our financial resources.",
    application: "Make giving a priority, not an afterthought in financial planning.",
    defi_relevance: "Consider how DeFi tools might enable more efficient or transparent charitable giving.",
    financial_keywords: ["giving", "tithing", "firstfruits", "priorities"]
  },
  {
    text: "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.",
    reference: "2 Corinthians 9:7",
    category: "giving",
    principle: "Giving should be done willingly and joyfully, not out of obligation.",
    application: "Develop a generous heart that gives freely rather than from external pressure.",
    defi_relevance: "Programmable money in DeFi can enable automated, intentional giving strategies.",
    financial_keywords: ["giving", "generosity", "attitude", "cheerfulness"]
  },
  {
    text: "Whoever can be trusted with very little can also be trusted with much, and whoever is dishonest with very little will also be dishonest with much.",
    reference: "Luke 16:10",
    category: "stewardship",
    principle: "Faithfulness in managing resources is a matter of character, not amount.",
    application: "Demonstrate integrity in all financial dealings, regardless of the sum involved.",
    defi_relevance: "Practice good security and risk management with small amounts before committing larger sums to DeFi protocols.",
    financial_keywords: ["trustworthiness", "integrity", "stewardship", "character"]
  },
  {
    text: "Do not store up for yourselves treasures on earth, where moths and vermin destroy, and where thieves break in and steal. But store up for yourselves treasures in heaven.",
    reference: "Matthew 6:19-20",
    category: "wealth",
    principle: "Earthly wealth is temporary and vulnerable; heavenly treasures are eternal.",
    application: "Invest in eternal values and relationships rather than solely accumulating material wealth.",
    defi_relevance: "Remember that even the most secure digital assets are still 'treasures on earth' and should not be our ultimate focus.",
    financial_keywords: ["eternal perspective", "priorities", "investment", "materialism"]
  },
  {
    text: "The sleep of a laborer is sweet, whether they eat little or much, but as for the rich, their abundance permits them no sleep.",
    reference: "Ecclesiastes 5:12",
    category: "work",
    principle: "Honest work brings satisfaction, while wealth can bring anxiety.",
    application: "Find contentment in productive work rather than accumulation of wealth.",
    defi_relevance: "Don't sacrifice peace of mind by over-investing in volatile DeFi projects that cause anxiety.",
    financial_keywords: ["contentment", "work ethic", "anxiety", "peace"]
  },
  {
    text: "Lazy hands make for poverty, but diligent hands bring wealth.",
    reference: "Proverbs 10:4",
    category: "work",
    principle: "Diligence and hard work are connected to financial provision.",
    application: "Cultivate a strong work ethic and avoid laziness.",
    defi_relevance: "Due diligence and active management of DeFi investments often yield better results than passive, uninformed approaches.",
    financial_keywords: ["diligence", "work ethic", "productivity", "laziness"]
  },
  {
    text: "The plans of the diligent lead to profit as surely as haste leads to poverty.",
    reference: "Proverbs 21:5",
    category: "stewardship",
    principle: "Careful planning leads to financial success, while hasty decisions lead to loss.",
    application: "Take time to develop thoughtful financial plans rather than making impulsive decisions.",
    defi_relevance: "Research DeFi protocols thoroughly before investing rather than chasing the latest high-yield opportunity.",
    financial_keywords: ["planning", "patience", "impulsivity", "research"]
  },
  {
    text: "Whoever oppresses the poor for his own increase and whoever gives to the rich, both come to poverty.",
    reference: "Proverbs 22:16",
    category: "wealth",
    principle: "Exploiting the vulnerable or currying favor with the wealthy leads to ruin.",
    application: "Build wealth through ethical means that don't harm others.",
    defi_relevance: "Avoid DeFi projects that profit from exploiting less knowledgeable users or that have predatory tokenomics.",
    financial_keywords: ["ethics", "exploitation", "justice", "sustainable wealth"]
  },
  {
    text: "Better a little with righteousness than much gain with injustice.",
    reference: "Proverbs 16:8",
    category: "wealth",
    principle: "Ethical wealth, even if modest, is better than unethical abundance.",
    application: "Choose integrity over profit when faced with ethical dilemmas.",
    defi_relevance: "It's better to earn modest yields through ethical DeFi protocols than high returns from questionable projects.",
    financial_keywords: ["ethics", "integrity", "contentment", "justice"]
  },
  {
    text: "Whoever walks in integrity walks securely, but whoever takes crooked paths will be found out.",
    reference: "Proverbs 10:9",
    category: "honesty"
  },
  {
    text: "A good name is more desirable than great riches; to be esteemed is better than silver or gold.",
    reference: "Proverbs 22:1",
    category: "wealth",
    principle: "Reputation and integrity are more valuable than material wealth.",
    application: "Prioritize maintaining your integrity and reputation in all financial dealings.",
    defi_relevance: "In the DeFi space, reputation and trust are crucial assets for projects and individuals alike.",
    financial_keywords: ["reputation", "integrity", "priorities", "values"]
  },
  {
    text: "The wealth of the rich is their fortified city; they imagine it a wall too high to scale.",
    reference: "Proverbs 18:11",
    category: "wealth",
    principle: "Wealth can create a false sense of security.",
    application: "Don't place your ultimate trust in financial resources.",
    defi_relevance: "Even the most secure DeFi protocols carry risks; diversification and proper risk management are essential.",
    financial_keywords: ["security", "trust", "risk", "diversification"]
  },
  {
    text: "Cast but a glance at riches, and they are gone, for they will surely sprout wings and fly off to the sky like an eagle.",
    reference: "Proverbs 23:5",
    category: "wealth",
    principle: "Wealth is temporary and can disappear quickly.",
    application: "Hold material possessions loosely and don't base your identity on them.",
    defi_relevance: "Crypto markets are volatile; don't invest funds you can't afford to lose in DeFi protocols.",
    financial_keywords: ["volatility", "impermanence", "detachment", "risk"]
  },
  {
    text: "Suppose one of you wants to build a tower. Won't you first sit down and estimate the cost to see if you have enough money to complete it?",
    reference: "Luke 14:28",
    category: "stewardship",
    principle: "Counting the cost before undertaking projects is wise stewardship.",
    application: "Create budgets and financial plans before making major financial commitments.",
    defi_relevance: "Calculate gas fees, impermanent loss risks, and other costs before entering DeFi positions.",
    financial_keywords: ["planning", "budgeting", "foresight", "calculation"]
  },
  {
    text: "The borrower is slave to the lender.",
    reference: "Proverbs 22:7b",
    category: "debt",
    principle: "Debt creates a power imbalance that limits freedom.",
    application: "Minimize debt to maintain financial freedom and flexibility.",
    defi_relevance: "Be cautious with leverage and borrowing in DeFi to avoid liquidation risks and financial servitude.",
    financial_keywords: ["debt", "freedom", "leverage", "risk"]
  }
];

export const getVersesByCategory = (category: string): ComprehensiveBibleVerse[] => {
  return comprehensiveBibleVerses.filter(verse => verse.category === category);
};

export const getVerseByReference = (reference: string): ComprehensiveBibleVerse | undefined => {
  return comprehensiveBibleVerses.find(verse => verse.reference === reference);
};

export const getAllCategories = (): string[] => {
  const categories = new Set<string>();
  comprehensiveBibleVerses.forEach(verse => {
    if (verse.category) {
      categories.add(verse.category);
    }
  });
  return Array.from(categories);
};
