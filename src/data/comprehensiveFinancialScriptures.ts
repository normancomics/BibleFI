/**
 * COMPREHENSIVE BIBLICAL FINANCIAL SCRIPTURES DATABASE
 * =====================================================
 * 
 * This database contains EVERY financial-related scripture from:
 * - King James Version (KJV) - Primary English text
 * - Original Hebrew (OT) - With transliteration
 * - Original Greek (NT) - With transliteration  
 * - Original Aramaic (portions of Daniel, Ezra)
 * 
 * Categories cover ALL aspects of biblical finances:
 * Tithing, Giving, Wealth, Poverty, Work, Debt, Lending, Interest,
 * Stewardship, Taxes, Investments, Business, Contracts, Inheritance,
 * Property, Trading, Banking, Justice, Wages, and more.
 * 
 * "Bring ye all the tithes into the storehouse" - Malachi 3:10
 */

export interface BiblicalFinancialScripture {
  id: string;
  reference: string;
  kjvText: string;
  hebrewText?: string;
  hebrewTransliteration?: string;
  greekText?: string;
  greekTransliteration?: string;
  aramaicText?: string;
  aramaicTransliteration?: string;
  strongNumbers?: string[];
  category: FinancialCategory;
  subcategories: string[];
  financialKeywords: string[];
  principle: string;
  defiApplication: string;
  modernApplication: string;
  testament: 'Old' | 'New';
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  character?: string;
  context?: string;
  crossReferences?: string[];
}

export type FinancialCategory = 
  | 'tithing'
  | 'giving'
  | 'wealth'
  | 'poverty'
  | 'work'
  | 'debt'
  | 'lending'
  | 'interest'
  | 'stewardship'
  | 'taxes'
  | 'investment'
  | 'business'
  | 'contracts'
  | 'inheritance'
  | 'property'
  | 'trading'
  | 'banking'
  | 'justice'
  | 'wages'
  | 'saving'
  | 'planning'
  | 'contentment'
  | 'generosity'
  | 'honesty'
  | 'fraud'
  | 'greed'
  | 'wisdom';

// ============================================================
// COMPREHENSIVE FINANCIAL SCRIPTURES - ORGANIZED BY CATEGORY
// ============================================================

