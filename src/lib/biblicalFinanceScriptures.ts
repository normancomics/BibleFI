/**
 * Biblical Finance Scripture Engine
 * Complete mapping of ALL financial scriptures from KJV to DeFi principles
 * Used by smart contracts, UI, and the Biblical Wisdom filter
 * 
 * Sources: KJV, Original Hebrew (Tanakh), Greek (NT), Aramaic (Daniel/Ezra)
 */

// ============ TITHING & FIRST FRUITS ============

export const TITHING_SCRIPTURES = [
  {
    reference: 'Genesis 14:18-20',
    kjv: 'And Melchizedek king of Salem brought forth bread and wine: and he was the priest of the most high God. And he blessed him, and said, Blessed be Abram of the most high God, possessor of heaven and earth: And blessed be the most high God, which hath delivered thine enemies into thy hand. And he gave him tithes of all.',
    hebrew: 'וּמַלְכִּי־צֶדֶק מֶלֶךְ שָׁלֵם הוֹצִיא לֶחֶם וָיָיִן וְהוּא כֹהֵן לְאֵל עֶלְיוֹן',
    strongNumbers: ['H4442', 'H4428', 'H8004', 'H3318', 'H3899', 'H3196'],
    category: 'tithing',
    principle: 'First mention of tithing - voluntary act of gratitude to God through His priest',
    defiMapping: 'Auto-tithe stream via Superfluid: 10% of yield automatically streamed to church',
    contractFunction: 'BWSPCore.startTithingStream()',
    financialKeywords: ['tithe', 'tithes', 'ma\'aser', 'מעשר']
  },
  {
    reference: 'Malachi 3:10',
    kjv: 'Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the LORD of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.',
    hebrew: 'הָבִיאוּ אֶת־כָּל־הַמַּעֲשֵׂר אֶל־בֵּית הָאוֹצָר',
    strongNumbers: ['H935', 'H3605', 'H4643', 'H1004', 'H214'],
    category: 'tithing',
    principle: 'God challenges His people to test Him through faithful tithing - promises abundance',
    defiMapping: 'Tithe bonus multiplier: 1.5x-2.0x APY boost for consistent tithers',
    contractFunction: 'BWTYACore.TITHE_BONUS_STANDARD/GENEROUS/ABUNDANT',
    financialKeywords: ['tithes', 'storehouse', 'blessing', 'ma\'aser', 'otzar']
  },
  {
    reference: 'Leviticus 27:30',
    kjv: 'And all the tithe of the land, whether of the seed of the land, or of the fruit of the tree, is the LORD\'s: it is holy unto the LORD.',
    hebrew: 'וְכָל־מַעְשַׂר הָאָרֶץ מִזֶּרַע הָאָרֶץ מִפְּרִי הָעֵץ לַיהוָה הוּא קֹדֶשׁ',
    strongNumbers: ['H4643', 'H776', 'H2233', 'H6529', 'H6086', 'H3068', 'H6944'],
    category: 'tithing',
    principle: 'The tithe belongs to God - it is holy (set apart)',
    defiMapping: '10% automatic allocation is non-negotiable in the protocol',
    contractFunction: 'BWSPCore.TITHE_RATE_STANDARD = 1000 (10%)',
    financialKeywords: ['tithe', 'holy', 'seed', 'fruit', 'land']
  },
  {
    reference: 'Proverbs 3:9-10',
    kjv: 'Honour the LORD with thy substance, and with the firstfruits of all thine increase: So shall thy barns be filled with plenty, and thy presses shall burst out with new wine.',
    hebrew: 'כַּבֵּד אֶת־יְהוָה מֵהוֹנֶךָ וּמֵרֵאשִׁית כָּל־תְּבוּאָתֶךָ',
    strongNumbers: ['H3513', 'H3068', 'H1952', 'H7225', 'H3605', 'H8393'],
    category: 'first_fruits',
    principle: 'Honor God first with your wealth and firstfruits - abundance follows',
    defiMapping: 'First Fruits Protocol: Yield earned is tithed BEFORE distribution to user',
    contractFunction: 'BWTYACore._claimRewards() - tithe deducted before transfer',
    financialKeywords: ['substance', 'firstfruits', 'increase', 'hon', 'reshit', 'tevuah']
  },
];

