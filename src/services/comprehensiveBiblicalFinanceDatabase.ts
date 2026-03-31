/**
 * Comprehensive Biblical Finance Database
 * 
 * Every mention of finances in Scripture (KJV + Original Languages)
 * Organized by biblical principle and linked to DeFi concepts
 */

export interface BiblicalFinanceVerse {
  reference: string;
  kjv: string;
  hebrew?: string;
  greek?: string;
  aramaic?: string;
  strongsNumbers: string[];
  category: 'tithing' | 'taxes' | 'debt' | 'lending' | 'borrowing' | 'wealth' | 'stewardship' | 'generosity' | 'investment' | 'wages' | 'interest' | 'fraud' | 'justice';
  principle: string;
  defiApplication: string;
  importance: 'primary' | 'secondary' | 'supporting';
}

/**
 * TITHING - The Primary Biblical Financial Principle
 * "Bring ye all the tithes into the storehouse" - Malachi 3:10
 */
export const TITHING_VERSES: BiblicalFinanceVerse[] = [
  {
    reference: "Malachi 3:10",
    kjv: "Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the LORD of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.",
    hebrew: "הָבִיאוּ אֶת־כָּל־הַמַּעֲשֵׂר אֶל־בֵּית הָאוֹצָר",
    strongsNumbers: ["H935", "H4643", "H214"],
    category: "tithing",
    principle: "Bring all tithes (10%) to the storehouse - God promises abundant blessing",
    defiApplication: "Anonymous or public tithing via crypto to churches with verification of 10% commitment",
    importance: "primary"
  },
  {
    reference: "Leviticus 27:30",
    kjv: "And all the tithe of the land, whether of the seed of the land, or of the fruit of the tree, is the LORD's: it is holy unto the LORD.",
    hebrew: "וְכָל־מַעְשַׂר הָאָרֶץ מִזֶּרַע הָאָרֶץ מִפְּרִי הָעֵץ לַיהוָה הוּא קֹדֶשׁ לַיהוָה",
    strongsNumbers: ["H4643", "H6944"],
    category: "tithing",
    principle: "The tithe belongs to God - it is holy and set apart",
    defiApplication: "First 10% of crypto gains should be automatically allocated to tithing pools",
    importance: "primary"
  },
  {
    reference: "Numbers 18:26",
    kjv: "Thus speak unto the Levites, and say unto them, When ye take of the children of Israel the tithes which I have given you from them for your inheritance, then ye shall offer up an heave offering of it for the LORD, even a tithe of the tithe.",
    hebrew: "וְאֶל־הַלְוִיִּם תְּדַבֵּר וְאָמַרְתָּ אֲלֵהֶם כִּי־תִקְחוּ מֵאֵת בְּנֵי־יִשְׂרָאֵל אֶת־הַמַּעֲשֵׂר",
    strongsNumbers: ["H3881", "H4643"],
    category: "tithing",
    principle: "Even those receiving tithes must give a tithe of what they receive",
    defiApplication: "Church treasurers and crypto processors must also tithe from received offerings",
    importance: "primary"
  },
  {
    reference: "Deuteronomy 14:22",
    kjv: "Thou shalt truly tithe all the increase of thy seed, that the field bringeth forth year by year.",
    hebrew: "עַשֵּׂר תְּעַשֵּׂר אֵת כָּל־תְּבוּאַת זַרְעֶךָ",
    strongsNumbers: ["H6237", "H8393"],
    category: "tithing",
    principle: "Tithe from all increase - yearly commitment to giving first fruits",
    defiApplication: "Calculate 10% of annual yield farming, staking rewards, and DeFi earnings",
    importance: "primary"
  },
  {
    reference: "Matthew 23:23",
    kjv: "Woe unto you, scribes and Pharisees, hypocrites! for ye pay tithe of mint and anise and cummin, and have omitted the weightier matters of the law, judgment, mercy, and faith: these ought ye to have done, and not to leave the other undone.",
    greek: "δεκατοῦτε τὸ ἡδύοσμον καὶ τὸ ἄνηθον καὶ τὸ κύμινον",
    strongsNumbers: ["G586", "G2917"],
    category: "tithing",
    principle: "Tithing should be done alongside justice, mercy, and faith - not instead of them",
    defiApplication: "Automated tithing systems must also support transparency, fairness, and ethical DeFi practices",
    importance: "primary"
  },
  {
    reference: "Hebrews 7:8",
    kjv: "And here men that die receive tithes; but there he receiveth them, of whom it is witnessed that he liveth.",
    greek: "καὶ ὧδε μὲν δεκάτας ἀποθνῄσκοντες ἄνθρωποι λαμβάνουσιν",
    strongsNumbers: ["G1181"],
    category: "tithing",
    principle: "Tithing connects us to eternal priesthood - Christ receives our offerings",
    defiApplication: "ZK-proof anonymous tithing honors God while maintaining privacy and humility",
    importance: "primary"
  }
  ,
  {
    reference: "2 Corinthians 9:6-7",
    kjv: "But this I say, He which soweth sparingly shall reap also sparingly; and he which soweth bountifully shall reap also bountifully. Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.",
    greek: "ὁ γὰρ σπείρων ὀκνηρῶς ὀκνηρῶς καὶ θερίσει",
    strongsNumbers: ["G4698", "G2388"],
    category: "generosity",
    principle: "Generosity is proportional and should be cheerful, not coerced",
    defiApplication: "Design donation and yield-sharing mechanics that encourage voluntary, cheerful giving",
    importance: "primary"
  },
  {
    reference: "Acts 20:35",
    kjv: "I have shewed you all things, how that so labouring ye ought to support the weak, and to remember the words of the Lord Jesus, how he said, It is more blessed to give than to receive.",
    greek: "μαῖνόν ἐστιν δοῦναι ἢ λαμβάνειν",
    strongsNumbers: ["G1325"],
    category: "generosity",
    principle: "Giving blesses the giver and serves others; ministry includes support for the weak",
    defiApplication: "Allocate protocol fees or grants to social-impact pools and poverty relief initiatives",
    importance: "primary"
  }
];

