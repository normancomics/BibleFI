
export interface ComprehensiveBibleVerse {
  reference: string;
  text: string;
  category: "wealth" | "giving" | "work" | "stewardship" | "taxes" | "debt" | "contentment" | "generosity" | "planning" | "investing" | "poverty" | "justice" | "wisdom" | "diligence" | "honesty" | "inheritance" | "treasure" | "materialism" | "provision" | "lending" | "interest" | "profit" | "business" | "trade" | "saving" | "abundance" | "blessing" | "covenant" | "reward" | "punishment";
  testament: "Old" | "New";
  book: string;
  chapter: number;
  verse: number;
  key: string;
  principle?: string;
  application?: string;
  rarity: "common" | "uncommon" | "rare" | "obscure";
}

// Comprehensive database of ALL biblical financial references
export const allBiblicalFinancialVerses: ComprehensiveBibleVerse[] = [
  // GENESIS - Financial Foundations
  {
    reference: "Genesis 1:28",
    text: "God blessed them and said to them, 'Be fruitful and increase in number; fill the earth and subdue it. Rule over the fish in the sea and the birds in the sky and over every living creature that moves on the ground.'",
    category: "stewardship",
    testament: "Old",
    book: "Genesis",
    chapter: 1,
    verse: 28,
    key: "dominion-mandate",
    principle: "God gave humanity dominion over creation with responsibility",
    application: "Approach wealth creation as stewardship, not ownership",
    rarity: "common"
  },
  {
    reference: "Genesis 2:15",
    text: "The LORD God took the man and put him in the Garden of Eden to work it and take care of it.",
    category: "work",
    testament: "Old",
    book: "Genesis",
    chapter: 2,
    verse: 15,
    key: "work-mandate",
    principle: "Work is part of God's original design for humanity",
    application: "Approach work and wealth creation as worship",
    rarity: "common"
  },
  {
    reference: "Genesis 8:22",
    text: "As long as the earth endures, seedtime and harvest, cold and heat, summer and winter, day and night will never cease.",
    category: "investing",
    testament: "Old",
    book: "Genesis",
    chapter: 8,
    verse: 22,
    key: "seedtime-harvest",
    principle: "God established natural cycles of sowing and reaping",
    application: "Investment returns follow natural cycles - be patient",
    rarity: "uncommon"
  },
  {
    reference: "Genesis 13:2",
    text: "Abram had become very wealthy in livestock and in silver and gold.",
    category: "wealth",
    testament: "Old",
    book: "Genesis",
    chapter: 13,
    verse: 2,
    key: "abram-wealthy",
    principle: "God can bless His people with material wealth",
    application: "Wealth itself is not evil when obtained righteously",
    rarity: "common"
  },
  {
    reference: "Genesis 14:20",
    text: "And praise be to God Most High, who delivered your enemies into your hand. Then Abram gave him a tenth of everything.",
    category: "giving",
    testament: "Old",
    book: "Genesis",
    chapter: 14,
    verse: 20,
    key: "first-tithe",
    principle: "The first recorded tithe was given in gratitude",
    application: "Tithing is a response to God's blessing and provision",
    rarity: "common"
  },
  {
    reference: "Genesis 26:12-14",
    text: "Isaac planted crops in that land and the same year reaped a hundredfold, because the LORD blessed him. The man became rich, and his wealth continued to grow until he became very wealthy. He had so many flocks and herds and servants that the Philistines envied him.",
    category: "blessing",
    testament: "Old",
    book: "Genesis",
    chapter: 26,
    verse: 12,
    key: "isaac-hundredfold",
    principle: "God can multiply righteous investments exponentially",
    application: "Seek God's blessing on your investments and expect multiplication",
    rarity: "uncommon"
  },
  {
    reference: "Genesis 28:20-22",
    text: "Then Jacob made a vow, saying, 'If God will be with me and will watch over me on this journey I am taking and will give me food to eat and clothes to wear so that I return safely to my father's household, then the LORD will be my God and this stone that I have set up as a pillar will be God's house, and of all that you give me I will give you a tenth.'",
    category: "covenant",
    testament: "Old",
    book: "Genesis",
    chapter: 28,
    verse: 20,
    key: "jacob-tithe-vow",
    principle: "Financial commitments can be part of covenant relationship with God",
    application: "Make tithing a covenant commitment, not just a donation",
    rarity: "uncommon"
  },
  {
    reference: "Genesis 39:2-3",
    text: "The LORD was with Joseph so that he prospered, and he lived in the house of his Egyptian master. When his master saw that the LORD was with him and that the LORD gave him success in everything he did.",
    category: "blessing",
    testament: "Old",
    book: "Genesis",
    chapter: 39,
    verse: 2,
    key: "joseph-prospered",
    principle: "God's presence brings success in all endeavors",
    application: "Acknowledge God's role in your financial success",
    rarity: "common"
  },
  {
    reference: "Genesis 41:34-36",
    text: "Let Pharaoh appoint commissioners over the land to take a fifth of the harvest of Egypt during the seven years of abundance. They should collect all the food of these good years that are coming and store up the grain under the authority of Pharaoh, to be kept in the cities for food. This food should be held in reserve for the country, to be used during the seven years of famine that will come upon Egypt, so that the country may not be ruined by the famine.",
    category: "saving",
    testament: "Old",
    book: "Genesis",
    chapter: 41,
    verse: 34,
    key: "joseph-economic-plan",
    principle: "Save during abundance to prepare for scarcity",
    application: "Build emergency funds during good times for market downturns",
    rarity: "common"
  },
  {
    reference: "Genesis 47:24",
    text: "But when the crop comes in, give a fifth of it to Pharaoh. The other four-fifths you may keep as seed for the fields and as food for yourselves and your households and your children.",
    category: "taxes",
    testament: "Old",
    book: "Genesis",
    chapter: 47,
    verse: 24,
    key: "twenty-percent-tax",
    principle: "A 20% tax rate was established in ancient Egypt",
    application: "Government taxation has biblical precedent - pay what is owed",
    rarity: "rare"
  },

  // EXODUS - Laws of Commerce
  {
    reference: "Exodus 18:21",
    text: "But select capable men from all the people—men who fear God, trustworthy men who hate dishonest gain—and appoint them as officials over thousands, hundreds, fifties and tens.",
    category: "honesty",
    testament: "Old",
    book: "Exodus",
    chapter: 18,
    verse: 21,
    key: "hate-dishonest-gain",
    principle: "Leaders must hate dishonest financial gain",
    application: "Choose investment partners who have integrity over profit",
    rarity: "uncommon"
  },
  {
    reference: "Exodus 20:15",
    text: "You shall not steal.",
    category: "honesty",
    testament: "Old",
    book: "Exodus",
    chapter: 20,
    verse: 15,
    key: "no-stealing",
    principle: "Property rights are fundamental to biblical economics",
    application: "Respect intellectual property and avoid piracy in business",
    rarity: "common"
  },
  {
    reference: "Exodus 20:17",
    text: "You shall not covet your neighbor's house. You shall not covet your neighbor's wife, or his male or female servant, his ox or donkey, or anything that belongs to your neighbor.",
    category: "contentment",
    testament: "Old",
    book: "Exodus",
    chapter: 20,
    verse: 17,
    key: "no-coveting",
    principle: "Contentment with what you have prevents destructive desire",
    application: "Avoid FOMO investing based on others' success",
    rarity: "common"
  },
  {
    reference: "Exodus 22:25",
    text: "If you lend money to one of my people among you who is needy, do not treat it like a business deal; charge no interest.",
    category: "lending",
    testament: "Old",
    book: "Exodus",
    chapter: 22,
    verse: 25,
    key: "no-interest-poor",
    principle: "Lending to the poor should be charitable, not profitable",
    application: "Consider charitable lending alongside profit-seeking investments",
    rarity: "uncommon"
  },
  {
    reference: "Exodus 23:8",
    text: "Do not accept a bribe, for a bribe blinds those who see and twists the words of the innocent.",
    category: "justice",
    testament: "Old",
    book: "Exodus",
    chapter: 23,
    verse: 8,
    key: "no-bribes",
    principle: "Financial corruption perverts justice",
    application: "Avoid investing in companies known for corruption",
    rarity: "common"
  },

  // LEVITICUS - Sabbath Economics
  {
    reference: "Leviticus 19:35-36",
    text: "Do not use dishonest standards when measuring length, weight or quantity. Use honest scales and honest weights, an honest ephah and an honest hin.",
    category: "honesty",
    testament: "Old",
    book: "Leviticus",
    chapter: 19,
    verse: 35,
    key: "honest-weights",
    principle: "All business measurements must be honest and accurate",
    application: "Practice transparent accounting and honest reporting",
    rarity: "common"
  },
  {
    reference: "Leviticus 25:14",
    text: "If you sell land to any of your own people or buy land from them, do not take advantage of each other.",
    category: "justice",
    testament: "Old",
    book: "Leviticus",
    chapter: 25,
    verse: 14,
    key: "fair-dealing",
    principle: "Fair dealing in all business transactions is required",
    application: "Ensure all parties benefit fairly in business deals",
    rarity: "common"
  },
  {
    reference: "Leviticus 25:23",
    text: "The land must not be sold permanently, because the land is mine and you reside in my land as foreigners and strangers.",
    category: "stewardship",
    testament: "Old",
    book: "Leviticus",
    chapter: 25,
    verse: 23,
    key: "land-ownership",
    principle: "Ultimate ownership belongs to God; we are stewards",
    application: "Hold all investments with open hands as God's steward",
    rarity: "uncommon"
  },
  {
    reference: "Leviticus 25:35-37",
    text: "If any of your fellow Israelites become poor and are unable to support themselves among you, help them as you would a foreigner and stranger, so they can continue to live among you. Do not take interest or any profit from them, but fear your God, so that they may continue to live among you. You must not lend them money at interest or sell them food at a profit.",
    category: "lending",
    testament: "Old",
    book: "Leviticus",
    chapter: 25,
    verse: 35,
    key: "help-poor-no-interest",
    principle: "Help the poor without profiting from their distress",
    application: "Balance profit-seeking with charitable assistance",
    rarity: "uncommon"
  },
  {
    reference: "Leviticus 27:30",
    text: "A tithe of everything from the land, whether grain from the soil or fruit from the trees, belongs to the LORD; it is holy to the LORD.",
    category: "giving",
    testament: "Old",
    book: "Leviticus",
    chapter: 27,
    verse: 30,
    key: "tithe-belongs-lord",
    principle: "The tithe belongs to God, not to us",
    application: "Tithe before making other financial decisions",
    rarity: "common"
  },

  // DEUTERONOMY - Economic Laws
  {
    reference: "Deuteronomy 8:18",
    text: "But remember the LORD your God, for it is he who gives you the ability to produce wealth, and so confirms his covenant, which he swore to your ancestors, as it is today.",
    category: "wealth",
    testament: "Old",
    book: "Deuteronomy",
    chapter: 8,
    verse: 18,
    key: "god-gives-ability",
    principle: "God is the source of wealth-creating ability",
    application: "Acknowledge God in all financial success and give Him credit",
    rarity: "common"
  },
  {
    reference: "Deuteronomy 14:22-23",
    text: "Be sure to set aside a tenth of all that your fields produce each year. Eat the tithe of your grain, new wine and olive oil, and the firstborn of your herds and flocks in the presence of the LORD your God at the place he will choose as a dwelling for his Name, so that you may learn to revere the LORD your God always.",
    category: "giving",
    testament: "Old",
    book: "Deuteronomy",
    chapter: 14,
    verse: 22,
    key: "annual-tithe",
    principle: "Tithing teaches reverence for God",
    application: "Use tithing as a spiritual discipline, not just giving",
    rarity: "common"
  },
  {
    reference: "Deuteronomy 15:6",
    text: "For the LORD your God will bless you as he has promised, and you will lend to many nations but will not borrow; you will rule over many nations but none will rule over you.",
    category: "debt",
    testament: "Old",
    book: "Deuteronomy",
    chapter: 15,
    verse: 6,
    key: "lender-not-borrower",
    principle: "God's blessing makes you a lender, not a borrower",
    application: "Work toward becoming debt-free and able to help others",
    rarity: "common"
  },
  {
    reference: "Deuteronomy 15:7-8",
    text: "If anyone is poor among your fellow Israelites in any of the towns of the land the LORD your God is giving you, do not be hardhearted or tightfisted toward them. Rather, be openhanded and freely lend them whatever they need.",
    category: "generosity",
    testament: "Old",
    book: "Deuteronomy",
    chapter: 15,
    verse: 7,
    key: "openhanded-giving",
    principle: "Generosity toward the poor is commanded",
    application: "Include charitable giving in your financial planning",
    rarity: "common"
  },
  {
    reference: "Deuteronomy 23:19-20",
    text: "Do not charge a fellow Israelite interest, whether on money or food or anything else that may earn interest. You may charge a foreigner interest, but not a fellow Israelite, so that the LORD your God may bless you in everything you put your hand to in the land you are entering to possess.",
    category: "interest",
    testament: "Old",
    book: "Deuteronomy",
    chapter: 23,
    verse: 19,
    key: "interest-laws",
    principle: "Interest charging has community boundaries",
    application: "Consider the impact of financial decisions on your community",
    rarity: "rare"
  },
  {
    reference: "Deuteronomy 25:13-16",
    text: "Do not have two differing weights in your bag—one heavy, one light. Do not have two differing measures in your house—one large, one small. You must have accurate and honest weights and measures, so that you may live long in the land the LORD your God is giving you. For the LORD your God detests anyone who does these things, anyone who deals dishonestly.",
    category: "honesty",
    testament: "Old",
    book: "Deuteronomy",
    chapter: 25,
    verse: 13,
    key: "honest-measures",
    principle: "God detests dishonest business practices",
    application: "Maintain complete honesty in all business dealings",
    rarity: "common"
  },
  {
    reference: "Deuteronomy 28:12",
    text: "The LORD will open the heavens, the storehouse of his bounty, to send rain on your land in season and to bless all the work of your hands. You will lend to many nations but will not borrow from any.",
    category: "blessing",
    testament: "Old",
    book: "Deuteronomy",
    chapter: 28,
    verse: 12,
    key: "storehouse-blessing",
    principle: "God's blessing leads to financial abundance and lending capacity",
    application: "Seek God's blessing on your work for supernatural provision",
    rarity: "common"
  },

  // Add all other books with their financial verses...
  // This is a sampling - the full database would include hundreds more verses
  // from every book of the Bible that mentions finances, wealth, poverty, etc.

  // PROVERBS - Wisdom Literature (Most Financial Content)
  {
    reference: "Proverbs 3:9-10",
    text: "Honor the LORD with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing, and your vats will brim over with new wine.",
    category: "giving",
    testament: "Old",
    book: "Proverbs",
    chapter: 3,
    verse: 9,
    key: "firstfruits-honor",
    principle: "Honor God with the first and best of your income",
    application: "Automate tithing to occur before other expenses",
    rarity: "common"
  },
  {
    reference: "Proverbs 6:6-8",
    text: "Go to the ant, you sluggard; consider its ways and be wise! It has no commander, no overseer or ruler, yet it stores its provisions in summer and gathers its food at harvest.",
    category: "planning",
    testament: "Old",
    book: "Proverbs",
    chapter: 6,
    verse: 6,
    key: "ant-wisdom",
    principle: "Learn from nature to save during abundance",
    application: "Build reserves during market uptrends",
    rarity: "common"
  },
  {
    reference: "Proverbs 10:4",
    text: "Lazy hands make for poverty, but diligent hands bring wealth.",
    category: "work",
    testament: "Old",
    book: "Proverbs",
    chapter: 10,
    verse: 4,
    key: "diligent-hands",
    principle: "Diligence is the path to wealth",
    application: "Consistently research and monitor your investments",
    rarity: "common"
  },
  {
    reference: "Proverbs 10:22",
    text: "The blessing of the LORD brings wealth, without painful toil for it.",
    category: "blessing",
    testament: "Old",
    book: "Proverbs",
    chapter: 10,
    verse: 22,
    key: "blessing-brings-wealth",
    principle: "God's blessing can bring wealth without excessive struggle",
    application: "Seek God's blessing rather than just working harder",
    rarity: "common"
  },
  {
    reference: "Proverbs 11:1",
    text: "The LORD detests dishonest scales, but accurate weights find favor with him.",
    category: "honesty",
    testament: "Old",
    book: "Proverbs",
    chapter: 11,
    verse: 1,
    key: "honest-scales",
    principle: "God cares about business honesty and accuracy",
    application: "Ensure all financial reporting is completely accurate",
    rarity: "common"
  },
  {
    reference: "Proverbs 11:24-25",
    text: "One person gives freely, yet gains even more; another withholds unduly, but comes to poverty. A generous person will prosper; whoever refreshes others will be refreshed.",
    category: "generosity",
    testament: "Old",
    book: "Proverbs",
    chapter: 11,
    verse: 24,
    key: "generous-prospers",
    principle: "Generosity leads to increase; hoarding leads to loss",
    application: "Include charitable giving in your wealth-building strategy",
    rarity: "common"
  },
  {
    reference: "Proverbs 13:11",
    text: "Dishonest money dwindles away, but whoever gathers money little by little makes it grow.",
    category: "wealth",
    testament: "Old",
    book: "Proverbs",
    chapter: 13,
    verse: 11,
    key: "little-by-little",
    principle: "Steady accumulation beats quick schemes",
    application: "Use dollar-cost averaging instead of timing the market",
    rarity: "common"
  },
  {
    reference: "Proverbs 13:22",
    text: "A good person leaves an inheritance for their children's children, but a sinner's wealth is stored up for the righteous.",
    category: "inheritance",
    testament: "Old",
    book: "Proverbs",
    chapter: 13,
    verse: 22,
    key: "generational-wealth",
    principle: "Plan for generational wealth transfer",
    application: "Build wealth that can benefit your grandchildren",
    rarity: "common"
  },
  {
    reference: "Proverbs 14:23",
    text: "All hard work brings a profit, but mere talk leads only to poverty.",
    category: "work",
    testament: "Old",
    book: "Proverbs",
    chapter: 14,
    verse: 23,
    key: "work-brings-profit",
    principle: "Action, not just planning, creates wealth",
    application: "Execute your investment plan rather than just researching",
    rarity: "common"
  },
  {
    reference: "Proverbs 15:27",
    text: "The greedy bring ruin to their households, but the one who hates bribes will live.",
    category: "contentment",
    testament: "Old",
    book: "Proverbs",
    chapter: 15,
    verse: 27,
    key: "greed-ruins",
    principle: "Greed destroys families; integrity preserves life",
    application: "Avoid get-rich-quick schemes that could harm your family",
    rarity: "common"
  },
  {
    reference: "Proverbs 16:8",
    text: "Better a little with righteousness than much gain with injustice.",
    category: "justice",
    testament: "Old",
    book: "Proverbs",
    chapter: 16,
    verse: 8,
    key: "little-with-righteousness",
    principle: "Righteous poverty is better than corrupt wealth",
    application: "Choose ethical investments even if returns are lower",
    rarity: "common"
  },
  {
    reference: "Proverbs 17:16",
    text: "Why should fools have money in hand to buy wisdom, when they are not able to understand it?",
    category: "wisdom",
    testament: "Old",
    book: "Proverbs",
    chapter: 17,
    verse: 16,
    key: "wisdom-before-wealth",
    principle: "Wisdom must precede wealth for proper use",
    application: "Invest in financial education before investing money",
    rarity: "uncommon"
  },
  {
    reference: "Proverbs 19:14",
    text: "Houses and wealth are inherited from parents, but a prudent wife is from the LORD.",
    category: "inheritance",
    testament: "Old",
    book: "Proverbs",
    chapter: 19,
    verse: 14,
    key: "prudent-wife",
    principle: "A wise spouse is more valuable than inherited wealth",
    application: "Include your spouse in all major financial decisions",
    rarity: "uncommon"
  },
  {
    reference: "Proverbs 20:21",
    text: "An inheritance claimed too soon will not be blessed at the end.",
    category: "inheritance",
    testament: "Old",
    book: "Proverbs",
    chapter: 20,
    verse: 21,
    key: "inheritance-too-soon",
    principle: "Premature wealth often lacks blessing",
    application: "Allow investments to mature rather than cashing out early",
    rarity: "rare"
  },
  {
    reference: "Proverbs 21:5",
    text: "The plans of the diligent lead to profit as surely as haste leads to poverty.",
    category: "planning",
    testament: "Old",
    book: "Proverbs",
    chapter: 21,
    verse: 5,
    key: "diligent-plans",
    principle: "Careful planning leads to profit; haste leads to loss",
    application: "Take time to plan investments rather than rushing in",
    rarity: "common"
  },
  {
    reference: "Proverbs 21:17",
    text: "Whoever loves pleasure will become poor; whoever loves wine and olive oil will never be rich.",
    category: "contentment",
    testament: "Old",
    book: "Proverbs",
    chapter: 21,
    verse: 17,
    key: "pleasure-poverty",
    principle: "Excessive pleasure-seeking prevents wealth building",
    application: "Control lifestyle inflation to maintain savings rate",
    rarity: "common"
  },
  {
    reference: "Proverbs 21:20",
    text: "The wise store up choice food and olive oil, but fools gulp theirs down.",
    category: "saving",
    testament: "Old",
    book: "Proverbs",
    chapter: 21,
    verse: 20,
    key: "wise-store-up",
    principle: "Wisdom involves saving; foolishness consumes everything",
    application: "Live below your means and save consistently",
    rarity: "common"
  },
  {
    reference: "Proverbs 22:1",
    text: "A good name is more desirable than great riches; to be esteemed is better than silver or gold.",
    category: "wealth",
    testament: "Old",
    book: "Proverbs",
    chapter: 22,
    verse: 1,
    key: "good-name",
    principle: "Reputation is more valuable than money",
    application: "Never compromise integrity for financial gain",
    rarity: "common"
  },
  {
    reference: "Proverbs 22:2",
    text: "Rich and poor have this in common: The LORD is the Maker of them all.",
    category: "justice",
    testament: "Old",
    book: "Proverbs",
    chapter: 22,
    verse: 2,
    key: "rich-poor-common",
    principle: "All people have equal dignity regardless of wealth",
    application: "Treat all people with respect regardless of their financial status",
    rarity: "uncommon"
  },
  {
    reference: "Proverbs 22:7",
    text: "The rich rule over the poor, and the borrower is slave to the lender.",
    category: "debt",
    testament: "Old",
    book: "Proverbs",
    chapter: 22,
    verse: 7,
    key: "borrower-slave",
    principle: "Debt creates a master-slave relationship",
    application: "Minimize debt to maintain financial freedom",
    rarity: "common"
  },
  {
    reference: "Proverbs 22:16",
    text: "One who oppresses the poor to increase his wealth and one who gives gifts to the rich—both come to poverty.",
    category: "justice",
    testament: "Old",
    book: "Proverbs",
    chapter: 22,
    verse: 16,
    key: "oppress-poor",
    principle: "Exploiting the poor leads to eventual poverty",
    application: "Ensure your investments don't exploit vulnerable populations",
    rarity: "uncommon"
  },
  {
    reference: "Proverbs 22:26-27",
    text: "Do not be one who shakes hands in pledge or puts up security for debts; if you lack the means to pay, your very bed will be snatched from under you.",
    category: "debt",
    testament: "Old",
    book: "Proverbs",
    chapter: 22,
    verse: 26,
    key: "cosigning-warning",
    principle: "Avoid guaranteeing others' debts",
    application: "Be extremely cautious about cosigning loans or guarantees",
    rarity: "common"
  },
  {
    reference: "Proverbs 23:4-5",
    text: "Do not wear yourself out to get rich; do not trust your own cleverness. Cast but a glance at riches, and they are gone, for they will surely sprout wings and fly off to the sky like an eagle.",
    category: "contentment",
    testament: "Old",
    book: "Proverbs",
    chapter: 23,
    verse: 4,
    key: "riches-fly-away",
    principle: "Don't exhaust yourself pursuing wealth; it's fleeting",
    application: "Maintain work-life balance while building wealth",
    rarity: "common"
  },
  {
    reference: "Proverbs 27:23-24",
    text: "Be sure you know the condition of your flocks, give careful attention to your herds; for riches do not endure forever, and a crown is not secure for all generations.",
    category: "stewardship",
    testament: "Old",
    book: "Proverbs",
    chapter: 27,
    verse: 23,
    key: "know-condition",
    principle: "Monitor your assets carefully; wealth doesn't last forever",
    application: "Regularly review and rebalance your investment portfolio",
    rarity: "common"
  },
  {
    reference: "Proverbs 28:6",
    text: "Better the poor whose walk is blameless than the rich whose ways are perverse.",
    category: "integrity",
    testament: "Old",
    book: "Proverbs",
    chapter: 28,
    verse: 6,
    key: "poor-blameless",
    principle: "Integrity is more valuable than corrupt wealth",
    application: "Choose ethical investments over maximum returns",
    rarity: "common"
  },
  {
    reference: "Proverbs 28:8",
    text: "Whoever increases wealth by taking interest or profit from the poor amasses it for another, who will be kind to the poor.",
    category: "justice",
    testament: "Old",
    book: "Proverbs",
    chapter: 28,
    verse: 8,
    key: "exploit-poor",
    principle: "Wealth gained by exploiting the poor will be redistributed",
    application: "Avoid investments that profit from exploiting vulnerable people",
    rarity: "rare"
  },
  {
    reference: "Proverbs 28:19",
    text: "Those who work their land will have abundant food, but those who chase fantasies will have their fill of poverty.",
    category: "work",
    testament: "Old",
    book: "Proverbs",
    chapter: 28,
    verse: 19,
    key: "work-land",
    principle: "Real work produces abundance; fantasies produce poverty",
    application: "Focus on solid investments rather than speculative schemes",
    rarity: "common"
  },
  {
    reference: "Proverbs 28:20",
    text: "A faithful person will be richly blessed, but one eager to get rich will not go unpunished.",
    category: "blessing",
    testament: "Old",
    book: "Proverbs",
    chapter: 28,
    verse: 20,
    key: "faithful-blessed",
    principle: "Faithfulness brings blessing; greed brings punishment",
    application: "Focus on faithful stewardship rather than quick riches",
    rarity: "common"
  },
  {
    reference: "Proverbs 28:22",
    text: "The stingy are eager to get rich and are unaware that poverty awaits them.",
    category: "generosity",
    testament: "Old",
    book: "Proverbs",
    chapter: 28,
    verse: 22,
    key: "stingy-poor",
    principle: "Stinginess leads to poverty despite wealth-seeking",
    application: "Practice generosity even while building wealth",
    rarity: "common"
  },
  {
    reference: "Proverbs 28:25",
    text: "The greedy stir up conflict, but those who trust in the LORD will prosper.",
    category: "contentment",
    testament: "Old",
    book: "Proverbs",
    chapter: 28,
    verse: 25,
    key: "trust-lord-prosper",
    principle: "Trust in God leads to prosperity; greed creates conflict",
    application: "Make investment decisions based on trust in God, not fear or greed",
    rarity: "common"
  },
  {
    reference: "Proverbs 30:8-9",
    text: "Keep falsehood and lies far from me; give me neither poverty nor riches, but give me only my daily bread. Otherwise, I may have too much and disown you and say, 'Who is the LORD?' Or I may become poor and steal and so dishonor the name of my God.",
    category: "contentment",
    testament: "Old",
    book: "Proverbs",
    chapter: 30,
    verse: 8,
    key: "neither-poverty-riches",
    principle: "Both poverty and extreme wealth can lead to spiritual danger",
    application: "Seek financial sufficiency, not extreme wealth",
    rarity: "uncommon"
  },
  {
    reference: "Proverbs 31:16",
    text: "She considers a field and buys it; out of her earnings she plants a vineyard.",
    category: "investing",
    testament: "Old",
    book: "Proverbs",
    chapter: 31,
    verse: 16,
    key: "considers-buys",
    principle: "Wise investment involves careful consideration and personal earnings",
    application: "Research investments thoroughly and use your own money",
    rarity: "uncommon"
  },
  {
    reference: "Proverbs 31:18",
    text: "She sees that her trading is profitable, and her lamp does not go out at night.",
    category: "business",
    testament: "Old",
    book: "Proverbs",
    chapter: 31,
    verse: 18,
    key: "trading-profitable",
    principle: "Monitor business profitability and work diligently",
    application: "Track investment performance and adjust strategies as needed",
    rarity: "uncommon"
  },

  // ECCLESIASTES - Vanity of Wealth
  {
    reference: "Ecclesiastes 2:26",
    text: "To the person who pleases him, God gives wisdom, knowledge and happiness, but to the sinner he gives the task of gathering and storing up wealth to hand it over to the one who pleases God.",
    category: "wealth",
    testament: "Old",
    book: "Ecclesiastes",
    chapter: 2,
    verse: 26,
    key: "wealth-transfer",
    principle: "Wealth ultimately transfers to those who please God",
    application: "Focus on pleasing God rather than just accumulating wealth",
    rarity: "uncommon"
  },
  {
    reference: "Ecclesiastes 3:13",
    text: "That each of them may eat and drink, and find satisfaction in all their toil—this is the gift of God.",
    category: "contentment",
    testament: "Old",
    book: "Ecclesiastes",
    chapter: 3,
    verse: 13,
    key: "satisfaction-gift",
    principle: "Finding satisfaction in work is God's gift",
    application: "Seek fulfillment in your work, not just financial returns",
    rarity: "uncommon"
  },
  {
    reference: "Ecclesiastes 5:10",
    text: "Whoever loves money never has enough; whoever loves wealth is never satisfied with their income. This too is meaningless.",
    category: "contentment",
    testament: "Old",
    book: "Ecclesiastes",
    chapter: 5,
    verse: 10,
    key: "love-money-never-enough",
    principle: "Loving money creates insatiable desire",
    application: "Set specific financial goals rather than always wanting more",
    rarity: "common"
  },
  {
    reference: "Ecclesiastes 5:12",
    text: "The sleep of a laborer is sweet, whether they eat little or much, but as for the rich, their abundance permits them no sleep.",
    category: "contentment",
    testament: "Old",
    book: "Ecclesiastes",
    chapter: 5,
    verse: 12,
    key: "laborer-sleep-sweet",
    principle: "Simple living often brings more peace than wealth",
    application: "Don't let investment stress rob you of peace and sleep",
    rarity: "uncommon"
  },
  {
    reference: "Ecclesiastes 5:13-14",
    text: "I have seen a grievous evil under the sun: wealth hoarded to the harm of its owners, or wealth lost through some misfortune, so that when they have children there is nothing left for them.",
    category: "stewardship",
    testament: "Old",
    book: "Ecclesiastes",
    chapter: 5,
    verse: 13,
    key: "wealth-hoarded-harm",
    principle: "Hoarding wealth can harm the owner; wealth can be lost",
    application: "Use wealth purposefully rather than just accumulating",
    rarity: "uncommon"
  },
  {
    reference: "Ecclesiastes 7:12",
    text: "Wisdom is a shelter as money is a shelter, but the advantage of knowledge is this: Wisdom preserves those who have it.",
    category: "wisdom",
    testament: "Old",
    book: "Ecclesiastes",
    chapter: 7,
    verse: 12,
    key: "wisdom-money-shelter",
    principle: "Both wisdom and money provide protection, but wisdom preserves life",
    application: "Invest in wisdom and knowledge alongside financial assets",
    rarity: "uncommon"
  },
  {
    reference: "Ecclesiastes 10:19",
    text: "A feast is made for laughter, wine makes life merry, and money is the answer for everything.",
    category: "wealth",
    testament: "Old",
    book: "Ecclesiastes",
    chapter: 10,
    verse: 19,
    key: "money-answer-everything",
    principle: "Money seems to solve problems but isn't the ultimate answer",
    application: "Use money as a tool but don't expect it to solve all problems",
    rarity: "rare"
  },
  {
    reference: "Ecclesiastes 11:1",
    text: "Ship your grain across the sea; after many days you may receive a return.",
    category: "investing",
    testament: "Old",
    book: "Ecclesiastes",
    chapter: 11,
    verse: 1,
    key: "ship-grain",
    principle: "International trade and patient investing can yield returns",
    application: "Consider global diversification in your investment portfolio",
    rarity: "uncommon"
  },
  {
    reference: "Ecclesiastes 11:2",
    text: "Invest in seven ventures, yes, in eight; you do not know what disaster may come upon the land.",
    category: "investing",
    testament: "Old",
    book: "Ecclesiastes",
    chapter: 11,
    verse: 2,
    key: "invest-seven-eight",
    principle: "Diversify investments to protect against unknown disasters",
    application: "Spread investments across multiple asset classes and platforms",
    rarity: "common"
  },
  {
    reference: "Ecclesiastes 11:4",
    text: "Whoever watches the wind will not plant; whoever looks at the clouds will not reap.",
    category: "investing",
    testament: "Old",
    book: "Ecclesiastes",
    chapter: 11,
    verse: 4,
    key: "watches-wind",
    principle: "Excessive caution prevents action and results",
    application: "Don't let perfect timing prevent you from investing",
    rarity: "common"
  },
  {
    reference: "Ecclesiastes 11:6",
    text: "Sow your seed in the morning, and at evening let your hands not be idle, for you do not know which will succeed, whether this or that, or whether both will do equally well.",
    category: "investing",
    testament: "Old",
    book: "Ecclesiastes",
    chapter: 11,
    verse: 6,
    key: "sow-morning-evening",
    principle: "Multiple efforts increase chances of success",
    application: "Make regular investments rather than trying to time the market",
    rarity: "common"
  },

  // NEW TESTAMENT

  // MATTHEW - Kingdom Economics
  {
    reference: "Matthew 5:42",
    text: "Give to the one who asks you, and do not turn away from the one who wants to borrow from you.",
    category: "generosity",
    testament: "New",
    book: "Matthew",
    chapter: 5,
    verse: 42,
    key: "give-to-asker",
    principle: "Be generous with both gifts and loans",
    application: "Build capacity to help others financially when they're in need",
    rarity: "common"
  },
  {
    reference: "Matthew 6:19-20",
    text: "Do not store up for yourselves treasures on earth, where moths and vermin destroy, and where thieves break in and steal. But store up for yourselves treasures in heaven, where moths and vermin do not destroy, and where thieves do not break in and steal.",
    category: "treasure",
    testament: "New",
    book: "Matthew",
    chapter: 6,
    verse: 19,
    key: "treasures-heaven",
    principle: "Eternal investments are more secure than temporal ones",
    application: "Balance earthly investments with eternal investments through giving",
    rarity: "common"
  },
  {
    reference: "Matthew 6:21",
    text: "For where your treasure is, there your heart will be also.",
    category: "treasure",
    testament: "New",
    book: "Matthew",
    chapter: 6,
    verse: 21,
    key: "treasure-heart",
    principle: "Your investments reveal and shape your heart's priorities",
    application: "Choose investments that align with your values and God's kingdom",
    rarity: "common"
  },
  {
    reference: "Matthew 6:24",
    text: "No one can serve two masters. Either you will hate the one and love the other, or you will be devoted to the one and despise the other. You cannot serve both God and money.",
    category: "materialism",
    testament: "New",
    book: "Matthew",
    chapter: 6,
    verse: 24,
    key: "cannot-serve-both",
    principle: "Money and God compete for ultimate allegiance",
    application: "Make financial decisions based on serving God, not money",
    rarity: "common"
  },
  {
    reference: "Matthew 6:26",
    text: "Look at the birds of the air; they do not sow or reap or store away in barns, and yet your heavenly Father feeds them. Are you not much more valuable than they?",
    category: "provision",
    testament: "New",
    book: "Matthew",
    chapter: 6,
    verse: 26,
    key: "birds-fed",
    principle: "God provides for His creation; humans are more valuable",
    application: "Trust God's provision while still being responsible stewards",
    rarity: "common"
  },
  {
    reference: "Matthew 6:33",
    text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.",
    category: "provision",
    testament: "New",
    book: "Matthew",
    chapter: 6,
    verse: 33,
    key: "seek-first-kingdom",
    principle: "Seeking God's kingdom first ensures provision",
    application: "Prioritize kingdom values in investment decisions",
    rarity: "common"
  }
  // ... Continue with hundreds more verses from every book of the Bible
];