// ============ BORROWING, LENDING & USURY ============

export const BORROWING_LENDING_SCRIPTURES = [
  {
    reference: 'Proverbs 22:7',
    kjv: 'The rich ruleth over the poor, and the borrower is servant to the lender.',
    hebrew: 'עָשִׁיר בְּדַלִּים יִמְשׁוֹל וְעֶבֶד לֹוֶה לְאִישׁ מַלְוֶה',
    strongNumbers: ['H6223', 'H1800', 'H4910', 'H5650', 'H3867', 'H376', 'H3867'],
    category: 'borrowing',
    principle: 'WARNING: Borrowing creates servitude. Be the lender, not the borrower.',
    defiMapping: 'Leverage trading guardrail: Max 2x leverage, wisdom score > 750 required',
    contractFunction: 'BWTYACore: leverageLimit based on wisdomScore',
    financialKeywords: ['rich', 'poor', 'borrower', 'servant', 'lender', 'lavah', 'malveh']
  },
  {
    reference: 'Deuteronomy 28:12',
    kjv: 'The LORD shall open unto thee his good treasure, the heaven to give the rain unto thy land in his season, and to bless all the work of thine hand: and thou shalt lend unto many nations, and thou shalt not borrow.',
    hebrew: 'וְהִלְוִיתָ גּוֹיִם רַבִּים וְאַתָּה לֹא תִלְוֶה',
    strongNumbers: ['H3068', 'H6605', 'H2896', 'H214', 'H8064', 'H3867', 'H1471'],
    category: 'lending',
    principle: 'God\'s blessing: Be a lender to nations. Financial sovereignty through obedience.',
    defiMapping: 'Lending pool participation rewards wisdom score. Providing liquidity = lending.',
    contractFunction: 'BWTYACore: LP providers earn generosityScore bonus',
    financialKeywords: ['lend', 'nations', 'borrow', 'treasure', 'bless', 'halvah']
  },
  {
    reference: 'Romans 13:8',
    kjv: 'Owe no man any thing, but to love one another: for he that loveth another hath fulfilled the law.',
    greek: 'Μηδενὶ μηδὲν ὀφείλετε εἰ μὴ τὸ ἀλλήλους ἀγαπᾶν',
    strongNumbers: ['G3367', 'G3762', 'G3784', 'G1508', 'G240', 'G25'],
    category: 'borrowing',
    principle: 'Avoid debt obligations. The only "debt" should be love.',
    defiMapping: 'Borrowing protocol: Flash loans OK (instant repay), long-term debt discouraged',
    contractFunction: 'Flash loan strategies prioritized over long-term borrowing',
    financialKeywords: ['owe', 'debt', 'love', 'opheilete']
  },
  {
    reference: 'Exodus 22:25',
    kjv: 'If thou lend money to any of my people that is poor by thee, thou shalt not be to him as an usurer, neither shalt thou lay upon him usury.',
    hebrew: 'אִם־כֶּסֶף תַּלְוֶה אֶת־עַמִּי אֶת־הֶעָנִי עִמָּךְ לֹא־תִהְיֶה לוֹ כְּנֹשֶׁה לֹא־תְשִׂימוּן עָלָיו נֶשֶׁךְ',
    strongNumbers: ['H3701', 'H3867', 'H5971', 'H6041', 'H5383', 'H5392'],
    category: 'usury',
    principle: 'No predatory lending. Interest-free loans to the poor. Fair DeFi rates.',
    defiMapping: 'Lending pool for Widow pool: 0% interest micro-loans for verified need',
    contractFunction: 'BWTYACore.POOL_WIDOW: Charitable micro-lending at 0% interest',
    financialKeywords: ['lend', 'money', 'poor', 'usurer', 'usury', 'kesef', 'neshekh']
  },
  {
    reference: 'Deuteronomy 23:19-20',
    kjv: 'Thou shalt not lend upon usury to thy brother; usury of money, usury of victuals, usury of any thing that is lent upon usury: Unto a stranger thou mayest lend upon usury; but unto thy brother thou shalt not lend upon usury.',
    hebrew: 'לֹא־תַשִּׁיךְ לְאָחִיךָ נֶשֶׁךְ כֶּסֶף נֶשֶׁךְ אֹכֶל נֶשֶׁךְ כָּל־דָּבָר אֲשֶׁר יִשָּׁךְ',
    strongNumbers: ['H5391', 'H251', 'H5392', 'H3701', 'H400'],
    category: 'usury',
    principle: 'No usury among brothers. Fair interest for external commercial lending.',
    defiMapping: 'Community lending: Reduced rates for verified BibleFi community members',
    contractFunction: 'Community factor multiplier for intra-community lending',
    financialKeywords: ['usury', 'brother', 'money', 'victuals', 'neshekh', 'ach']
  },
];