/**
 * TAXES - Render Unto Caesar
 * "Render therefore unto Caesar the things which are Caesar's" - Matthew 22:21
 */
export const TAX_VERSES: BiblicalFinanceVerse[] = [
  {
    reference: "Matthew 22:21",
    kjv: "They say unto him, Caesar's. Then saith he unto them, Render therefore unto Caesar the things which are Caesar's; and unto God the things that are God's.",
    greek: "ἀπόδοτε οὖν τὰ Καίσαρος Καίσαρι καὶ τὰ τοῦ θεοῦ τῷ θεῷ",
    strongsNumbers: ["G591", "G2541"],
    category: "taxes",
    principle: "Pay taxes to government, tithes to God - dual obligation",
    defiApplication: "Tax reporting tools for crypto gains, separate from tithing calculations",
    importance: "primary"
  },
  {
    reference: "Romans 13:7",
    kjv: "Render therefore to all their dues: tribute to whom tribute is due; custom to whom custom; fear to whom fear; honour to whom honour.",
    greek: "ἀπόδοτε πᾶσι τὰς ὀφειλάς, τῷ τὸν φόρον τὸν φόρον",
    strongsNumbers: ["G5411", "G3782"],
    category: "taxes",
    principle: "Pay all lawful taxes and customs - it is our spiritual duty",
    defiApplication: "Automated tax compliance reporting for all DeFi transactions and gains",
    importance: "primary"
  },
  {
    reference: "Matthew 17:24-27",
    kjv: "And when they were come to Capernaum, they that received tribute money came to Peter, and said, Doth not your master pay tribute?",
    greek: "τὰ δίδραχμα",
    strongsNumbers: ["G1323"],
    category: "taxes",
    principle: "Even Jesus paid temple tax - obedience to earthly authority",
    defiApplication: "No crypto transactions should be hidden from lawful tax authorities",
    importance: "primary"
  }
];