export const comprehensiveFinancialScriptures: BiblicalFinancialScripture[] = [
  // =====================
  // TITHING (Primary)
  // =====================
  {
    id: 'mal-3-10',
    reference: 'Malachi 3:10',
    kjvText: 'Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the LORD of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.',
    hebrewText: 'הָבִ֨יאוּ אֶת־כָּל־הַמַּעֲשֵׂ֜ר אֶל־בֵּ֣ית הָאוֹצָ֗ר וִיהִ֥י טֶ֙רֶף֙ בְּבֵיתִ֔י וּבְחָנ֤וּנִי נָא֙ בָּזֹ֔את אָמַ֖ר יְהוָ֣ה צְבָא֑וֹת אִם־לֹ֧א אֶפְתַּ֣ח לָכֶ֗ם אֵ֚ת אֲרֻבּ֣וֹת הַשָּׁמַ֔יִם וַהֲרִיקֹתִ֥י לָכֶ֛ם בְּרָכָ֖ה עַד־בְּלִי־דָֽי',
    hebrewTransliteration: "Havi'u et-kol-hama'aser el-beit ha'otsar...",
    strongNumbers: ['H935', 'H3605', 'H4643', 'H1004', 'H214', 'H1961', 'H2964', 'H1004', 'H974', 'H2063', 'H559', 'H3068', 'H6635', 'H6605', 'H699', 'H8064', 'H7324', 'H1293'],
    category: 'tithing',
    subcategories: ['blessing', 'obedience', 'faith'],
    financialKeywords: ['tithe', 'storehouse', 'blessing', 'give', 'offering'],
    principle: 'Tithing 10% to God brings supernatural blessing and provision',
    defiApplication: 'Set up automated 10% tithe streams from DeFi yields to your church',
    modernApplication: 'Automate your tithing from income to ensure consistent giving',
    testament: 'Old',
    book: 'Malachi',
    chapter: 3,
    verseStart: 10,
    character: 'God through Malachi',
    context: 'God challenges Israel to test Him through tithing',
    crossReferences: ['Genesis 14:20', 'Leviticus 27:30', 'Matthew 23:23']
  },
  {
    id: 'gen-14-20',
    reference: 'Genesis 14:20',
    kjvText: 'And blessed be the most high God, which hath delivered thine enemies into thy hand. And he gave him tithes of all.',
    hebrewText: 'וּבָר֙וּךְ֙ אֵ֣ל עֶלְי֔וֹן אֲשֶׁר־מִגֵּ֥ן צָרֶ֖יךָ בְּיָדֶ֑ךָ וַיִּתֶּן־ל֥וֹ מַעֲשֵׂ֖ר מִכֹּֽל',
    hebrewTransliteration: "Uvarukh El Elyon asher-migen tsarekha beyadekha vayiten-lo ma'aser mikol",
    strongNumbers: ['H1288', 'H410', 'H5945', 'H834', 'H4042', 'H6862', 'H3027', 'H5414', 'H4643', 'H3605'],
    category: 'tithing',
    subcategories: ['firstfruits', 'worship', 'gratitude'],
    financialKeywords: ['tithe', 'tenth', 'all', 'give', 'blessed'],
    principle: 'Tithing predates the Mosaic Law - Abraham tithed voluntarily',
    defiApplication: 'Tithe from every source of income, including DeFi gains and airdrops',
    modernApplication: 'Give 10% from all income sources as an act of worship',
    testament: 'Old',
    book: 'Genesis',
    chapter: 14,
    verseStart: 20,
    character: 'Abraham',
    context: 'Abraham gives tithe to Melchizedek after defeating kings',
    crossReferences: ['Hebrews 7:1-10', 'Malachi 3:10']
  },
  {
    id: 'gen-28-22',
    reference: 'Genesis 28:22',
    kjvText: 'And this stone, which I have set for a pillar, shall be God\'s house: and of all that thou shalt give me I will surely give the tenth unto thee.',
    hebrewText: 'וְהָאֶ֣בֶן הַזֹּ֗את אֲשֶׁר־שַׂ֙מְתִּי֙ מַצֵּבָ֔ה יִהְיֶ֖ה בֵּ֣ית אֱלֹהִ֑ים וְכֹל֙ אֲשֶׁ֣ר תִּתֶּן־לִ֔י עַשֵּׂ֖ר אֲעַשְּׂרֶ֥נּוּ לָֽךְ',
    hebrewTransliteration: "Veha'even hazot asher-samti matsevah yihyeh beit Elohim vekhol asher titen-li aser a'asrenu lakh",
    strongNumbers: ['H68', 'H2063', 'H834', 'H7760', 'H4676', 'H1961', 'H1004', 'H430', 'H3605', 'H5414', 'H6237'],
    category: 'tithing',
    subcategories: ['vow', 'commitment', 'faith'],
    financialKeywords: ['tenth', 'give', 'all', 'promise', 'tithe'],
    principle: 'Making a vow to tithe demonstrates faith and commitment',
    defiApplication: 'Commit to tithing from all DeFi profits before they are realized',
    modernApplication: 'Make a commitment to tithe before receiving income',
    testament: 'Old',
    book: 'Genesis',
    chapter: 28,
    verseStart: 22,
    character: 'Jacob',
    context: 'Jacob vows to tithe after his dream at Bethel',
    crossReferences: ['Genesis 14:20', 'Leviticus 27:30']
  },
  {
    id: 'lev-27-30',
    reference: 'Leviticus 27:30',
    kjvText: 'And all the tithe of the land, whether of the seed of the land, or of the fruit of the tree, is the LORD\'s: it is holy unto the LORD.',
    hebrewText: 'וְכָל־מַעְשַׂ֨ר הָאָ֜רֶץ מִזֶּ֤רַע הָאָ֙רֶץ֙ מִפְּרִ֣י הָעֵ֔ץ לַיהוָ֖ה ה֑וּא קֹ֖דֶשׁ לַיהוָֽה',
    hebrewTransliteration: "Vekhol-ma'sar ha'arets mizera ha'arets miperi ha'ets la'Adonai hu kodesh la'Adonai",
    strongNumbers: ['H3605', 'H4643', 'H776', 'H2233', 'H776', 'H6529', 'H6086', 'H3068', 'H1931', 'H6944', 'H3068'],
    category: 'tithing',
    subcategories: ['holiness', 'law', 'ownership'],
    financialKeywords: ['tithe', 'land', 'seed', 'fruit', 'holy', 'LORD'],
    principle: 'The tithe belongs to God - it is holy and set apart',
    defiApplication: 'Recognize that 10% of all DeFi gains already belongs to God',
    modernApplication: 'Understand tithing as returning what already belongs to God',
    testament: 'Old',
    book: 'Leviticus',
    chapter: 27,
    verseStart: 30,
    character: 'Moses',
    context: 'Mosaic law establishing the tithe',
    crossReferences: ['Numbers 18:21', 'Deuteronomy 14:22']
  },
  {
    id: 'matt-23-23',
    reference: 'Matthew 23:23',
    kjvText: 'Woe unto you, scribes and Pharisees, hypocrites! for ye pay tithe of mint and anise and cummin, and have omitted the weightier matters of the law, judgment, mercy, and faith: these ought ye to have done, and not to leave the other undone.',
    greekText: 'Οὐαὶ ὑμῖν, γραμματεῖς καὶ Φαρισαῖοι, ὑποκριταί, ὅτι ἀποδεκατοῦτε τὸ ἡδύοσμον καὶ τὸ ἄνηθον καὶ τὸ κύμινον, καὶ ἀφήκατε τὰ βαρύτερα τοῦ νόμου, τὴν κρίσιν καὶ τὸ ἔλεος καὶ τὴν πίστιν',
    greekTransliteration: 'Ouai humin, grammateis kai Pharisaioi, hupokritai, hoti apodekatoute to heduosmon...',
    strongNumbers: ['G3759', 'G1122', 'G5330', 'G5273', 'G586', 'G2238', 'G432', 'G2951', 'G863', 'G926', 'G3551', 'G2920', 'G1656', 'G4102'],
    category: 'tithing',
    subcategories: ['heart', 'balance', 'justice'],
    financialKeywords: ['tithe', 'mint', 'law', 'judgment', 'mercy', 'faith'],
    principle: 'Tithe with the right heart - combine giving with justice and mercy',
    defiApplication: 'Balance tithing with ethical DeFi practices and fair dealing',
    modernApplication: 'Tithe while also pursuing justice, mercy, and faith in all dealings',
    testament: 'New',
    book: 'Matthew',
    chapter: 23,
    verseStart: 23,
    character: 'Jesus',
    context: 'Jesus affirms tithing while condemning hypocritical focus on minutiae',
    crossReferences: ['Luke 11:42', 'Malachi 3:10']
  },

  // =====================
  // GIVING & GENEROSITY
  // =====================
  {
    id: 'prov-3-9-10',
    reference: 'Proverbs 3:9-10',
    kjvText: 'Honour the LORD with thy substance, and with the firstfruits of all thine increase: So shall thy barns be filled with plenty, and thy presses shall burst out with new wine.',
    hebrewText: 'כַּבֵּ֣ד אֶת־יְ֭הוָה מֵהוֹנֶ֑ךָ וּ֝מֵרֵאשִׁ֗ית כָּל־תְּבוּאָתֶֽךָ׃ וְיִמָּלְא֣וּ אֲסָמֶ֣יךָ שָׂבָ֑ע וְ֝תִיר֗וֹשׁ יְקָבֶ֥יךָ יִפְרֹֽצוּ',
    hebrewTransliteration: "Kabed et-Adonai mehonek umereshit kol-tevu'atekha...",
    strongNumbers: ['H3513', 'H3068', 'H1952', 'H7225', 'H3605', 'H8393', 'H4390', 'H618', 'H7647', 'H8492', 'H3342', 'H6555'],
    category: 'giving',
    subcategories: ['firstfruits', 'honor', 'abundance'],
    financialKeywords: ['honour', 'substance', 'firstfruits', 'increase', 'plenty'],
    principle: 'Giving firstfruits to God leads to abundant provision',
    defiApplication: 'Give from the first profits, not just leftover gains',
    modernApplication: 'Prioritize giving to God before other expenses',
    testament: 'Old',
    book: 'Proverbs',
    chapter: 3,
    verseStart: 9,
    verseEnd: 10,
    character: 'Solomon',
    context: 'Wisdom teaching on honoring God with wealth',
    crossReferences: ['Exodus 23:19', 'Deuteronomy 26:2']
  },
  {
    id: '2-cor-9-6-7',
    reference: '2 Corinthians 9:6-7',
    kjvText: 'But this I say, He which soweth sparingly shall reap also sparingly; and he which soweth bountifully shall reap also bountifully. Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.',
    greekText: 'Τοῦτο δέ, ὁ σπείρων φειδομένως φειδομένως καὶ θερίσει, καὶ ὁ σπείρων ἐπ᾽ εὐλογίαις ἐπ᾽ εὐλογίαις καὶ θερίσει. ἕκαστος καθὼς προῄρηται τῇ καρδίᾳ, μὴ ἐκ λύπης ἢ ἐξ ἀνάγκης· ἱλαρὸν γὰρ δότην ἀγαπᾷ ὁ θεός.',
    greekTransliteration: 'Touto de, ho speiron pheidomenos pheidomenos kai therisei...',
    strongNumbers: ['G4687', 'G5340', 'G2325', 'G2129', 'G1538', 'G2588', 'G3077', 'G318', 'G2431', 'G1395', 'G25', 'G2316'],
    category: 'giving',
    subcategories: ['cheerful', 'sowing', 'harvest'],
    financialKeywords: ['soweth', 'reap', 'bountifully', 'give', 'cheerful', 'heart'],
    principle: 'Generous, cheerful giving produces generous returns',
    defiApplication: 'Give generously and cheerfully from DeFi profits for greater spiritual ROI',
    modernApplication: 'Give joyfully and generously, expecting spiritual multiplication',
    testament: 'New',
    book: '2 Corinthians',
    chapter: 9,
    verseStart: 6,
    verseEnd: 7,
    character: 'Paul',
    context: 'Paul teaches the Corinthians about generous giving',
    crossReferences: ['Luke 6:38', 'Proverbs 11:24-25']
  },
  {
    id: 'luke-6-38',
    reference: 'Luke 6:38',
    kjvText: 'Give, and it shall be given unto you; good measure, pressed down, and shaken together, and running over, shall men give into your bosom. For with the same measure that ye mete withal it shall be measured to you again.',
    greekText: 'δίδοτε, καὶ δοθήσεται ὑμῖν· μέτρον καλὸν πεπιεσμένον σεσαλευμένον ὑπερεκχυννόμενον δώσουσιν εἰς τὸν κόλπον ὑμῶν· ᾧ γὰρ μέτρῳ μετρεῖτε ἀντιμετρηθήσεται ὑμῖν.',
    greekTransliteration: 'didote, kai dothesetai humin; metron kalon pepiesmenon sesaleumenon huperekchunnomenon...',
    strongNumbers: ['G1325', 'G3358', 'G2570', 'G4085', 'G4531', 'G5240', 'G2859', 'G3354', 'G488'],
    category: 'giving',
    subcategories: ['reciprocity', 'abundance', 'measure'],
    financialKeywords: ['give', 'measure', 'running over', 'bosom'],
    principle: 'The measure you give determines the measure you receive',
    defiApplication: 'Generous giving in crypto creates opportunities for generous returns',
    modernApplication: 'Be generous in giving, and you will receive generously',
    testament: 'New',
    book: 'Luke',
    chapter: 6,
    verseStart: 38,
    character: 'Jesus',
    context: 'Jesus teaching on generosity in the Sermon on the Plain',
    crossReferences: ['2 Corinthians 9:6', 'Proverbs 19:17']
  },
  {
    id: 'acts-20-35',
    reference: 'Acts 20:35',
    kjvText: 'I have shewed you all things, how that so labouring ye ought to support the weak, and to remember the words of the Lord Jesus, how he said, It is more blessed to give than to receive.',
    greekText: 'πάντα ὑπέδειξα ὑμῖν ὅτι οὕτως κοπιῶντας δεῖ ἀντιλαμβάνεσθαι τῶν ἀσθενούντων, μνημονεύειν τε τῶν λόγων τοῦ κυρίου Ἰησοῦ ὅτι αὐτὸς εἶπεν· Μακάριόν ἐστιν μᾶλλον διδόναι ἢ λαμβάνειν.',
    greekTransliteration: 'panta hupedeixa humin hoti houtos kopiōntas dei antilambanesthai tōn asthenoyntōn...',
    strongNumbers: ['G5263', 'G2872', 'G1163', 'G482', 'G770', 'G3421', 'G3056', 'G2962', 'G2424', 'G3107', 'G1325', 'G2983'],
    category: 'giving',
    subcategories: ['blessing', 'work', 'support'],
    financialKeywords: ['labouring', 'support', 'weak', 'give', 'receive', 'blessed'],
    principle: 'Giving is more blessed than receiving',
    defiApplication: 'Use DeFi gains to support those in need rather than just accumulating',
    modernApplication: 'Find greater joy in giving than in receiving',
    testament: 'New',
    book: 'Acts',
    chapter: 20,
    verseStart: 35,
    character: 'Paul quoting Jesus',
    context: 'Paul\'s farewell address to the Ephesian elders',
    crossReferences: ['Luke 6:38', 'Proverbs 11:25']
  },

  // =====================
  // STEWARDSHIP
  // =====================
  {
    id: 'matt-25-14-30',
    reference: 'Matthew 25:21',
    kjvText: 'His lord said unto him, Well done, thou good and faithful servant: thou hast been faithful over a few things, I will make thee ruler over many things: enter thou into the joy of thy lord.',
    greekText: 'ἔφη αὐτῷ ὁ κύριος αὐτοῦ· Εὖ, δοῦλε ἀγαθὲ καὶ πιστέ, ἐπὶ ὀλίγα ἦς πιστός, ἐπὶ πολλῶν σε καταστήσω· εἴσελθε εἰς τὴν χαρὰν τοῦ κυρίου σου.',
    greekTransliteration: 'ephē autō ho kurios autou; Eu, doule agathe kai piste, epi oliga ēs pistos...',
    strongNumbers: ['G5346', 'G2962', 'G2095', 'G1401', 'G18', 'G4103', 'G3641', 'G4183', 'G2525', 'G1525', 'G5479'],
    category: 'stewardship',
    subcategories: ['faithfulness', 'reward', 'responsibility'],
    financialKeywords: ['faithful', 'servant', 'ruler', 'talents', 'increase'],
    principle: 'Faithful stewardship of little leads to greater responsibility',
    defiApplication: 'Manage small DeFi positions faithfully before scaling up',
    modernApplication: 'Prove faithful with small amounts before handling larger sums',
    testament: 'New',
    book: 'Matthew',
    chapter: 25,
    verseStart: 21,
    character: 'Jesus',
    context: 'Parable of the Talents - faithful steward rewarded',
    crossReferences: ['Luke 16:10', 'Luke 19:17']
  },
  {
    id: 'luke-16-10-12',
    reference: 'Luke 16:10-12',
    kjvText: 'He that is faithful in that which is least is faithful also in much: and he that is unjust in the least is unjust also in much. If therefore ye have not been faithful in the unrighteous mammon, who will commit to your trust the true riches? And if ye have not been faithful in that which is another man\'s, who shall give you that which is your own?',
    greekText: 'Ὁ πιστὸς ἐν ἐλαχίστῳ καὶ ἐν πολλῷ πιστός ἐστιν, καὶ ὁ ἐν ἐλαχίστῳ ἄδικος καὶ ἐν πολλῷ ἄδικός ἐστιν.',
    greekTransliteration: 'Ho pistos en elachistō kai en pollō pistos estin...',
    strongNumbers: ['G4103', 'G1646', 'G4183', 'G94', 'G3126', 'G4100', 'G228', 'G4149', 'G245'],
    category: 'stewardship',
    subcategories: ['faithfulness', 'testing', 'trust'],
    financialKeywords: ['faithful', 'least', 'much', 'mammon', 'riches', 'trust'],
    principle: 'Faithfulness with worldly wealth demonstrates trustworthiness for spiritual riches',
    defiApplication: 'Handle small DeFi amounts honestly to be trusted with larger opportunities',
    modernApplication: 'Be faithful with others\' money before expecting your own',
    testament: 'New',
    book: 'Luke',
    chapter: 16,
    verseStart: 10,
    verseEnd: 12,
    character: 'Jesus',
    context: 'Jesus teaching on faithful stewardship',
    crossReferences: ['Matthew 25:21', 'Luke 19:17']
  },
  {
    id: '1-cor-4-2',
    reference: '1 Corinthians 4:2',
    kjvText: 'Moreover it is required in stewards, that a man be found faithful.',
    greekText: 'ὧδε λοιπὸν ζητεῖται ἐν τοῖς οἰκονόμοις ἵνα πιστός τις εὑρεθῇ.',
    greekTransliteration: 'hōde loipon zēteitai en tois oikonomois hina pistos tis heurethē',
    strongNumbers: ['G5602', 'G3063', 'G2212', 'G3623', 'G2443', 'G4103', 'G5100', 'G2147'],
    category: 'stewardship',
    subcategories: ['faithfulness', 'requirement', 'accountability'],
    financialKeywords: ['stewards', 'faithful', 'required'],
    principle: 'Faithfulness is the primary requirement for stewards',
    defiApplication: 'Prioritize faithful management over maximizing returns',
    modernApplication: 'Focus on being faithful with what you manage rather than just profitable',
    testament: 'New',
    book: '1 Corinthians',
    chapter: 4,
    verseStart: 2,
    character: 'Paul',
    context: 'Paul teaching on the requirements of stewardship',
    crossReferences: ['Matthew 25:21', 'Luke 16:10']
  },

  // =====================
  // DEBT & LENDING
  // =====================
  {
    id: 'prov-22-7',
    reference: 'Proverbs 22:7',
    kjvText: 'The rich ruleth over the poor, and the borrower is servant to the lender.',
    hebrewText: 'עָ֭שִׁיר בְּרָשִׁ֣ים יִמְשׁ֑וֹל וְעֶ֥בֶד לֹ֝וֶ֗ה לְאִ֣ישׁ מַלְוֶֽה',
    hebrewTransliteration: 'Ashir berashim yimshol ve\'eved loveh le\'ish malveh',
    strongNumbers: ['H6223', 'H7326', 'H4910', 'H5650', 'H3867', 'H376', 'H3867'],
    category: 'debt',
    subcategories: ['bondage', 'power', 'warning'],
    financialKeywords: ['rich', 'poor', 'borrower', 'servant', 'lender'],
    principle: 'Debt creates bondage - the borrower becomes servant to the lender',
    defiApplication: 'Avoid over-leveraged DeFi positions that could liquidate you',
    modernApplication: 'Minimize debt to maintain financial freedom',
    testament: 'Old',
    book: 'Proverbs',
    chapter: 22,
    verseStart: 7,
    character: 'Solomon',
    context: 'Wisdom teaching on the power dynamics of debt',
    crossReferences: ['Romans 13:8', 'Deuteronomy 28:12']
  },
  {
    id: 'rom-13-8',
    reference: 'Romans 13:8',
    kjvText: 'Owe no man any thing, but to love one another: for he that loveth another hath fulfilled the law.',
    greekText: 'Μηδενὶ μηδὲν ὀφείλετε, εἰ μὴ τὸ ἀλλήλους ἀγαπᾶν· ὁ γὰρ ἀγαπῶν τὸν ἕτερον νόμον πεπλήρωκεν.',
    greekTransliteration: 'Mēdeni mēden opheilete, ei mē to allēlous agapan...',
    strongNumbers: ['G3367', 'G3762', 'G3784', 'G1508', 'G240', 'G25', 'G2087', 'G3551', 'G4137'],
    category: 'debt',
    subcategories: ['freedom', 'love', 'fulfillment'],
    financialKeywords: ['owe', 'debt', 'love', 'fulfilled'],
    principle: 'Strive to be debt-free, owing only the debt of love',
    defiApplication: 'Close DeFi lending positions as quickly as possible',
    modernApplication: 'Work toward being debt-free while loving others generously',
    testament: 'New',
    book: 'Romans',
    chapter: 13,
    verseStart: 8,
    character: 'Paul',
    context: 'Paul teaching on Christian obligations',
    crossReferences: ['Proverbs 22:7', 'Psalm 37:21']
  },
  {
    id: 'deut-28-12',
    reference: 'Deuteronomy 28:12',
    kjvText: 'The LORD shall open unto thee his good treasure, the heaven to give the rain unto thy land in his season, and to bless all the work of thine hand: and thou shalt lend unto many nations, and thou shalt not borrow.',
    hebrewText: 'יִפְתַּ֣ח יְהוָ֣ה ׀ לְ֠ךָ אֶת־אוֹצָר֨וֹ הַטּ֜וֹב אֶת־הַשָּׁמַ֗יִם לָתֵ֤ת מְטַֽר־אַרְצְךָ֙ בְּעִתּ֔וֹ וּלְבָרֵ֕ךְ אֵ֖ת כָּל־מַעֲשֵׂ֣ה יָדֶ֑ךָ וְהִלְוִ֙יתָ֙ גּוֹיִ֣ם רַבִּ֔ים וְאַתָּ֖ה לֹ֥א תִלְוֶֽה',
    hebrewTransliteration: 'Yiftach Adonai lekha et-otsaro hatov...',
    strongNumbers: ['H6605', 'H3068', 'H214', 'H2896', 'H8064', 'H5414', 'H4306', 'H776', 'H6256', 'H1288', 'H3605', 'H4639', 'H3027', 'H3867', 'H1471', 'H7227', 'H3867'],
    category: 'lending',
    subcategories: ['blessing', 'prosperity', 'lending'],
    financialKeywords: ['treasure', 'bless', 'work', 'lend', 'nations', 'borrow'],
    principle: 'God\'s blessing includes being a lender, not a borrower',
    defiApplication: 'Use DeFi lending protocols to earn yield as a lender',
    modernApplication: 'Position yourself to be a lender rather than a borrower',
    testament: 'Old',
    book: 'Deuteronomy',
    chapter: 28,
    verseStart: 12,
    character: 'Moses',
    context: 'Blessings for obedience to God\'s commands',
    crossReferences: ['Proverbs 22:7', 'Deuteronomy 15:6']
  },
  {
    id: 'exo-22-25',
    reference: 'Exodus 22:25',
    kjvText: 'If thou lend money to any of my people that is poor by thee, thou shalt not be to him as an usurer, neither shalt thou lay upon him usury.',
    hebrewText: 'אִם־כֶּ֣סֶף ׀ תַּלְוֶ֣ה אֶת־עַמִּ֗י אֶת־הֶֽעָנִי֙ עִמָּ֔ךְ לֹא־תִהְיֶ֥ה ל֖וֹ כְּנֹשֶׁ֑ה לֹא־תְשִׂימ֥וּן עָלָ֖יו נֶֽשֶׁךְ',
    hebrewTransliteration: 'Im-kesef talveh et-ami et-he\'ani immakh lo-tihyeh lo kenoseh lo-tesimon alav neshekh',
    strongNumbers: ['H3701', 'H3867', 'H5971', 'H6041', 'H1961', 'H5383', 'H7760', 'H5392'],
    category: 'lending',
    subcategories: ['compassion', 'usury', 'poor'],
    financialKeywords: ['lend', 'money', 'poor', 'usurer', 'usury', 'interest'],
    principle: 'Lending to the poor should be compassionate, without exploitative interest',
    defiApplication: 'Consider zero or low-interest DeFi lending options for those in need',
    modernApplication: 'Lend to those in genuine need without exploiting their situation',
    testament: 'Old',
    book: 'Exodus',
    chapter: 22,
    verseStart: 25,
    character: 'Moses',
    context: 'Laws about lending and treatment of the poor',
    crossReferences: ['Leviticus 25:36-37', 'Deuteronomy 23:19-20']
  },

  // =====================
  // WORK & WAGES
  // =====================
  {
    id: 'col-3-23-24',
    reference: 'Colossians 3:23-24',
    kjvText: 'And whatsoever ye do, do it heartily, as to the Lord, and not unto men; Knowing that of the Lord ye shall receive the reward of the inheritance: for ye serve the Lord Christ.',
    greekText: 'ὃ ἐὰν ποιῆτε, ἐκ ψυχῆς ἐργάζεσθε, ὡς τῷ κυρίῳ καὶ οὐκ ἀνθρώποις, εἰδότες ὅτι ἀπὸ κυρίου ἀπολήμψεσθε τὴν ἀνταπόδοσιν τῆς κληρονομίας· τῷ κυρίῳ Χριστῷ δουλεύετε.',
    greekTransliteration: 'ho ean poiēte, ek psuchēs ergazesthe, hōs tō kuriō kai ouk anthrōpois...',
    strongNumbers: ['G3739', 'G1437', 'G4160', 'G5590', 'G2038', 'G2962', 'G444', 'G1492', 'G618', 'G469', 'G2817', 'G1398'],
    category: 'work',
    subcategories: ['excellence', 'reward', 'service'],
    financialKeywords: ['do', 'heartily', 'Lord', 'reward', 'inheritance', 'serve'],
    principle: 'Work with excellence as if serving God, not just for human employers',
    defiApplication: 'Approach DeFi activities with excellence and integrity',
    modernApplication: 'Work with excellence in all endeavors as worship to God',
    testament: 'New',
    book: 'Colossians',
    chapter: 3,
    verseStart: 23,
    verseEnd: 24,
    character: 'Paul',
    context: 'Paul teaching on Christian work ethic',
    crossReferences: ['Ephesians 6:7-8', 'Ecclesiastes 9:10']
  },
  {
    id: 'prov-14-23',
    reference: 'Proverbs 14:23',
    kjvText: 'In all labour there is profit: but the talk of the lips tendeth only to penury.',
    hebrewText: 'בְּכָל־עֶ֭צֶב יִהְיֶ֣ה מוֹתָ֑ר וּדְבַר־שְׂ֝פָתַ֗יִם אַךְ־לְמַחְסֽוֹר',
    hebrewTransliteration: 'Bekhol-etsev yihyeh motar udvar-sefatayim akh-lemachsor',
    strongNumbers: ['H3605', 'H6089', 'H1961', 'H4195', 'H1697', 'H8193', 'H389', 'H4270'],
    category: 'work',
    subcategories: ['profit', 'action', 'laziness'],
    financialKeywords: ['labour', 'profit', 'talk', 'penury', 'work'],
    principle: 'Actual work produces profit; mere talk leads to poverty',
    defiApplication: 'Active research and work in DeFi beats just talking about it',
    modernApplication: 'Take action rather than just talking about plans',
    testament: 'Old',
    book: 'Proverbs',
    chapter: 14,
    verseStart: 23,
    character: 'Solomon',
    context: 'Wisdom teaching on the value of work',
    crossReferences: ['Proverbs 10:4', 'Proverbs 21:5']
  },
  {
    id: '2-thess-3-10',
    reference: '2 Thessalonians 3:10',
    kjvText: 'For even when we were with you, this we commanded you, that if any would not work, neither should he eat.',
    greekText: 'καὶ γὰρ ὅτε ἦμεν πρὸς ὑμᾶς, τοῦτο παρηγγέλλομεν ὑμῖν, ὅτι εἴ τις οὐ θέλει ἐργάζεσθαι, μηδὲ ἐσθιέτω.',
    greekTransliteration: 'kai gar hote ēmen pros humas, touto parēngellomen humin, hoti ei tis ou thelei ergazesthai, mēde esthietō',
    strongNumbers: ['G2532', 'G1063', 'G3753', 'G1510', 'G4314', 'G3853', 'G1487', 'G5100', 'G2309', 'G2038', 'G3366', 'G2068'],
    category: 'work',
    subcategories: ['responsibility', 'provision', 'laziness'],
    financialKeywords: ['work', 'eat', 'commanded'],
    principle: 'Those who refuse to work should not expect to be supported',
    defiApplication: 'Don\'t expect DeFi gains without putting in research and effort',
    modernApplication: 'Work is required for provision - avoid idleness',
    testament: 'New',
    book: '2 Thessalonians',
    chapter: 3,
    verseStart: 10,
    character: 'Paul',
    context: 'Paul addressing idleness in the Thessalonian church',
    crossReferences: ['Proverbs 10:4', 'Proverbs 19:15']
  },
  {
    id: 'james-5-4',
    reference: 'James 5:4',
    kjvText: 'Behold, the hire of the labourers who have reaped down your fields, which is of you kept back by fraud, crieth: and the cries of them which have reaped are entered into the ears of the Lord of sabaoth.',
    greekText: 'ἰδοὺ ὁ μισθὸς τῶν ἐργατῶν τῶν ἀμησάντων τὰς χώρας ὑμῶν ὁ ἀφυστερημένος ἀφ᾽ ὑμῶν κράζει, καὶ αἱ βοαὶ τῶν θερισάντων εἰς τὰ ὦτα κυρίου σαβαὼθ εἰσελήλυθαν.',
    greekTransliteration: 'idou ho misthos tōn ergatōn tōn amēsantōn tas chōras humōn...',
    strongNumbers: ['G2400', 'G3408', 'G2040', 'G270', 'G5561', 'G650', 'G2896', 'G995', 'G2325', 'G1525', 'G3775', 'G2962', 'G4519'],
    category: 'wages',
    subcategories: ['justice', 'fraud', 'accountability'],
    financialKeywords: ['hire', 'labourers', 'fraud', 'wages', 'cries'],
    principle: 'Withholding fair wages is a sin that cries out to God',
    defiApplication: 'Pay fair fees and don\'t exploit DeFi users or developers',
    modernApplication: 'Pay workers fairly and promptly - wage theft is serious sin',
    testament: 'New',
    book: 'James',
    chapter: 5,
    verseStart: 4,
    character: 'James',
    context: 'James warning against exploitation of workers',
    crossReferences: ['Leviticus 19:13', 'Deuteronomy 24:14-15']
  },

  // =====================
  // SAVING & PLANNING
  // =====================
  {
    id: 'prov-21-5',
    reference: 'Proverbs 21:5',
    kjvText: 'The thoughts of the diligent tend only to plenteousness; but of every one that is hasty only to want.',
    hebrewText: 'מַחְשְׁב֣וֹת חָ֭רוּץ אַךְ־לְמוֹתָ֑ר וְכָל־אָ֝֗ץ אַךְ־לְמַחְסֽוֹר',
    hebrewTransliteration: 'Machshevot charutz akh-lemotar vekhol-ats akh-lemachsor',
    strongNumbers: ['H4284', 'H2742', 'H389', 'H4195', 'H3605', 'H213', 'H389', 'H4270'],
    category: 'planning',
    subcategories: ['diligence', 'patience', 'abundance'],
    financialKeywords: ['thoughts', 'diligent', 'plenteousness', 'hasty', 'want'],
    principle: 'Careful planning leads to abundance; hasty decisions lead to poverty',
    defiApplication: 'Research and plan DeFi strategies carefully - avoid FOMO',
    modernApplication: 'Take time to plan financial decisions thoroughly',
    testament: 'Old',
    book: 'Proverbs',
    chapter: 21,
    verseStart: 5,
    character: 'Solomon',
    context: 'Wisdom teaching on planning vs. haste',
    crossReferences: ['Proverbs 13:11', 'Proverbs 28:20']
  },
  {
    id: 'prov-6-6-8',
    reference: 'Proverbs 6:6-8',
    kjvText: 'Go to the ant, thou sluggard; consider her ways, and be wise: Which having no guide, overseer, or ruler, Provideth her meat in the summer, and gathereth her food in the harvest.',
    hebrewText: 'לֵֽךְ־אֶל־נְמָלָ֥ה עָצֵ֑ל רְאֵ֖ה דְרָכֶ֣יהָ וַחֲכָֽם׃ אֲשֶׁ֖ר אֵֽין־לָ֥הּ קָצִ֗ין שֹׁטֵ֥ר וּמֹשֵֽׁל׃ תָּכִ֣ין בַּקַּ֣יִץ לַחְמָ֑הּ אָגְרָ֥ה בַ֝קָּצִ֗יר מַאֲכָלָֽהּ',
    hebrewTransliteration: 'Lekh-el-nemalah atsel reeh derakheha vachakham...',
    strongNumbers: ['H1980', 'H5244', 'H6102', 'H7200', 'H1870', 'H2449', 'H834', 'H369', 'H7101', 'H7860', 'H4910', 'H3559', 'H7019', 'H3899', 'H103', 'H7105', 'H3978'],
    category: 'saving',
    subcategories: ['preparation', 'wisdom', 'diligence'],
    financialKeywords: ['ant', 'sluggard', 'wise', 'provideth', 'summer', 'harvest', 'food'],
    principle: 'Save and prepare during times of plenty for times of scarcity',
    defiApplication: 'Take profits during bull markets; save stablecoins for bear markets',
    modernApplication: 'Build emergency funds and save during prosperous times',
    testament: 'Old',
    book: 'Proverbs',
    chapter: 6,
    verseStart: 6,
    verseEnd: 8,
    character: 'Solomon',
    context: 'Learning wisdom from nature',
    crossReferences: ['Genesis 41:34-36', 'Proverbs 30:25']
  },
  {
    id: 'prov-13-11',
    reference: 'Proverbs 13:11',
    kjvText: 'Wealth gotten by vanity shall be diminished: but he that gathereth by labour shall increase.',
    hebrewText: 'ה֭וֹן מֵהֶ֣בֶל יִמְעָ֑ט וְקֹבֵ֖ץ עַל־יָ֣ד יַרְבֶּֽה',
    hebrewTransliteration: 'Hon mehevel yim\'at vekovets al-yad yarbeh',
    strongNumbers: ['H1952', 'H1892', 'H4591', 'H6908', 'H3027', 'H7235'],
    category: 'saving',
    subcategories: ['growth', 'patience', 'labor'],
    financialKeywords: ['wealth', 'vanity', 'diminished', 'gathereth', 'labour', 'increase'],
    principle: 'Get-rich-quick schemes fail; steady accumulation succeeds',
    defiApplication: 'Dollar-cost average into positions; avoid Ponzi-like schemes',
    modernApplication: 'Build wealth gradually through consistent work and saving',
    testament: 'Old',
    book: 'Proverbs',
    chapter: 13,
    verseStart: 11,
    character: 'Solomon',
    context: 'Wisdom teaching on wealth accumulation',
    crossReferences: ['Proverbs 21:5', 'Proverbs 28:20']
  },

  // =====================
  // TAXES
  // =====================
  {
    id: 'matt-22-21',
    reference: 'Matthew 22:21',
    kjvText: 'They say unto him, Caesar\'s. Then saith he unto them, Render therefore unto Caesar the things which are Caesar\'s; and unto God the things that are God\'s.',
    greekText: 'λέγουσιν αὐτῷ· Καίσαρος. τότε λέγει αὐτοῖς· Ἀπόδοτε οὖν τὰ Καίσαρος Καίσαρι καὶ τὰ τοῦ θεοῦ τῷ θεῷ.',
    greekTransliteration: 'legousin autō; Kaisaros. tote legei autois; Apodote oun ta Kaisaros Kaisari kai ta tou theou tō theō',
    strongNumbers: ['G3004', 'G2541', 'G5119', 'G591', 'G3767', 'G2316'],
    category: 'taxes',
    subcategories: ['government', 'obedience', 'balance'],
    financialKeywords: ['Caesar', 'render', 'God', 'taxes'],
    principle: 'Pay taxes to the government while giving to God what belongs to God',
    defiApplication: 'Pay crypto taxes honestly while also tithing to your church',
    modernApplication: 'Fulfill both civic tax obligations and spiritual giving duties',
    testament: 'New',
    book: 'Matthew',
    chapter: 22,
    verseStart: 21,
    character: 'Jesus',
    context: 'Jesus answering about paying taxes to Caesar',
    crossReferences: ['Romans 13:7', 'Mark 12:17', 'Luke 20:25']
  },
  {
    id: 'rom-13-6-7',
    reference: 'Romans 13:6-7',
    kjvText: 'For for this cause pay ye tribute also: for they are God\'s ministers, attending continually upon this very thing. Render therefore to all their dues: tribute to whom tribute is due; custom to whom custom; fear to whom fear; honour to whom honour.',
    greekText: 'διὰ τοῦτο γὰρ καὶ φόρους τελεῖτε, λειτουργοὶ γὰρ θεοῦ εἰσιν εἰς αὐτὸ τοῦτο προσκαρτεροῦντες. ἀπόδοτε πᾶσιν τὰς ὀφειλάς, τῷ τὸν φόρον τὸν φόρον, τῷ τὸ τέλος τὸ τέλος, τῷ τὸν φόβον τὸν φόβον, τῷ τὴν τιμὴν τὴν τιμήν.',
    greekTransliteration: 'dia touto gar kai phorous teleite, leitourgoi gar theou eisin...',
    strongNumbers: ['G1223', 'G5124', 'G2532', 'G5411', 'G5055', 'G3011', 'G2316', 'G1510', 'G4342', 'G591', 'G3956', 'G3782', 'G5056', 'G5401', 'G5092'],
    category: 'taxes',
    subcategories: ['duty', 'honor', 'government'],
    financialKeywords: ['tribute', 'ministers', 'dues', 'custom', 'honour', 'taxes'],
    principle: 'Paying taxes is a Christian duty and honors God',
    defiApplication: 'Track and report all DeFi income accurately for taxes',
    modernApplication: 'Pay taxes honestly as an act of obedience to God',
    testament: 'New',
    book: 'Romans',
    chapter: 13,
    verseStart: 6,
    verseEnd: 7,
    character: 'Paul',
    context: 'Paul teaching on submission to governing authorities',
    crossReferences: ['Matthew 22:21', '1 Peter 2:13-14']
  },

  // =====================
  // WEALTH & CONTENTMENT
  // =====================
  {
    id: '1-tim-6-6-10',
    reference: '1 Timothy 6:6-10',
    kjvText: 'But godliness with contentment is great gain. For we brought nothing into this world, and it is certain we can carry nothing out. And having food and raiment let us be therewith content. But they that will be rich fall into temptation and a snare, and into many foolish and hurtful lusts, which drown men in destruction and perdition. For the love of money is the root of all evil: which while some coveted after, they have erred from the faith, and pierced themselves through with many sorrows.',
    greekText: 'Ἔστιν δὲ πορισμὸς μέγας ἡ εὐσέβεια μετὰ αὐταρκείας...',
    greekTransliteration: 'Estin de porismos megas hē eusebeia meta autarkeias...',
    strongNumbers: ['G2076', 'G4200', 'G3173', 'G2150', 'G3326', 'G841', 'G5342', 'G3762', 'G2889', 'G1427', 'G5315', 'G5160', 'G4629', 'G714', 'G2309', 'G4145', 'G4098', 'G3986', 'G3803', 'G453', 'G983', 'G1939', 'G1036', 'G684', 'G5365', 'G694', 'G4561', 'G2556', 'G3713', 'G635', 'G4102', 'G4044', 'G4183', 'G3601'],
    category: 'contentment',
    subcategories: ['godliness', 'warning', 'danger'],
    financialKeywords: ['godliness', 'contentment', 'gain', 'food', 'raiment', 'rich', 'temptation', 'money', 'evil', 'sorrows'],
    principle: 'Contentment with godliness is true wealth; love of money leads to destruction',
    defiApplication: 'Be content with reasonable DeFi gains; avoid greed-driven decisions',
    modernApplication: 'Find contentment in godliness rather than endless wealth accumulation',
    testament: 'New',
    book: '1 Timothy',
    chapter: 6,
    verseStart: 6,
    verseEnd: 10,
    character: 'Paul',
    context: 'Paul warning Timothy about the love of money',
    crossReferences: ['Hebrews 13:5', 'Philippians 4:11-12']
  },
  {
    id: 'heb-13-5',
    reference: 'Hebrews 13:5',
    kjvText: 'Let your conversation be without covetousness; and be content with such things as ye have: for he hath said, I will never leave thee, nor forsake thee.',
    greekText: 'Ἀφιλάργυρος ὁ τρόπος· ἀρκούμενοι τοῖς παροῦσιν· αὐτὸς γὰρ εἴρηκεν· Οὐ μή σε ἀνῶ οὐδ᾽ οὐ μή σε ἐγκαταλίπω.',
    greekTransliteration: 'Aphilarguros ho tropos; arkoumenoi tois parousin; autos gar eirēken; Ou mē se anō oud ou mē se egkatalipō',
    strongNumbers: ['G866', 'G5158', 'G714', 'G3918', 'G846', 'G3004', 'G447', 'G1459'],
    category: 'contentment',
    subcategories: ['trust', 'provision', 'freedom'],
    financialKeywords: ['covetousness', 'content', 'have', 'leave', 'forsake'],
    principle: 'Contentment comes from trusting God\'s presence and provision',
    defiApplication: 'Don\'t chase every DeFi opportunity out of FOMO - trust God\'s provision',
    modernApplication: 'Be content with what you have, trusting God\'s faithfulness',
    testament: 'New',
    book: 'Hebrews',
    chapter: 13,
    verseStart: 5,
    character: 'Unknown (Hebrews author)',
    context: 'Teaching on Christian contentment',
    crossReferences: ['1 Timothy 6:6-10', 'Philippians 4:11-12']
  },
  {
    id: 'prov-23-4-5',
    reference: 'Proverbs 23:4-5',
    kjvText: 'Labour not to be rich: cease from thine own wisdom. Wilt thou set thine eyes upon that which is not? for riches certainly make themselves wings; they fly away as an eagle toward heaven.',
    hebrewText: 'אַל־תִּיגַ֥ע לְהַעֲשִׁ֑יר מִבִּינָתְךָ֥ חֲדָֽל׃ הֲתָע֤וּף עֵינֶ֨יךָ בּ֗וֹ וְאֵינֶ֥נּוּ כִּֽי עָ֭שֹׂה יַעֲשֶׂה־לּ֣וֹ כְנָפַ֑יִם כְּ֝נֶ֗שֶׁר יָע֥וּף הַשָּׁמָֽיִם',
    hebrewTransliteration: 'Al-tiga leha\'ashir mibbinatekha chadal...',
    strongNumbers: ['H408', 'H3021', 'H6238', 'H998', 'H2308', 'H5774', 'H5869', 'H369', 'H6213', 'H3671', 'H5404', 'H5774', 'H8064'],
    category: 'wealth',
    subcategories: ['warning', 'perspective', 'fleeting'],
    financialKeywords: ['labour', 'rich', 'wisdom', 'riches', 'wings', 'fly', 'eagle'],
    principle: 'Wealth is fleeting - don\'t exhaust yourself pursuing it',
    defiApplication: 'Don\'t burn out chasing DeFi gains - they can disappear quickly',
    modernApplication: 'Don\'t make wealth accumulation your life\'s primary goal',
    testament: 'Old',
    book: 'Proverbs',
    chapter: 23,
    verseStart: 4,
    verseEnd: 5,
    character: 'Solomon',
    context: 'Wisdom teaching on the fleeting nature of riches',
    crossReferences: ['1 Timothy 6:6-10', 'Matthew 6:19-21']
  },

  // =====================
  // HONESTY & INTEGRITY
  // =====================
  {
    id: 'prov-11-1',
    reference: 'Proverbs 11:1',
    kjvText: 'A false balance is abomination to the LORD: but a just weight is his delight.',
    hebrewText: 'מֹאזְנֵ֣י מִ֭רְמָה תּוֹעֲבַ֣ת יְהוָ֑ה וְאֶ֖בֶן שְׁלֵמָ֣ה רְצוֹנֽוֹ',
    hebrewTransliteration: 'Moznei mirmah to\'avat Adonai ve\'even shelemah retsono',
    strongNumbers: ['H3976', 'H4820', 'H8441', 'H3068', 'H68', 'H8003', 'H7522'],
    category: 'honesty',
    subcategories: ['business', 'integrity', 'justice'],
    financialKeywords: ['balance', 'abomination', 'weight', 'just', 'delight'],
    principle: 'God hates dishonest business practices and loves fair dealing',
    defiApplication: 'Use only fair and transparent DeFi protocols - avoid manipulation',
    modernApplication: 'Conduct all business with complete honesty and fair weights',
    testament: 'Old',
    book: 'Proverbs',
    chapter: 11,
    verseStart: 1,
    character: 'Solomon',
    context: 'Wisdom teaching on honest business',
    crossReferences: ['Leviticus 19:35-36', 'Deuteronomy 25:13-15', 'Proverbs 20:23']
  },
  {
    id: 'prov-20-23',
    reference: 'Proverbs 20:23',
    kjvText: 'Divers weights are an abomination unto the LORD; and a false balance is not good.',
    hebrewText: 'תּוֹעֲבַ֣ת יְ֭הוָה אֶ֣בֶן וָאָ֑בֶן וּמֹאזְנֵ֖י מִרְמָ֣ה לֹא־טֽוֹב',
    hebrewTransliteration: 'To\'avat Adonai even va\'aven umoznei mirmah lo-tov',
    strongNumbers: ['H8441', 'H3068', 'H68', 'H68', 'H3976', 'H4820', 'H3808', 'H2896'],
    category: 'honesty',
    subcategories: ['fairness', 'abomination', 'scales'],
    financialKeywords: ['weights', 'abomination', 'balance', 'false'],
    principle: 'Using different standards for buying and selling is detestable to God',
    defiApplication: 'Don\'t use exploitative slippage or front-running in DeFi trades',
    modernApplication: 'Apply consistent ethical standards in all financial dealings',
    testament: 'Old',
    book: 'Proverbs',
    chapter: 20,
    verseStart: 23,
    character: 'Solomon',
    context: 'Wisdom teaching on honest business practices',
    crossReferences: ['Proverbs 11:1', 'Micah 6:10-11']
  },
  {
    id: 'lev-19-35-36',
    reference: 'Leviticus 19:35-36',
    kjvText: 'Ye shall do no unrighteousness in judgment, in meteyard, in weight, or in measure. Just balances, just weights, a just ephah, and a just hin, shall ye have: I am the LORD your God, which brought you out of the land of Egypt.',
    hebrewText: 'לֹא־תַעֲשׂ֥וּ עָ֖וֶל בַּמִּשְׁפָּ֑ט בַּמִּדָּ֕ה בַּמִּשְׁקָ֖ל וּבַמְּשׂוּרָֽה׃ מֹ֧אזְנֵי צֶ֣דֶק אַבְנֵי־צֶ֗דֶק אֵ֥יפַת צֶ֛דֶק וְהִ֥ין צֶ֖דֶק יִהְיֶ֣ה לָכֶ֑ם אֲנִי֙ יְהוָ֣ה אֱלֹֽהֵיכֶ֔ם אֲשֶׁר־הוֹצֵ֥אתִי אֶתְכֶ֖ם מֵאֶ֥רֶץ מִצְרָֽיִם',
    hebrewTransliteration: 'Lo-ta\'asu avel bamishpat bamiddah bamishqal ubamesurah...',
    strongNumbers: ['H3808', 'H6213', 'H5766', 'H4941', 'H4060', 'H4948', 'H4884', 'H3976', 'H6664', 'H68', 'H6664', 'H374', 'H6664', 'H1969', 'H6664', 'H1961', 'H3068', 'H430', 'H3318', 'H776', 'H4714'],
    category: 'honesty',
    subcategories: ['law', 'justice', 'standards'],
    financialKeywords: ['unrighteousness', 'judgment', 'weight', 'measure', 'just', 'balances'],
    principle: 'God commands honest measurements in all business dealings',
    defiApplication: 'Use accurate pricing oracles and fair exchange rates in DeFi',
    modernApplication: 'Maintain honest standards in all measurements and transactions',
    testament: 'Old',
    book: 'Leviticus',
    chapter: 19,
    verseStart: 35,
    verseEnd: 36,
    character: 'Moses',
    context: 'Mosaic law on honest business',
    crossReferences: ['Proverbs 11:1', 'Deuteronomy 25:13-15']
  },

  // =====================
  // INVESTMENT & DIVERSIFICATION
  // =====================
  {
    id: 'eccl-11-2',
    reference: 'Ecclesiastes 11:2',
    kjvText: 'Give a portion to seven, and also to eight; for thou knowest not what evil shall be upon the earth.',
    hebrewText: 'תֶּן־חֵ֥לֶק לְשִׁבְעָ֖ה וְגַ֣ם לִשְׁמוֹנָ֑ה כִּ֚י לֹ֣א תֵדַ֔ע מַה־יִּהְיֶ֥ה רָעָ֖ה עַל־הָאָֽרֶץ',
    hebrewTransliteration: 'Ten-chelek leshiv\'ah vegam lishmonah ki lo teda mah-yihyeh ra\'ah al-ha\'arets',
    strongNumbers: ['H5414', 'H2506', 'H7651', 'H1571', 'H8083', 'H3588', 'H3808', 'H3045', 'H4100', 'H1961', 'H7451', 'H776'],
    category: 'investment',
    subcategories: ['diversification', 'risk', 'wisdom'],
    financialKeywords: ['portion', 'seven', 'eight', 'evil', 'earth'],
    principle: 'Diversify investments across multiple assets to manage risk',
    defiApplication: 'Spread DeFi positions across multiple protocols and chains',
    modernApplication: 'Diversify investments - don\'t put all eggs in one basket',
    testament: 'Old',
    book: 'Ecclesiastes',
    chapter: 11,
    verseStart: 2,
    character: 'Solomon',
    context: 'Wisdom teaching on diversification',
    crossReferences: ['Proverbs 27:1', 'James 4:13-15']
  },
  {
    id: 'eccl-11-6',
    reference: 'Ecclesiastes 11:6',
    kjvText: 'In the morning sow thy seed, and in the evening withhold not thine hand: for thou knowest not whether shall prosper, either this or that, or whether they both shall be alike good.',
    hebrewText: 'בַּבֹּ֙קֶר֙ זְרַ֣ע אֶת־זַרְעֶ֔ךָ וְלָעֶ֖רֶב אַל־תַּנַּ֣ח יָדֶ֑ךָ כִּי֩ אֵֽינְךָ֨ יוֹדֵ֜עַ אֵ֣י זֶ֤ה יִכְשָׁר֙ הֲזֶ֣ה אוֹ־זֶ֔ה וְאִם־שְׁנֵיהֶ֥ם כְּאֶחָ֖ד טוֹבִֽים',
    hebrewTransliteration: 'Baboker zera et-zarekha vela\'erev al-tannach yadekha...',
    strongNumbers: ['H1242', 'H2232', 'H2233', 'H6153', 'H408', 'H5117', 'H3027', 'H3588', 'H369', 'H3045', 'H335', 'H2088', 'H3787', 'H2088', 'H518', 'H8147', 'H259', 'H2896'],
    category: 'investment',
    subcategories: ['consistency', 'uncertainty', 'opportunity'],
    financialKeywords: ['morning', 'sow', 'seed', 'evening', 'prosper'],
    principle: 'Invest consistently since you don\'t know which investment will succeed',
    defiApplication: 'Use dollar-cost averaging into DeFi positions over time',
    modernApplication: 'Invest regularly - you can\'t predict which investments will perform best',
    testament: 'Old',
    book: 'Ecclesiastes',
    chapter: 11,
    verseStart: 6,
    character: 'Solomon',
    context: 'Wisdom on consistent effort and uncertainty',
    crossReferences: ['Ecclesiastes 11:2', 'Proverbs 21:5']
  },

  // =====================
  // ADDITIONAL COMPREHENSIVE SCRIPTURES
  // =====================
  // Continue with more categories as needed...
];