// ============ SAVING, INVESTING & STEWARDSHIP ============

export const SAVING_INVESTING_SCRIPTURES = [
  {
    reference: 'Proverbs 21:20',
    kjv: 'There is treasure to be desired and oil in the dwelling of the wise; but a foolish man spendeth it up.',
    hebrew: 'אוֹצָר נֶחְמָד וָשֶׁמֶן בִּנְוֵה חָכָם וּכְסִיל אָדָם יְבַלְּעֶנּוּ',
    strongNumbers: ['H214', 'H2530', 'H8081', 'H5116', 'H2450', 'H3684'],
    category: 'saving',
    principle: 'The wise save and store up. The foolish consume everything immediately.',
    defiMapping: 'Joseph pool: 7-year savings strategy with emergency reserves',
    contractFunction: 'BWTYACore.POOL_JOSEPH: Emergency fund with stable yields',
    financialKeywords: ['treasure', 'oil', 'wise', 'foolish', 'otzar', 'chakam']
  },
  {
    reference: 'Proverbs 13:11',
    kjv: 'Wealth gotten by vanity shall be diminished: but he that gathereth by labour shall increase.',
    hebrew: 'הוֹן מֵהֶבֶל יִמְעָט וְקֹבֵץ עַל־יָד יַרְבֶּה',
    strongNumbers: ['H1952', 'H1892', 'H4591', 'H6908', 'H3027', 'H7235'],
    category: 'investing',
    principle: 'Get-rich-quick fails. Steady accumulation (DCA) grows wealth.',
    defiMapping: 'Dollar-Cost Averaging enforced: Max single investment capped by wisdom score',
    contractFunction: 'BWTYACore: minInvestment prevents reckless all-in bets',
    financialKeywords: ['wealth', 'vanity', 'gathereth', 'labour', 'increase', 'hon']
  },
  {
    reference: 'Ecclesiastes 11:1-2',
    kjv: 'Cast thy bread upon the waters: for thou shalt find it after many days. Give a portion to seven, and also to eight; for thou knowest not what evil shall be upon the earth.',
    hebrew: 'שַׁלַּח לַחְמְךָ עַל־פְּנֵי הַמָּיִם כִּי־בְרֹב הַיָּמִים תִּמְצָאֶנּוּ. תֶּן־חֵלֶק לְשִׁבְעָה וְגַם לִשְׁמוֹנָה',
    strongNumbers: ['H7971', 'H3899', 'H4325', 'H7227', 'H3117', 'H2506', 'H7651', 'H8083'],
    category: 'diversification',
    principle: 'DIVERSIFY investments across 7-8 categories. Do not put all in one basket.',
    defiMapping: 'Diversification score: Bonus APY for spreading across 4 pools (up to 1.2x)',
    contractFunction: 'BWTYACore._updateDiversificationScore(): 125 points per pool',
    financialKeywords: ['bread', 'waters', 'portion', 'seven', 'eight', 'chelek']
  },
  {
    reference: 'Matthew 25:14-30',
    kjv: 'For the kingdom of heaven is as a man travelling into a far country, who called his own servants, and delivered unto them his goods. And unto one he gave five talents, to another two, and to another one; to every man according to his several ability...',
    greek: 'ᾧ μὲν ἔδωκεν πέντε τάλαντα, ᾧ δὲ δύο, ᾧ δὲ ἕν, ἑκάστῳ κατὰ τὴν ἰδίαν δύναμιν',
    strongNumbers: ['G5007', 'G4002', 'G1417', 'G1520', 'G2398', 'G1411'],
    category: 'stewardship',
    principle: 'Multiply what God gives you. Burying talents (not investing) is condemned.',
    defiMapping: 'Talents Pool: Aggressive growth strategy. Progressive multipliers for active stewards.',
    contractFunction: 'BWTYACore.POOL_TALENTS: Highest APY, highest risk, highest wisdom requirement',
    financialKeywords: ['talents', 'servants', 'goods', 'ability', 'talanton', 'dynamis']
  },
  {
    reference: 'Luke 14:28',
    kjv: 'For which of you, intending to build a tower, sitteth not down first, and counteth the cost, whether he have sufficient to finish it?',
    greek: 'τίς γὰρ ἐξ ὑμῶν θέλων πύργον οἰκοδομῆσαι οὐχὶ πρῶτον καθίσας ψηφίζει τὴν δαπάνην',
    strongNumbers: ['G4444', 'G3618', 'G4412', 'G2523', 'G5585', 'G1160'],
    category: 'planning',
    principle: 'Count the cost before investing. Financial planning is godly.',
    defiMapping: 'Investment reasoning required: Users must provide Biblical justification',
    contractFunction: 'BWTYACore.invest(): requires reasoning string (min 20 chars)',
    financialKeywords: ['build', 'cost', 'sufficient', 'finish', 'psephizei', 'dapane']
  },
];