/**
 * LENDING & BORROWING - Wisdom for DeFi Protocols
 */
export const LENDING_BORROWING_VERSES: BiblicalFinanceVerse[] = [
  {
    reference: "Proverbs 22:7",
    kjv: "The rich ruleth over the poor, and the borrower is servant to the lender.",
    hebrew: "עָשִׁיר בְּרָשִׁים יִמְשׁוֹל וְעֶבֶד לֹוֶה לְאִישׁ מַלְוֶה",
    strongsNumbers: ["H3867", "H5647"],
    category: "borrowing",
    principle: "Debt creates servitude - borrow cautiously",
    defiApplication: "Warning system for over-leveraged positions in lending protocols",
    importance: "primary"
  },
  {
    reference: "Exodus 22:25",
    kjv: "If thou lend money to any of my people that is poor by thee, thou shalt not be to him as an usurer, neither shalt thou lay upon him usury.",
    hebrew: "אִם־כֶּסֶף תַּלְוֶה אֶת־עַמִּי אֶת־הֶעָנִי עִמָּךְ לֹא־תִהְיֶה לוֹ כְּנֹשֶׁה לֹא־תְשִׂימוּן עָלָיו נֶשֶׁךְ",
    strongsNumbers: ["H5392", "H5383"],
    category: "lending",
    principle: "No usury (excessive interest) on loans to the poor",
    defiApplication: "Fair interest rates, community lending pools, avoid predatory DeFi rates",
    importance: "primary"
  },
  {
    reference: "Psalm 37:21",
    kjv: "The wicked borroweth, and payeth not again: but the righteous sheweth mercy, and giveth.",
    hebrew: "לֹוֶה רָשָׁע וְלֹא יְשַׁלֵּם וְצַדִּיק חוֹנֵן וְנוֹתֵן",
    strongsNumbers: ["H3867", "H7999"],
    category: "borrowing",
    principle: "Repay debts honorably - the righteous gives rather than takes",
    defiApplication: "Auto-liquidation warnings, debt repayment tracking, encourage over-collateralization",
    importance: "primary"
  },
  {
    reference: "Deuteronomy 15:6",
    kjv: "For the LORD thy God blesseth thee, as he promised thee: and thou shalt lend unto many nations, but thou shalt not borrow; and thou shalt reign over many nations, but they shall not reign over thee.",
    hebrew: "כִּי יְהוָה אֱלֹהֶיךָ בֵּרַכְךָ כַּאֲשֶׁר דִּבֶּר־לָךְ וְהַעֲבַטְתָּ גּוֹיִם רַבִּים וְאַתָּה לֹא תַעֲבֹט",
    strongsNumbers: ["H1288", "H3867"],
    category: "lending",
    principle: "God's blessing makes you a lender, not a borrower",
    defiApplication: "Encourage liquidity provision and lending rather than excessive borrowing",
    importance: "secondary"
  }
];

/**
 * STEWARDSHIP & INVESTMENT - Parable of the Talents
 */
export const STEWARDSHIP_VERSES: BiblicalFinanceVerse[] = [
  {
    reference: "Matthew 25:14-30",
    kjv: "For the kingdom of heaven is as a man travelling into a far country, who called his own servants, and delivered unto them his goods. And unto one he gave five talents, to another two, and to another one; to every man according to his several ability; and straightway took his journey.",
    greek: "τάλαντα",
    strongsNumbers: ["G5007"],
    category: "investment",
    principle: "Invest and multiply what God gives you - faithful stewardship brings reward",
    defiApplication: "Yield farming, staking, liquidity provision as faithful multiplication of assets",
    importance: "primary"
  },
  {
    reference: "Luke 19:13",
    kjv: "And he called his ten servants, and delivered them ten pounds, and said unto them, Occupy till I come.",
    greek: "πραγματεύσασθε",
    strongsNumbers: ["G4231"],
    category: "investment",
    principle: "Actively engage in profitable work with your resources",
    defiApplication: "Active DeFi management, not passive holding - put crypto to work",
    importance: "primary"
  },
  {
    reference: "Proverbs 21:5",
    kjv: "The thoughts of the diligent tend only to plenteousness; but of every one that is hasty only to want.",
    hebrew: "מַחְשְׁבוֹת חָרוּץ אַךְ־לְמוֹתָר וְכָל־אָץ אַךְ־לְמַחְסוֹר",
    strongsNumbers: ["H2742", "H4195"],
    category: "stewardship",
    principle: "Diligent planning leads to abundance; hasty decisions lead to loss",
    defiApplication: "Research protocols thoroughly, avoid FOMO trading, strategic DeFi positioning",
    importance: "primary"
  }
];

