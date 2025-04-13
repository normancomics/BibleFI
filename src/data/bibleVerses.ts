
export interface BibleVerse {
  reference: string;
  text: string;
  category: "wealth" | "giving" | "work" | "stewardship" | "taxes" | "debt";
  key: string;
}

export const financialVerses: BibleVerse[] = [
  {
    reference: "Proverbs 13:11",
    text: "Wealth gained hastily will dwindle, but whoever gathers little by little will increase it.",
    category: "wealth",
    key: "gather-little-by-little"
  },
  {
    reference: "Proverbs 21:20",
    text: "The wise store up choice food and olive oil, but fools gulp theirs down.",
    category: "stewardship",
    key: "store-up"
  },
  {
    reference: "Proverbs 22:7",
    text: "The rich rule over the poor, and the borrower is slave to the lender.",
    category: "debt",
    key: "borrower-slave"
  },
  {
    reference: "Matthew 22:21",
    text: "Render unto Caesar the things that are Caesar's, and unto God the things that are God's.",
    category: "taxes",
    key: "render-caesar"
  },
  {
    reference: "Malachi 3:10",
    text: "Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this, says the LORD Almighty, and see if I will not throw open the floodgates of heaven and pour out so much blessing that there will not be room enough to store it.",
    category: "giving",
    key: "whole-tithe"
  },
  {
    reference: "Proverbs 10:4",
    text: "Lazy hands make for poverty, but diligent hands bring wealth.",
    category: "work",
    key: "diligent-hands"
  },
  {
    reference: "Ecclesiastes 11:2",
    text: "Invest in seven ventures, yes, in eight; you do not know what disaster may come upon the land.",
    category: "wealth",
    key: "diversify"
  },
  {
    reference: "Luke 14:28",
    text: "For which of you, intending to build a tower, does not sit down first and count the cost, whether he has enough to finish it?",
    category: "stewardship",
    key: "count-cost"
  },
  {
    reference: "1 Timothy 6:10",
    text: "For the love of money is a root of all kinds of evil. Some people, eager for money, have wandered from the faith and pierced themselves with many griefs.",
    category: "wealth",
    key: "love-of-money"
  },
  {
    reference: "Acts 20:35",
    text: "In everything I did, I showed you that by this kind of hard work we must help the weak, remembering the words the Lord Jesus himself said: 'It is more blessed to give than to receive.'",
    category: "giving",
    key: "blessed-give"
  }
];

export const getVersesByCategory = (category: BibleVerse["category"]) => {
  return financialVerses.filter(verse => verse.category === category);
};

export const getRandomVerse = () => {
  return financialVerses[Math.floor(Math.random() * financialVerses.length)];
};