// ============ SABBATH REST & JUBILEE ============

export const SABBATH_JUBILEE_SCRIPTURES = [
  {
    reference: 'Exodus 20:8-10',
    kjv: 'Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the LORD thy God.',
    hebrew: 'זָכוֹר אֶת־יוֹם הַשַּׁבָּת לְקַדְּשׁוֹ שֵׁשֶׁת יָמִים תַּעֲבֹד',
    strongNumbers: ['H2142', 'H3117', 'H7676', 'H6942', 'H8337', 'H5647'],
    category: 'sabbath',
    principle: 'Rest on the 7th day. Cycles of work and rest produce sustained growth.',
    defiMapping: 'Sabbath Rest Bonus: 7-day HODL cycles earn bonus yield (Sabbath multiplier)',
    contractFunction: 'BWTYACore: 7-day staking cycle bonus (proposed)',
    financialKeywords: ['sabbath', 'rest', 'labour', 'work', 'shabbat', 'avad']
  },
  {
    reference: 'Leviticus 25:10-13',
    kjv: 'And ye shall hallow the fiftieth year, and proclaim liberty throughout all the land unto all the inhabitants thereof: it shall be a jubile unto you; and ye shall return every man unto his possession, and ye shall return every man unto his family.',
    hebrew: 'וְקִדַּשְׁתֶּם אֵת שְׁנַת הַחֲמִשִּׁים שָׁנָה וּקְרָאתֶם דְּרוֹר בָּאָרֶץ',
    strongNumbers: ['H6942', 'H8141', 'H2572', 'H7121', 'H1865', 'H776'],
    category: 'jubilee',
    principle: 'Every 50th year: Debts forgiven, property restored, slaves freed. Economic reset.',
    defiMapping: 'Jubilee Events: Periodic redistribution from treasury to community pools',
    contractFunction: 'BWTYACore: Jubilee redistribution event (proposed every 50 epochs)',
    financialKeywords: ['jubile', 'liberty', 'possession', 'family', 'yovel', 'deror']
  },
  {
    reference: 'Deuteronomy 15:1-2',
    kjv: 'At the end of every seven years thou shalt make a release. And this is the manner of the release: Every creditor that lendeth ought unto his neighbour shall release it; he shall not exact it of his neighbour, or of his brother; because it is called the LORD\'s release.',
    hebrew: 'מִקֵּץ שֶׁבַע־שָׁנִים תַּעֲשֶׂה שְׁמִטָּה',
    strongNumbers: ['H7093', 'H7651', 'H8141', 'H6213', 'H8059'],
    category: 'debt_release',
    principle: 'Every 7 years: Cancel debts. The Shemitah (sabbatical year for debt).',
    defiMapping: 'Debt forgiveness pool: Community-funded micro-loan forgiveness cycles',
    contractFunction: 'BWTYACore: Shemitah event every 7 epochs - partial debt cancellation',
    financialKeywords: ['release', 'creditor', 'neighbour', 'brother', 'shemitah']
  },
];