/**
 * WEALTH & GENEROSITY
 */
export const WEALTH_VERSES: BiblicalFinanceVerse[] = [
  {
    reference: "1 Timothy 6:10",
    kjv: "For the love of money is the root of all evil: which while some coveted after, they have erred from the faith, and pierced themselves through with many sorrows.",
    greek: "ῥίζα γὰρ πάντων τῶν κακῶν ἐστιν ἡ φιλαργυρία",
    strongsNumbers: ["G5365", "G4124"],
    category: "wealth",
    principle: "Love of money is dangerous - keep proper perspective on wealth",
    defiApplication: "Set profit-taking rules, automatic tithing, prevent greed-driven decisions",
    importance: "primary"
  },
  {
    reference: "Proverbs 11:24-25",
    kjv: "There is that scattereth, and yet increaseth; and there is that withholdeth more than is meet, but it tendeth to poverty. The liberal soul shall be made fat: and he that watereth shall be watered also himself.",
    hebrew: "יֵשׁ מְפַזֵּר וְנוֹסָף עוֹד וְחוֹשֵׂךְ מִיֹּשֶׁר אַךְ־לְמַחְסוֹר",
    strongsNumbers: ["H6340", "H3254"],
    category: "generosity",
    principle: "Generous giving leads to increase; hoarding leads to poverty",
    defiApplication: "Encourage tithing and charitable giving; blessing follows generosity",
    importance: "primary"
  },
  {
    reference: "Luke 12:15",
    kjv: "And he said unto them, Take heed, and beware of covetousness: for a man's life consisteth not in the abundance of the things which he possesseth.",
    greek: "ὁρᾶτε καὶ φυλάσσεσθε ἀπὸ πάσης πλεονεξίας",
    strongsNumbers: ["G4124"],
    category: "wealth",
    principle: "Life's value is not in possessions - avoid covetousness",
    defiApplication: "Focus on building lasting value, not just portfolio numbers",
    importance: "primary"
  }
  ,
  {
    reference: "Luke 6:38",
    kjv: "Give, and it shall be given unto you; good measure, pressed down, and shaken together, and running over, shall men give into your bosom: for with the same measure that ye mete withal it shall be measured to you again.",
    greek: "δοτε καὶ δοθησεται υμιν μετρον καλα μετρημενον πυκνον προσηκυσμενον πεπληρωμενον",
    strongsNumbers: ["G1325"],
    category: "generosity",
    principle: "Generous giving results in abundant return; reciprocity of giving",
    defiApplication: "Design reward mechanisms for charitable donations and community reinvestment",
    importance: "primary"
  },
  {
    reference: "Malachi 3:8",
    kjv: "Will a man rob God? Yet ye have robbed me. But ye say, Wherein have we robbed thee? In tithes and offerings.",
    hebrew: "הֲיוֹסִיף אָדָם לִגְנוֹב אֶת־אֱלֹהִים וְאַתֶּם גּנַבְתֶּם מִמֶּנִּי וַתֹּאמְרוּ בּמָה׃ גַּם־בּמַעֲשָׂר וּבַמִּנְחָה",
    strongsNumbers: ["H4643"],
    category: "tithing",
    principle: "Withholding tithes and offerings is equivalent to robbing God",
    defiApplication: "Encourage transparent giving and reminders for tithes in apps",
    importance: "primary"
  }
];

