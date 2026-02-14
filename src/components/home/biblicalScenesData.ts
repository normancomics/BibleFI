
export interface StrongsWord {
  original: string;
  transliteration: string;
  strongsNumber: string;
  definition: string;
  language: "hebrew" | "greek" | "aramaic";
}

export interface BiblicalScene {
  id: string;
  kjv: string;
  reference: string;
  hebrew: string;
  greek: string;
  aramaic: string;
  sound: string;
  strongs: StrongsWord[];
}

export const biblicalScenes: BiblicalScene[] = [
  {
    id: "scene1",
    kjv: "\"In the beginning God created the heaven and the earth.\"",
    reference: "Genesis 1:1",
    hebrew: "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ",
    greek: "Ἐν ἀρχῇ ἐποίησεν ὁ θεὸς τὸν οὐρανὸν καὶ τὴν γῆν",
    aramaic: "בְּקַדְמִין בְּרָא יְיָ יָת שְׁמַיָּא וְיָת אַרְעָא",
    sound: "powerup",
    strongs: [
      { original: "בְּרֵאשִׁית", transliteration: "bᵉrē'shîyth", strongsNumber: "H7225", definition: "The beginning, first, chief; the firstfruits of creation — related to the concept of firstfruits offerings (bikkurim)", language: "hebrew" },
      { original: "בָּרָא", transliteration: "bârâ'", strongsNumber: "H1254", definition: "To create, shape, form; God as the original Creator and Owner of all wealth and resources", language: "hebrew" },
      { original: "ἀρχῇ", transliteration: "archē", strongsNumber: "G746", definition: "Beginning, origin, first cause; the foundational principle from which all stewardship flows", language: "greek" },
    ]
  },
  {
    id: "scene2",
    kjv: "\"For the LORD giveth wisdom: out of his mouth cometh knowledge and understanding.\"",
    reference: "Proverbs 2:6",
    hebrew: "כִּי יְהוָה יִתֵּן חָכְמָה מִפִּיו דַּעַת וּתְבוּנָה",
    greek: "ὅτι κύριος δίδωσιν σοφίαν καὶ ἀπὸ προσώπου αὐτοῦ γνῶσις καὶ σύνεσις",
    aramaic: "אֲרֵי יְיָ יְהַב חָכְמְתָא מִפּוּמֵיהּ מַדְּעָא וְסוּכְלְתָנוּ",
    sound: "scroll",
    strongs: [
      { original: "חָכְמָה", transliteration: "chokmâh", strongsNumber: "H2451", definition: "Wisdom, skill, shrewdness; practical wisdom for financial decisions and righteous stewardship", language: "hebrew" },
      { original: "דַּעַת", transliteration: "da‛ath", strongsNumber: "H1847", definition: "Knowledge, discernment, understanding; the knowledge needed for wise investment", language: "hebrew" },
      { original: "σοφίαν", transliteration: "sophian", strongsNumber: "G4678", definition: "Wisdom, broad intelligence, practical skill in affairs; divine wisdom applied to financial stewardship", language: "greek" },
      { original: "σύνεσις", transliteration: "synesis", strongsNumber: "G4907", definition: "Understanding, insight, comprehension; the ability to discern wise from foolish investments", language: "greek" },
    ]
  },
  {
    id: "scene3",
    kjv: "\"Bring ye all the tithes into the storehouse, that there may be meat in mine house.\"",
    reference: "Malachi 3:10",
    hebrew: "הָבִיאוּ אֶת־כָּל־הַמַּעֲשֵׂר אֶל־בֵּית הָאוֹצָר",
    greek: "εἰσενέγκατε πάντα τὰ ἐπιδέκατα εἰς τὰ δοχεῖα",
    aramaic: "אַיתוֹ יָת כָּל מַעְשְׂרַיָּא לְבֵית גִּנְזַיָּא",
    sound: "coin",
    strongs: [
      { original: "מַּעֲשֵׂר", transliteration: "ma‛ăśêr", strongsNumber: "H4643", definition: "Tithe, tenth part; the foundational principle of giving 10% back to God as faithful stewardship", language: "hebrew" },
      { original: "אוֹצָר", transliteration: "'ôwtsâr", strongsNumber: "H214", definition: "Treasure, storehouse, treasury; the place of stored wealth — analogous to a liquidity pool or vault", language: "hebrew" },
      { original: "ἐπιδέκατα", transliteration: "epidekata", strongsNumber: "G1925", definition: "Tithes, tenth parts; systematic proportional giving as a financial discipline", language: "greek" },
      { original: "גִּנְזַיָּא", transliteration: "ginzayyā'", strongsNumber: "A1596", definition: "Treasury, storehouse (Aramaic); a secured repository of collective wealth", language: "aramaic" },
    ]
  },
  {
    id: "scene4",
    kjv: "\"A faithful man shall abound with blessings: but he that maketh haste to be rich shall not be innocent.\"",
    reference: "Proverbs 28:20",
    hebrew: "אִישׁ אֱמוּנוֹת רַב־בְּרָכוֹת וְאָץ לְהַעֲשִׁיר לֹא יִנָּקֶה",
    greek: "ἀνὴρ πιστὸς πολυευλογηθήσεται ὁ δὲ κακὸς οὐκ ἀτιμώρητος ἔσται",
    aramaic: "גַּבְרָא מְהֵימָנָא סַגִּי בִּרְכָן וּדְמִסְתַּרְהַב לְאִתְעַתָּרָא לָא יִזְכֵּי",
    sound: "select",
    strongs: [
      { original: "אֱמוּנוֹת", transliteration: "'ĕmûwnôth", strongsNumber: "H530", definition: "Faithfulness, fidelity, steadiness; long-term faithful stewardship vs. speculative haste", language: "hebrew" },
      { original: "בְּרָכוֹת", transliteration: "bᵉrâkôwth", strongsNumber: "H1293", definition: "Blessings, prosperity; the abundant returns that come from patient, faithful investment", language: "hebrew" },
      { original: "לְהַעֲשִׁיר", transliteration: "lᵉha‛ăshîyr", strongsNumber: "H6238", definition: "To become rich, to enrich; warns against rushing to wealth through risky schemes", language: "hebrew" },
      { original: "πιστὸς", transliteration: "pistos", strongsNumber: "G4103", definition: "Faithful, trustworthy, reliable; the character trait that yields compound blessings over time", language: "greek" },
    ]
  },
  {
    id: "scene5",
    kjv: "\"Wealth gotten by vanity shall be diminished: but he that gathereth by labour shall increase.\"",
    reference: "Proverbs 13:11",
    hebrew: "הוֹן מֵהֶבֶל יִמְעָט וְקֹבֵץ עַל־יָד יַרְבֶּה",
    greek: "ὕπαρξις ἐπισπουδαζομένη μετὰ ἀνομίας ἐλάσσων γίνεται",
    aramaic: "נִכְסִין דְּמִתְבַּהֲלִין יִזְעֲרוּן וּדְכָנֵשׁ עַל יְדָא יַסְגֵּי",
    sound: "coin",
    strongs: [
      { original: "הוֹן", transliteration: "hôwn", strongsNumber: "H1952", definition: "Wealth, riches, substance; material possessions and their proper acquisition", language: "hebrew" },
      { original: "הֶבֶל", transliteration: "hebel", strongsNumber: "H1892", definition: "Vanity, emptiness, breath; wealth gained through empty speculation or fraud diminishes", language: "hebrew" },
      { original: "קֹבֵץ", transliteration: "qôbêts", strongsNumber: "H6908", definition: "To gather, collect, assemble; patient accumulation through honest labor — dollar-cost averaging", language: "hebrew" },
      { original: "ὕπαρξις", transliteration: "hyparxis", strongsNumber: "G5223", definition: "Substance, goods, possessions; one's total financial holdings and assets", language: "greek" },
    ]
  },
  {
    id: "scene6",
    kjv: "\"Render therefore unto Caesar the things which are Caesar's; and unto God the things that are God's.\"",
    reference: "Matthew 22:21",
    hebrew: "תְּנוּ לְקֵיסָר אֶת אֲשֶׁר לְקֵיסָר וְלֵאלֹהִים אֶת אֲשֶׁר לֵאלֹהִים",
    greek: "ἀπόδοτε οὖν τὰ Καίσαρος Καίσαρι καὶ τὰ τοῦ θεοῦ τῷ θεῷ",
    aramaic: "הַבוּ הָכִיל דְּקֵיסָר לְקֵיסָר וְדַאלָהָא לַאלָהָא",
    sound: "powerup",
    strongs: [
      { original: "ἀπόδοτε", transliteration: "apodote", strongsNumber: "G591", definition: "To give back, return, render; pay what is owed — the principle of tax compliance", language: "greek" },
      { original: "Καίσαρος", transliteration: "Kaisaros", strongsNumber: "G2541", definition: "Caesar; the governing authority to whom taxes and tribute are rightfully due", language: "greek" },
      { original: "קֵיסָר", transliteration: "qêysâr", strongsNumber: "A7011", definition: "Caesar, emperor (Aramaic); civil authority — 'render unto Caesar' as the basis for ethical tax payment", language: "aramaic" },
    ]
  },
  {
    id: "scene7",
    kjv: "\"Behold, I have given thee a wise and an understanding heart; so that there was none like thee before thee, neither after thee shall any arise like unto thee.\"",
    reference: "1 Kings 3:12",
    hebrew: "הִנֵּה נָתַתִּי לְךָ לֵב חָכָם וְנָבוֹן אֲשֶׁר כָּמוֹךָ לֹא הָיָה לְפָנֶיךָ וְאַחֲרֶיךָ לֹא יָקוּם כָּמוֹךָ",
    greek: "ἰδοὺ δέδωκά σοι καρδίαν φρονίμην καὶ σοφήν ὡς σὺ οὐ γέγονεν ἔμπροσθέν σου καὶ μετὰ σὲ οὐκ ἀναστήσεται ὅμοιός σοι",
    aramaic: "הָא יְהַבִית לָךְ לִבָּא חַכִּימָא וּסָכְלְתָנָא דִּכְוָתָךְ לָא הֲוָה קֳדָמָךְ וּבָתְרָךְ לָא יְקוּם כְּוָתָךְ",
    sound: "scroll",
    strongs: [
      { original: "חָכָם", transliteration: "châkâm", strongsNumber: "H2450", definition: "Wise, skillful, learned; Solomon's divine gift of financial and judicial wisdom", language: "hebrew" },
      { original: "נָבוֹן", transliteration: "nâbôwn", strongsNumber: "H995", definition: "Understanding, discerning, intelligent; the ability to distinguish between wise and foolish financial decisions", language: "hebrew" },
      { original: "φρονίμην", transliteration: "phronimēn", strongsNumber: "G5429", definition: "Prudent, wise, shrewd; practical intelligence applied to resource management and wealth", language: "greek" },
      { original: "חַכִּימָא", transliteration: "ḥakkîmā'", strongsNumber: "A2445", definition: "Wise one (Aramaic); divinely granted wisdom for governance and economic stewardship", language: "aramaic" },
    ]
  },
  {
    id: "scene8",
    kjv: "\"And let them gather all the food of those good years that come, and lay up corn under the hand of Pharaoh, and let them keep food in the cities.\"",
    reference: "Genesis 41:35-36",
    hebrew: "וְיִקְבְּצוּ אֶת־כָּל־אֹכֶל הַשָּׁנִים הַטֹּבוֹת הַבָּאֹת וְיִצְבְּרוּ בָר תַּחַת יַד פַּרְעֹה",
    greek: "καὶ συναγαγέτωσαν πάντα τὰ βρώματα τῶν ἐτῶν τῶν ἀγαθῶν τῶν ἐρχομένων καὶ συναχθήτω σῖτος ὑπὸ χεῖρα Φαραω",
    aramaic: "וְיִכְנְשׁוּן יָת כָּל עִיבוּרָא דִּשְׁנַיָּא טָבָתָא דְּאָתְיָן וְיִצְבְּרוּן עִיבוּרָא תְּחוֹת יְדָא דְּפַרְעֹה",
    sound: "coin",
    strongs: [
      { original: "יִקְבְּצוּ", transliteration: "yiqbᵉtsûw", strongsNumber: "H6908", definition: "To gather, collect; Joseph's strategy of systematic accumulation during abundance — reserve building", language: "hebrew" },
      { original: "יִצְבְּרוּ", transliteration: "yitsbᵉrûw", strongsNumber: "H6651", definition: "To heap up, store, stockpile; creating strategic reserves for economic downturns — yield farming reserves", language: "hebrew" },
      { original: "בָר", transliteration: "bar", strongsNumber: "H1250", definition: "Grain, corn, wheat; the primary commodity and store of value in the ancient economy — stablecoins", language: "hebrew" },
      { original: "σῖτος", transliteration: "sitos", strongsNumber: "G4621", definition: "Wheat, grain, food supply; stored value and the foundation of economic security", language: "greek" },
    ]
  },
  {
    id: "scene9",
    kjv: "\"Well done, thou good and faithful servant: thou hast been faithful over a few things, I will make thee ruler over many things.\"",
    reference: "Matthew 25:21",
    hebrew: "יָפֶה עָשִׂיתָ עֶבֶד טוֹב וְנֶאֱמָן עַל מְעַט הָיִיתָ נֶאֱמָן עַל הַרְבֵּה אֲשִׂימְךָ",
    greek: "εὖ δοῦλε ἀγαθὲ καὶ πιστέ ἐπὶ ὀλίγα ἦς πιστός ἐπὶ πολλῶν σε καταστήσω",
    aramaic: "יָאוּת עַבְדָּא טָבָא וּמְהֵימָנָא עַל קַלִּיל הֲוַיתְּ מְהֵימָן עַל סַגִּי אֲמַנִּנָךְ",
    sound: "success",
    strongs: [
      { original: "δοῦλε", transliteration: "doule", strongsNumber: "G1401", definition: "Servant, bondservant; a faithful steward entrusted with the master's capital (talents)", language: "greek" },
      { original: "πιστέ", transliteration: "piste", strongsNumber: "G4103", definition: "Faithful, trustworthy; the key trait rewarded with greater responsibility and yield", language: "greek" },
      { original: "καταστήσω", transliteration: "katastēsō", strongsNumber: "G2525", definition: "To appoint, put in charge, make ruler; promotion through proven faithful stewardship of assets", language: "greek" },
      { original: "מְהֵימָנָא", transliteration: "mᵉhêymānā'", strongsNumber: "A4101", definition: "Faithful, trustworthy (Aramaic); reliable stewardship that multiplies entrusted capital", language: "aramaic" },
    ]
  },
  {
    id: "scene10",
    kjv: "\"But he that received seed into the good ground is he that heareth the word, and understandeth it; which also beareth fruit, and bringeth forth, some an hundredfold, some sixty, some thirty.\"",
    reference: "Matthew 13:23",
    hebrew: "וְהַנִּזְרָע עַל הָאֲדָמָה הַטּוֹבָה הוּא הַשֹּׁמֵעַ אֶת הַדָּבָר וּמֵבִין אֹתוֹ וְהוּא עֹשֶׂה פְרִי",
    greek: "ὁ δὲ ἐπὶ τὴν καλὴν γῆν σπαρείς οὗτός ἐστιν ὁ τὸν λόγον ἀκούων καὶ συνιείς ὃς δὴ καρποφορεῖ",
    aramaic: "וְהוּ דְּאִתְזְרַע בְּאַרְעָא טָבְתָא הוּ דְּשָׁמַע מִלְּתָא וּמִסְתַּכַּל בָּהּ וְעָבֵד פֵּירֵי",
    sound: "scroll",
    strongs: [
      { original: "σπαρείς", transliteration: "spareis", strongsNumber: "G4687", definition: "To sow seed; investing capital into productive ground — yield generation from wise allocation", language: "greek" },
      { original: "καρποφορεῖ", transliteration: "karpophorei", strongsNumber: "G2592", definition: "To bear fruit, be productive; generating returns — 30x, 60x, 100x yield on invested capital", language: "greek" },
      { original: "פְרִי", transliteration: "pᵉrîy", strongsNumber: "H6529", definition: "Fruit, produce, reward; the tangible returns from well-placed investment and faithful stewardship", language: "hebrew" },
    ]
  },
  {
    id: "scene11",
    kjv: "\"He that is faithful in that which is least is faithful also in much: and he that is unjust in the least is unjust also in much.\"",
    reference: "Luke 16:10",
    hebrew: "הַנֶּאֱמָן בִּמְעַט גַּם בְּהַרְבֵּה נֶאֱמָן וְהַמְעַוֵּל בִּמְעַט גַּם בְּהַרְבֵּה מְעַוֵּל",
    greek: "ὁ πιστὸς ἐν ἐλαχίστῳ καὶ ἐν πολλῷ πιστός ἐστιν καὶ ὁ ἐν ἐλαχίστῳ ἄδικος καὶ ἐν πολλῷ ἄδικός ἐστιν",
    aramaic: "מַן דִּמְהֵימָן בִּקְלִיל אָף בְּסַגִּי מְהֵימָן וּמַן דְּעַוָּל בִּקְלִיל אָף בְּסַגִּי עַוָּל",
    sound: "coin",
    strongs: [
      { original: "ἐλαχίστῳ", transliteration: "elachistō", strongsNumber: "G1646", definition: "Least, smallest, very little; faithfulness with small amounts proves readiness for larger sums", language: "greek" },
      { original: "ἄδικος", transliteration: "adikos", strongsNumber: "G94", definition: "Unjust, unrighteous, dishonest; financial misconduct with small amounts predicts larger fraud", language: "greek" },
      { original: "עַוָּל", transliteration: "‛awwāl", strongsNumber: "A5765", definition: "Unjust, perverse (Aramaic); one who deals dishonestly in financial matters regardless of scale", language: "aramaic" },
    ]
  },
  {
    id: "scene12",
    kjv: "\"Give a portion to seven, and also to eight; for thou knowest not what evil shall be upon the earth.\"",
    reference: "Ecclesiastes 11:2",
    hebrew: "תֶּן חֵלֶק לְשִׁבְעָה וְגַם לִשְׁמוֹנָה כִּי לֹא תֵדַע מַה יִּהְיֶה רָעָה עַל הָאָרֶץ",
    greek: "δὸς μερίδα τοῖς ἑπτὰ καί γε τοῖς ὀκτώ ὅτι οὐ γινώσκεις τί ἔσται πονηρὸν ἐπὶ τὴν γῆν",
    aramaic: "הַב חוּלָקָא לְשַׁבְעָא וְאַף לִתְמָנְיָא אֲרֵי לָא יָדַע אַתְּ מָה יְהֵי בִישׁ עַל אַרְעָא",
    sound: "powerup",
    strongs: [
      { original: "חֵלֶק", transliteration: "chêleq", strongsNumber: "H2506", definition: "Portion, share, allotment; dividing investments across multiple assets — diversification strategy", language: "hebrew" },
      { original: "שִׁבְעָה", transliteration: "shib‛âh", strongsNumber: "H7651", definition: "Seven; the number of completeness — spread risk across at least 7 different positions", language: "hebrew" },
      { original: "שְׁמוֹנָה", transliteration: "shᵉmôwnâh", strongsNumber: "H8083", definition: "Eight; going beyond completeness — over-diversify because the future is uncertain", language: "hebrew" },
      { original: "μερίδα", transliteration: "merida", strongsNumber: "G3310", definition: "Portion, part, share; allocated division of capital across diverse instruments", language: "greek" },
    ]
  },
  {
    id: "scene13",
    kjv: "\"The borrower is servant to the lender.\"",
    reference: "Proverbs 22:7",
    hebrew: "עָשִׁיר בְּרָשִׁים יִמְשׁוֹל וְעֶבֶד לֹוֶה לְאִישׁ מַלְוֶה",
    greek: "πλούσιοι πτωχῶν ἄρξουσιν καὶ οἰκέτης ἰδίῳ δεσπότῃ δανιεῖ",
    aramaic: "עַתִּירָא בְמִסְכְּנַיָּא שַׁלִּיט וְעַבְדָּא דְּלָוֵי לְגַבְרָא דְּמוֹזֵיף",
    sound: "select",
    strongs: [
      { original: "עָשִׁיר", transliteration: "‛âshîyr", strongsNumber: "H6223", definition: "Rich, wealthy; those with capital have power over those in debt — be a lender not a borrower", language: "hebrew" },
      { original: "לֹוֶה", transliteration: "lâvâh", strongsNumber: "H3867", definition: "To borrow, be in debt; entering into obligation that creates servitude — leverage risk warning", language: "hebrew" },
      { original: "מַלְוֶה", transliteration: "malveh", strongsNumber: "H3867", definition: "Lender, creditor; the position of financial power — in DeFi, the liquidity provider", language: "hebrew" },
      { original: "δανιεῖ", transliteration: "daniei", strongsNumber: "G1155", definition: "To lend, make a loan; providing capital at interest — the lending protocol principle", language: "greek" },
    ]
  },
  {
    id: "scene14",
    kjv: "\"Be thou diligent to know the state of thy flocks, and look well to thy herds.\"",
    reference: "Proverbs 27:23",
    hebrew: "יָדֹעַ תֵּדַע פְּנֵי צֹאנֶךָ שִׁית לִבְּךָ לַעֲדָרִים",
    greek: "γνωστῶς ἐπιγνώσῃ ψυχὰς ποιμνίου σου καὶ ἐπιστήσεις καρδίαν σου ἀγέλαις",
    aramaic: "מִנְדַע תִּנְדַע אַפֵּי עָנָךְ שַׁוִּי לִבָּךְ לְעֶדְרָיָא",
    sound: "scroll",
    strongs: [
      { original: "יָדֹעַ", transliteration: "yâdôa‛", strongsNumber: "H3045", definition: "To know, perceive, discern; active portfolio monitoring — know the state of your assets", language: "hebrew" },
      { original: "צֹאנֶךָ", transliteration: "tsô'nekhâ", strongsNumber: "H6629", definition: "Flock, sheep; your assets, investments, portfolio — what you are responsible to steward", language: "hebrew" },
      { original: "ἐπιγνώσῃ", transliteration: "epignōsē", strongsNumber: "G1921", definition: "To know fully, recognize thoroughly; deep due diligence on every investment position", language: "greek" },
    ]
  },
  {
    id: "scene15",
    kjv: "\"Owe no man any thing, but to love one another: for he that loveth another hath fulfilled the law.\"",
    reference: "Romans 13:8",
    hebrew: "אַל תִּהְיוּ חַיָּבִים לְאִישׁ דָּבָר בִּלְתִּי אִם לְאַהֲבָה אִישׁ אֶת רֵעֵהוּ",
    greek: "μηδενὶ μηδὲν ὀφείλετε εἰ μὴ τὸ ἀλλήλους ἀγαπᾶν ὁ γὰρ ἀγαπῶν τὸν ἕτερον νόμον πεπλήρωκεν",
    aramaic: "לָא תֶהְוֹן חַיָּבִין לְאֱנָשׁ מִדֶּם אֶלָּא דִּתְרַחְמוּן חַד לְחַד",
    sound: "coin",
    strongs: [
      { original: "ὀφείλετε", transliteration: "opheilete", strongsNumber: "G3784", definition: "To owe, be indebted; the imperative to live debt-free — minimize leverage and obligations", language: "greek" },
      { original: "חַיָּבִים", transliteration: "ḥayyâbîm", strongsNumber: "H2326", definition: "Debtors, those obligated; avoid carrying debt burdens that compromise financial freedom", language: "hebrew" },
      { original: "ἀγαπᾶν", transliteration: "agapan", strongsNumber: "G25", definition: "To love sacrificially; the only 'debt' a believer should carry — generous love toward others", language: "greek" },
    ]
  },
  {
    id: "scene16",
    kjv: "\"The plans of the diligent lead surely to abundance, but everyone who is hasty comes only to poverty.\"",
    reference: "Proverbs 21:5",
    hebrew: "מַחְשְׁבוֹת חָרוּץ אַךְ לְמוֹתָר וְכָל אָץ אַךְ לְמַחְסוֹר",
    greek: "λογισμοὶ ἐπιμελοῦς πρὸς πλεονασμόν καὶ πᾶς ὁ σπεύδων πρὸς ἐλάττωμα",
    aramaic: "מַחְשְׁבַת חָרוּצָא בְּרַם לְיוּתְרָנָא וְכָל דִּמְבַהֵל בְּרַם לְחַסְרוּנָא",
    sound: "powerup",
    strongs: [
      { original: "חָרוּץ", transliteration: "chârûwts", strongsNumber: "H2742", definition: "Diligent, sharp, decisive; careful planning and disciplined execution in financial strategy", language: "hebrew" },
      { original: "מוֹתָר", transliteration: "môwthâr", strongsNumber: "H4195", definition: "Abundance, profit, surplus; the natural result of diligent, patient financial planning", language: "hebrew" },
      { original: "מַחְסוֹר", transliteration: "machsôwr", strongsNumber: "H4270", definition: "Want, poverty, lack; the inevitable result of hasty, unplanned financial decisions", language: "hebrew" },
      { original: "πλεονασμόν", transliteration: "pleonasmon", strongsNumber: "G4128", definition: "Abundance, surplus, increase; wealth that grows through methodical, diligent stewardship", language: "greek" },
    ]
  },
  {
    id: "scene17",
    kjv: "\"Honour the LORD with thy substance, and with the firstfruits of all thine increase.\"",
    reference: "Proverbs 3:9",
    hebrew: "כַּבֵּד אֶת יְהוָה מֵהוֹנֶךָ וּמֵרֵאשִׁית כָּל תְּבוּאָתֶךָ",
    greek: "τίμα τὸν κύριον ἀπὸ σῶν δικαίων πόνων καὶ ἀπάρχου αὐτῷ ἀπὸ σῶν καρπῶν",
    aramaic: "יַקַּר יָת יְיָ מִנִּכְסָךְ וּמֵרֵאשִׁית כָּל עַלְלָתָךְ",
    sound: "select",
    strongs: [
      { original: "הוֹנֶךָ", transliteration: "hôwnekhâ", strongsNumber: "H1952", definition: "Thy wealth, substance, possessions; all material resources belong to God — honor Him first", language: "hebrew" },
      { original: "רֵאשִׁית", transliteration: "rê'shîyth", strongsNumber: "H7225", definition: "Firstfruits, beginning, best; give the first portion of income to God before other allocations", language: "hebrew" },
      { original: "תְּבוּאָתֶךָ", transliteration: "tᵉbûw'âthekhâ", strongsNumber: "H8393", definition: "Increase, revenue, produce; all gains and yield from labor and investment", language: "hebrew" },
      { original: "ἀπάρχου", transliteration: "aparchou", strongsNumber: "G536", definition: "Firstfruits; the initial yield offered to God — auto-allocate tithes from DeFi returns", language: "greek" },
    ]
  },
  {
    id: "scene18",
    kjv: "\"Cast thy bread upon the waters: for thou shalt find it after many days.\"",
    reference: "Ecclesiastes 11:1",
    hebrew: "שַׁלַּח לַחְמְךָ עַל פְּנֵי הַמָּיִם כִּי בְרֹב הַיָּמִים תִּמְצָאֶנּוּ",
    greek: "ἀπόστειλον τὸν ἄρτον σου ἐπὶ πρόσωπον τοῦ ὕδατος ὅτι ἐν πλήθει τῶν ἡμερῶν εὑρήσεις αὐτόν",
    aramaic: "שַׁדַּר לַחְמָךְ עַל אַפֵּי מַיָּא אֲרֵי בְּסוֹגָאַת יוֹמַיָּא תַּשְׁכְּחִנֵּיהּ",
    sound: "coin",
    strongs: [
      { original: "שַׁלַּח", transliteration: "shâlach", strongsNumber: "H7971", definition: "To send forth, release; deploying capital into ventures with faith in long-term returns", language: "hebrew" },
      { original: "לַחְמְךָ", transliteration: "lachmᵉkhâ", strongsNumber: "H3899", definition: "Thy bread, food, sustenance; your capital and resources sent into productive use", language: "hebrew" },
      { original: "מַיִם", transliteration: "mayim", strongsNumber: "H4325", definition: "Waters; uncertain, fluid markets — invest despite uncertainty, trusting in God's provision", language: "hebrew" },
      { original: "ἄρτον", transliteration: "arton", strongsNumber: "G740", definition: "Bread, loaf; capital deployed into the world — long-term investment with patient expectation", language: "greek" },
    ]
  }
];