// ============ SOWING & REAPING ============

export const SOWING_REAPING_SCRIPTURES = [
  {
    reference: 'Galatians 6:7-9',
    kjv: 'Be not deceived; God is not mocked: for whatsoever a man soweth, that shall he also reap. For he that soweth to his flesh shall of the flesh reap corruption; but he that soweth to the Spirit shall of the Spirit reap life everlasting. And let us not be weary in well doing: for in due season we shall reap, if we faint not.',
    greek: 'ὃ γὰρ ἐὰν σπείρῃ ἄνθρωπος, τοῦτο καὶ θερίσει',
    strongNumbers: ['G4687', 'G444', 'G2325', 'G4561', 'G5356', 'G4151', 'G2222'],
    category: 'sowing_reaping',
    principle: 'Returns are proportional to what you invest + TIME. Patient investing wins.',
    defiMapping: 'Yield = principal × APY × time. Longer stakes earn more. No shortcuts.',
    contractFunction: 'BWTYACore._calculatePendingRewards(): time-weighted yield calculation',
    financialKeywords: ['soweth', 'reap', 'season', 'faint', 'speiro', 'therizo']
  },
  {
    reference: '2 Corinthians 9:6',
    kjv: 'But this I say, He which soweth sparingly shall reap also sparingly; and he which soweth bountifully shall reap also bountifully.',
    greek: 'ὁ σπείρων φειδομένως φειδομένως καὶ θερίσει, καὶ ὁ σπείρων ἐπ\' εὐλογίαις ἐπ\' εὐλογίαις καὶ θερίσει',
    strongNumbers: ['G4687', 'G5340', 'G2325', 'G2129'],
    category: 'generosity',
    principle: 'Generous giving → generous returns. Stinginess limits blessing.',
    defiMapping: 'Generous tithe tiers (15%, 20%) earn exponentially higher yield multipliers',
    contractFunction: 'BWSPCore.BONUS_GENEROUS=1.7x, BONUS_ABUNDANT=2.0x',
    financialKeywords: ['soweth', 'sparingly', 'bountifully', 'reap', 'eulogiais']
  },
];

// ============ WARNINGS AGAINST GREED & FOOLISHNESS ============

export const WARNING_SCRIPTURES = [
  {
    reference: '1 Timothy 6:10',
    kjv: 'For the love of money is the root of all evil: which while some coveted after, they have erred from the faith, and pierced themselves through with many sorrows.',
    greek: 'ῥίζα γὰρ πάντων τῶν κακῶν ἐστιν ἡ φιλαργυρία',
    strongNumbers: ['G4491', 'G3956', 'G2556', 'G5365'],
    category: 'warning',
    principle: 'LOVE of money (not money itself) is evil. Use wealth for God\'s purposes.',
    defiMapping: 'Greed detection: Excessive trading frequency triggers wisdom score penalty',
    contractFunction: 'Rate limiting on withdrawals + wisdom score deduction for panic selling',
    financialKeywords: ['love', 'money', 'evil', 'coveted', 'faith', 'philargyria']
  },
  {
    reference: 'Proverbs 28:20',
    kjv: 'A faithful man shall abound with blessings: but he that maketh haste to be rich shall not be innocent.',
    hebrew: 'אִישׁ אֱמוּנוֹת רַב־בְּרָכוֹת וְאָץ לְהַעֲשִׁיר לֹא יִנָּקֶה',
    strongNumbers: ['H376', 'H530', 'H7227', 'H1293', 'H213', 'H6238', 'H5352'],
    category: 'warning',
    principle: 'Faithfulness over time = blessings. Get-rich-quick = trouble.',
    defiMapping: 'No degen aping: High-risk pools require high wisdom score + reasoning',
    contractFunction: 'BWTYACore: Pool entry requirements (minWisdomScore, reasoning)',
    financialKeywords: ['faithful', 'blessings', 'haste', 'rich', 'innocent', 'emunot']
  },
  {
    reference: 'Proverbs 11:1',
    kjv: 'A false balance is abomination to the LORD: but a just weight is his delight.',
    hebrew: 'מֹאזְנֵי מִרְמָה תּוֹעֲבַת יְהוָה וְאֶבֶן שְׁלֵמָה רְצוֹנוֹ',
    strongNumbers: ['H3976', 'H4820', 'H8441', 'H3068', 'H68', 'H8003', 'H7522'],
    category: 'justice',
    principle: 'Honest weights and measures. No market manipulation or fraudulent pricing.',
    defiMapping: 'TWAP oracles required: No flash-loan price manipulation allowed',
    contractFunction: 'Use Chainlink/TWAP for price feeds, not spot prices',
    financialKeywords: ['balance', 'abomination', 'just', 'weight', 'moznei', 'mirmah']
  },
];