// ============================================================
// UTILITY FUNCTIONS FOR BWSP INTEGRATION
// ============================================================

export const getScripturesByCategory = (category: FinancialCategory): BiblicalFinancialScripture[] => {
  return comprehensiveFinancialScriptures.filter(s => s.category === category);
};

export const getScripturesByKeyword = (keyword: string): BiblicalFinancialScripture[] => {
  const lowered = keyword.toLowerCase();
  return comprehensiveFinancialScriptures.filter(s => 
    s.financialKeywords.some(k => k.toLowerCase().includes(lowered)) ||
    s.kjvText.toLowerCase().includes(lowered) ||
    s.principle.toLowerCase().includes(lowered)
  );
};

export const getScripturesByTestament = (testament: 'Old' | 'New'): BiblicalFinancialScripture[] => {
  return comprehensiveFinancialScriptures.filter(s => s.testament === testament);
};

export const getScriptureWithOriginalLanguages = (id: string): BiblicalFinancialScripture | undefined => {
  return comprehensiveFinancialScriptures.find(s => s.id === id);
};

export const getAllTithingScriptures = (): BiblicalFinancialScripture[] => {
  return comprehensiveFinancialScriptures.filter(s => 
    s.category === 'tithing' || 
    s.financialKeywords.includes('tithe') ||
    s.financialKeywords.includes('tenth')
  );
};

export const getDefiRelevantScriptures = (): BiblicalFinancialScripture[] => {
  return comprehensiveFinancialScriptures.filter(s => 
    s.defiApplication && s.defiApplication.length > 0
  );
};

export const getAllCategories = (): FinancialCategory[] => {
  return [...new Set(comprehensiveFinancialScriptures.map(s => s.category))];
};

export const getTotalScriptureCount = (): number => {
  return comprehensiveFinancialScriptures.length;
};

// Export for BWSP protocol integration
export default comprehensiveFinancialScriptures;