// Enhanced functions for the comprehensive database
export const getVersesByTestament = (testament: "Old" | "New") => {
  return allBiblicalFinancialVerses.filter(verse => verse.testament === testament);
};

export const getVersesByBook = (book: string) => {
  return allBiblicalFinancialVerses.filter(verse => verse.book === book);
};

export const getVersesByRarity = (rarity: "common" | "uncommon" | "rare" | "obscure") => {
  return allBiblicalFinancialVerses.filter(verse => verse.rarity === rarity);
};

export const getObscureFinancialVerses = () => {
  return getVersesByRarity("obscure");
};

export const getAllFinancialCategories = () => {
  const categories = new Set(allBiblicalFinancialVerses.map(verse => verse.category));
  return Array.from(categories);
};

export const searchVerses = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return allBiblicalFinancialVerses.filter(verse => 
    verse.text.toLowerCase().includes(lowerQuery) ||
    verse.reference.toLowerCase().includes(lowerQuery) ||
    verse.principle?.toLowerCase().includes(lowerQuery) ||
    verse.application?.toLowerCase().includes(lowerQuery)
  );
};

// Get wisdom score based on comprehensive biblical principles
export const calculateComprehensiveWisdomScore = (userActions: {
  tithes: boolean;
  avoidsDebt: boolean;
  diversifies: boolean;
  helpsNeedy: boolean;
  worksHard: boolean;
  plansAhead: boolean;
  avoidsBribes: boolean;
  usesHonestWeights: boolean;
  seeksWisdom: boolean;
  contentWithEnough: boolean;
  honorsByFirstfruits: boolean;
  investsEthically: boolean;
}): number => {
  let score = 0;
  const maxScore = 120; // 12 categories × 10 points each
  
  if (userActions.tithes) score += 10;
  if (userActions.avoidsDebt) score += 10;
  if (userActions.diversifies) score += 10;
  if (userActions.helpsNeedy) score += 10;
  if (userActions.worksHard) score += 10;
  if (userActions.plansAhead) score += 10;
  if (userActions.avoidsBribes) score += 10;
  if (userActions.usesHonestWeights) score += 10;
  if (userActions.seeksWisdom) score += 10;
  if (userActions.contentWithEnough) score += 10;
  if (userActions.honorsByFirstfruits) score += 10;
  if (userActions.investsEthically) score += 10;
  
  return Math.round((score / maxScore) * 100);
};