// ============ COMPLETE SCRIPTURE INDEX ============

export const ALL_FINANCIAL_SCRIPTURES = [
  ...TITHING_SCRIPTURES,
  ...BORROWING_LENDING_SCRIPTURES,
  ...SAVING_INVESTING_SCRIPTURES,
  ...SABBATH_JUBILEE_SCRIPTURES,
  ...SOWING_REAPING_SCRIPTURES,
  ...WARNING_SCRIPTURES,
];

// Scripture lookup by reference
export const getScriptureByReference = (ref: string) =>
  ALL_FINANCIAL_SCRIPTURES.find(s => s.reference === ref);

// Scriptures by category
export const getScripturesByCategory = (category: string) =>
  ALL_FINANCIAL_SCRIPTURES.filter(s => s.category === category);

// Scriptures relevant to a specific contract function
export const getScripturesForContract = (contractFunction: string) =>
  ALL_FINANCIAL_SCRIPTURES.filter(s => 
    s.contractFunction.toLowerCase().includes(contractFunction.toLowerCase())
  );

// Get random wisdom for a DeFi action
export const getWisdomForAction = (action: 'invest' | 'withdraw' | 'tithe' | 'lend' | 'borrow' | 'stake') => {
  const actionMap: Record<string, string[]> = {
    invest: ['stewardship', 'investing', 'planning', 'diversification'],
    withdraw: ['saving', 'warning'],
    tithe: ['tithing', 'first_fruits', 'generosity'],
    lend: ['lending'],
    borrow: ['borrowing', 'usury'],
    stake: ['sowing_reaping', 'sabbath'],
  };
  const categories = actionMap[action] || ['stewardship'];
  const relevant = ALL_FINANCIAL_SCRIPTURES.filter(s => categories.includes(s.category));
  return relevant[Math.floor(Math.random() * relevant.length)];
};

// Wisdom filter: Check if an action aligns with Biblical principles
export const biblicalWisdomFilter = (action: {
  type: 'invest' | 'withdraw' | 'borrow' | 'leverage' | 'tithe';
  amount: number;
  leverageMultiplier?: number;
  reasoning?: string;
  wisdomScore?: number;
}): { approved: boolean; scripture: string; warning?: string } => {
  // Leverage check (Proverbs 22:7)
  if (action.type === 'leverage' && (action.leverageMultiplier || 1) > 2) {
    return {
      approved: false,
      scripture: 'Proverbs 22:7 - "The borrower is servant to the lender."',
      warning: 'Leverage above 2x creates excessive debt servitude. Reduce leverage.'
    };
  }

  // Borrowing check (Romans 13:8)
  if (action.type === 'borrow' && !action.reasoning) {
    return {
      approved: false,
      scripture: 'Romans 13:8 - "Owe no man any thing, but to love one another."',
      warning: 'Borrowing requires Biblical justification. Why do you need this loan?'
    };
  }

  // Wisdom score check for investments (Luke 14:28)
  if (action.type === 'invest' && (action.wisdomScore || 0) < 250) {
    return {
      approved: true,
      scripture: 'Luke 14:28 - "Count the cost, whether he have sufficient to finish it."',
      warning: 'Your wisdom score is low. Consider starting with the Widow pool (lowest risk).'
    };
  }

  // All tithes approved (Malachi 3:10)
  if (action.type === 'tithe') {
    return {
      approved: true,
      scripture: 'Malachi 3:10 - "Bring ye all the tithes into the storehouse... I will open you the windows of heaven."'
    };
  }

  return {
    approved: true,
    scripture: getWisdomForAction(action.type === 'leverage' ? 'borrow' : action.type)?.kjv?.slice(0, 100) + '...' || 'Walk in wisdom.'
  };
};