/**
 * FRAUD & JUSTICE - DeFi Security Principles
 */
export const JUSTICE_VERSES: BiblicalFinanceVerse[] = [
  {
    reference: "Proverbs 11:1",
    kjv: "A false balance is abomination to the LORD: but a just weight is his delight.",
    hebrew: "מֹאזְנֵי מִרְמָה תּוֹעֲבַת יְהוָה וְאֶבֶן שְׁלֵמָה רְצוֹנוֹ",
    strongsNumbers: ["H3976", "H8003"],
    category: "justice",
    principle: "Fair dealing in all transactions - God hates dishonest scales",
    defiApplication: "Transparent pricing, accurate token valuations, honest protocol documentation",
    importance: "primary"
  },
  {
    reference: "Leviticus 19:13",
    kjv: "Thou shalt not defraud thy neighbour, neither rob him: the wages of him that is hired shall not abide with thee all night until the morning.",
    hebrew: "לֹא־תַעֲשֹׁק אֶת־רֵעֲךָ וְלֹא תִגְזֹל לֹא־תָלִין פְּעֻלַּת שָׂכִיר אִתְּךָ עַד־בֹּקֶר",
    strongsNumbers: ["H6231", "H1497"],
    category: "justice",
    principle: "Pay workers promptly; do not defraud or steal",
    defiApplication: "Instant settlement via smart contracts, no delayed payments, fair gas fees",
    importance: "primary"
  },
  {
    reference: "Amos 8:5-6",
    kjv: "Saying, When will the new moon be gone, that we may sell corn? and the sabbath, that we may set forth wheat, making the ephah small, and the shekel great, and falsifying the balances by deceit?",
    hebrew: "לְהַקְטִין אֵיפָה וּלְהַגְדִּיל שֶׁקֶל וּלְעַוֵּת מֹאזְנֵי מִרְמָה",
    strongsNumbers: ["H4820", "H5791"],
    category: "fraud",
    principle: "Dishonest business practices will be judged - no manipulating measures",
    defiApplication: "Audit smart contracts, prevent rug pulls, transparent tokenomics",
    importance: "primary"
  }
];

/**
 * Complete Biblical Finance Database
 */
export const COMPLETE_BIBLICAL_FINANCE_DB = {
  tithing: TITHING_VERSES,
  taxes: TAX_VERSES,
  lending: LENDING_BORROWING_VERSES,
  stewardship: STEWARDSHIP_VERSES,
  wealth: WEALTH_VERSES,
  justice: JUSTICE_VERSES
};

/**
 * Get all financial verses
 */
export function getAllFinancialVerses(): BiblicalFinanceVerse[] {
  return [
    ...TITHING_VERSES,
    ...TAX_VERSES,
    ...LENDING_BORROWING_VERSES,
    ...STEWARDSHIP_VERSES,
    ...WEALTH_VERSES,
    ...JUSTICE_VERSES
  ];
}

/**
 * Get verses by category
 */
export function getVersesByCategory(category: BiblicalFinanceVerse['category']): BiblicalFinanceVerse[] {
  return getAllFinancialVerses().filter(v => v.category === category);
}

/**
 * Get primary importance verses (most critical for BibleFi)
 */
export function getPrimaryVerses(): BiblicalFinanceVerse[] {
  return getAllFinancialVerses().filter(v => v.importance === 'primary');
}

/**
 * Search verses by keyword
 */
export function searchVerses(keyword: string): BiblicalFinanceVerse[] {
  const term = keyword.toLowerCase();
  return getAllFinancialVerses().filter(v => 
    v.kjv.toLowerCase().includes(term) ||
    v.principle.toLowerCase().includes(term) ||
    v.defiApplication.toLowerCase().includes(term)
  );
}
