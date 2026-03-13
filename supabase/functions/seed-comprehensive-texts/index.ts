import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

/**
 * Seeds comprehensive_biblical_texts with original Hebrew/Greek texts
 * and Strong's numbers for all 108 financial wisdom verses.
 *
 * "The words of the LORD are pure words: as silver tried in a furnace
 *  of earth, purified seven times." — Psalm 12:6
 */

// Parse "Book Chapter:Verse" reference into parts
function parseReference(ref: string): { book: string; chapter: number; verse: number } | null {
  // Handle ranges like "Proverbs 6:1-2" → take first verse
  const m = ref.match(/^(.+?)\s+(\d+):(\d+)/);
  if (!m) return null;
  return { book: m[1], chapter: parseInt(m[2]), verse: parseInt(m[3]) };
}

// Comprehensive original language data for 108 financial wisdom verses
// Sources: Open Scriptures Hebrew Bible (OSHB), MorphGNT (SBLGNT), Strong's Concordance
// Hebrew (OT) and Greek (NT) with key Strong's numbers for financial terms
function getOriginalLanguageData(): Record<string, {
  hebrew_text?: string; greek_text?: string; aramaic_text?: string;
  strong_numbers: string[]; original_words: { word: string; strongs: string; meaning: string; lang: string }[];
  financial_keywords: string[]; financial_relevance: number;
}> {
  return {
    // ═══════════════════════════════════════════════════════
    // TITHING & GIVING
    // ═══════════════════════════════════════════════════════
    'Malachi 3:10': {
      hebrew_text: 'הָבִ֨יאוּ אֶת־כׇּל־הַֽמַּעֲשֵׂ֜ר אֶל־בֵּ֣ית הָאוֹצָ֗ר וִיהִ֥י טֶ֙רֶף֙ בְּבֵיתִ֔י וּבְחָנ֤וּנִי נָא֙ בָּזֹ֔את אָמַ֖ר יְהוָ֣ה צְבָא֑וֹת אִם־לֹ֧א אֶפְתַּ֣ח לָכֶ֗ם אֵ֚ת אֲרֻבּ֣וֹת הַשָּׁמַ֔יִם וַהֲרִיקֹתִ֥י לָכֶ֛ם בְּרָכָ֖ה עַד־בְּלִי־דָֽי',
      strong_numbers: ['H935', 'H3605', 'H4643', 'H1004', 'H214', 'H2964', 'H974', 'H6605', 'H699', 'H8064', 'H7324', 'H1293'],
      original_words: [
        { word: 'מַעֲשֵׂר', strongs: 'H4643', meaning: 'tithe, tenth part', lang: 'hebrew' },
        { word: 'אוֹצָר', strongs: 'H214', meaning: 'treasury, storehouse', lang: 'hebrew' },
        { word: 'בְּרָכָה', strongs: 'H1293', meaning: 'blessing, prosperity', lang: 'hebrew' },
      ],
      financial_keywords: ['tithe', 'storehouse', 'blessing', 'treasury'],
      financial_relevance: 10,
    },
    'Genesis 14:20': {
      hebrew_text: 'וּבָר֤וּךְ אֵל֙ עֶלְי֔וֹן אֲשֶׁר־מִגֵּ֥ן צָרֶ֖יךָ בְּיָדֶ֑ךָ וַיִּתֶּן־ל֥וֹ מַעֲשֵׂ֖ר מִכֹּֽל',
      strong_numbers: ['H1288', 'H410', 'H5945', 'H4042', 'H6862', 'H3027', 'H5414', 'H4643', 'H3605'],
      original_words: [
        { word: 'מַעֲשֵׂר', strongs: 'H4643', meaning: 'tithe, tenth part', lang: 'hebrew' },
        { word: 'עֶלְיוֹן', strongs: 'H5945', meaning: 'Most High', lang: 'hebrew' },
      ],
      financial_keywords: ['tithe', 'firstfruits', 'giving'],
      financial_relevance: 10,
    },
    'Proverbs 3:9': {
      hebrew_text: 'כַּבֵּ֣ד אֶת־יְ֭הוָה מֵהוֹנֶ֑ךָ וּ֝מֵרֵאשִׁ֗ית כׇּל־תְּבוּאָתֶֽךָ',
      strong_numbers: ['H3513', 'H3068', 'H1952', 'H7225', 'H3605', 'H8393'],
      original_words: [
        { word: 'הוֹן', strongs: 'H1952', meaning: 'wealth, substance', lang: 'hebrew' },
        { word: 'רֵאשִׁית', strongs: 'H7225', meaning: 'firstfruits, beginning', lang: 'hebrew' },
        { word: 'תְּבוּאָה', strongs: 'H8393', meaning: 'income, produce, revenue', lang: 'hebrew' },
      ],
      financial_keywords: ['wealth', 'firstfruits', 'income', 'honor'],
      financial_relevance: 10,
    },
    '2 Corinthians 9:7': {
      greek_text: 'ἕκαστος καθὼς προῄρηται τῇ καρδίᾳ, μὴ ἐκ λύπης ἢ ἐξ ἀνάγκης· ἱλαρὸν γὰρ δότην ἀγαπᾷ ὁ θεός.',
      strong_numbers: ['G1538', 'G2531', 'G4255', 'G2588', 'G3077', 'G318', 'G2431', 'G1395', 'G25', 'G2316'],
      original_words: [
        { word: 'δότης', strongs: 'G1395', meaning: 'giver', lang: 'greek' },
        { word: 'ἱλαρός', strongs: 'G2431', meaning: 'cheerful, joyous', lang: 'greek' },
      ],
      financial_keywords: ['giver', 'cheerful', 'generosity', 'offering'],
      financial_relevance: 9,
    },
    'Luke 6:38': {
      greek_text: 'δίδοτε, καὶ δοθήσεται ὑμῖν· μέτρον καλὸν πεπιεσμένον σεσαλευμένον ὑπερεκχυννόμενον δώσουσιν εἰς τὸν κόλπον ὑμῶν· ᾧ γὰρ μέτρῳ μετρεῖτε ἀντιμετρηθήσεται ὑμῖν.',
      strong_numbers: ['G1325', 'G3358', 'G2570', 'G4085', 'G4531', 'G5240', 'G2859', 'G488'],
      original_words: [
        { word: 'δίδοτε', strongs: 'G1325', meaning: 'give', lang: 'greek' },
        { word: 'μέτρον', strongs: 'G3358', meaning: 'measure', lang: 'greek' },
      ],
      financial_keywords: ['give', 'measure', 'return', 'abundance'],
      financial_relevance: 9,
    },
    'Leviticus 27:30': {
      hebrew_text: 'וְכׇל־מַעְשַׂ֨ר הָאָ֜רֶץ מִזֶּ֤רַע הָאָ֙רֶץ֙ מִפְּרִ֣י הָעֵ֔ץ לַיהוָ֖ה ה֑וּא קֹ֖דֶשׁ לַיהוָֽה',
      strong_numbers: ['H3605', 'H4643', 'H776', 'H2233', 'H6529', 'H6086', 'H3068', 'H6944'],
      original_words: [
        { word: 'מַעְשַׂר', strongs: 'H4643', meaning: 'tithe, tenth part', lang: 'hebrew' },
        { word: 'קֹדֶשׁ', strongs: 'H6944', meaning: 'holy, set apart', lang: 'hebrew' },
      ],
      financial_keywords: ['tithe', 'holy', 'produce', 'dedicated'],
      financial_relevance: 10,
    },
    'Luke 21:1-3': {
      greek_text: 'Ἀναβλέψας δὲ εἶδεν τοὺς βάλλοντας εἰς τὸ γαζοφυλάκιον τὰ δῶρα αὐτῶν πλουσίους. εἶδεν δέ τινα χήραν πενιχρὰν βάλλουσαν ἐκεῖ λεπτὰ δύο',
      strong_numbers: ['G308', 'G906', 'G1049', 'G1435', 'G4145', 'G5503', 'G3016'],
      original_words: [
        { word: 'γαζοφυλάκιον', strongs: 'G1049', meaning: 'treasury, offering box', lang: 'greek' },
        { word: 'λεπτόν', strongs: 'G3016', meaning: 'small coin, mite', lang: 'greek' },
        { word: 'δῶρον', strongs: 'G1435', meaning: 'gift, offering', lang: 'greek' },
      ],
      financial_keywords: ['treasury', 'offering', 'widow', 'sacrifice', 'coin'],
      financial_relevance: 9,
    },
    'Proverbs 22:9': {
      hebrew_text: 'ט֣וֹב עַ֭יִן ה֣וּא יְבֹרָ֑ךְ כִּֽי־נָתַ֖ן מִלַּחְמ֣וֹ לַדָּֽל',
      strong_numbers: ['H2896', 'H5869', 'H1288', 'H5414', 'H3899', 'H1800'],
      original_words: [
        { word: 'טוֹב עַיִן', strongs: 'H2896+H5869', meaning: 'generous (good eye)', lang: 'hebrew' },
        { word: 'דָּל', strongs: 'H1800', meaning: 'poor, needy', lang: 'hebrew' },
      ],
      financial_keywords: ['generous', 'blessing', 'poor', 'sharing'],
      financial_relevance: 8,
    },
    'Malachi 3:8': {
      hebrew_text: 'הֲיִקְבַּ֨ע אָדָ֜ם אֱלֹהִ֗ים כִּ֤י אַתֶּם֙ קֹבְעִ֣ים אֹתִ֔י וַאֲמַרְתֶּ֖ם בַּמֶּ֣ה קְבַעֲנ֑וּךָ הַֽמַּעֲשֵׂ֖ר וְהַתְּרוּמָֽה',
      strong_numbers: ['H6906', 'H120', 'H430', 'H4643', 'H8641'],
      original_words: [
        { word: 'קָבַע', strongs: 'H6906', meaning: 'to rob, defraud', lang: 'hebrew' },
        { word: 'מַעֲשֵׂר', strongs: 'H4643', meaning: 'tithe', lang: 'hebrew' },
        { word: 'תְּרוּמָה', strongs: 'H8641', meaning: 'offering, contribution', lang: 'hebrew' },
      ],
      financial_keywords: ['rob', 'tithe', 'offering', 'fraud'],
      financial_relevance: 10,
    },
    '1 Corinthians 16:2': {
      greek_text: 'κατὰ μίαν σαββάτου ἕκαστος ὑμῶν παρ᾽ ἑαυτῷ τιθέτω θησαυρίζων ὅ τι ἐὰν εὐοδῶται',
      strong_numbers: ['G2596', 'G3391', 'G4521', 'G1538', 'G5087', 'G2343', 'G2137'],
      original_words: [
        { word: 'θησαυρίζω', strongs: 'G2343', meaning: 'to store up, save', lang: 'greek' },
        { word: 'εὐοδόω', strongs: 'G2137', meaning: 'to prosper, succeed', lang: 'greek' },
      ],
      financial_keywords: ['save', 'store', 'weekly', 'prosper'],
      financial_relevance: 9,
    },
    '2 Corinthians 9:6': {
      greek_text: 'Τοῦτο δέ, ὁ σπείρων φειδομένως φειδομένως καὶ θερίσει, καὶ ὁ σπείρων ἐπ᾽ εὐλογίαις ἐπ᾽ εὐλογίαις καὶ θερίσει.',
      strong_numbers: ['G4687', 'G5340', 'G2325', 'G2129'],
      original_words: [
        { word: 'σπείρω', strongs: 'G4687', meaning: 'to sow', lang: 'greek' },
        { word: 'θερίζω', strongs: 'G2325', meaning: 'to reap, harvest', lang: 'greek' },
        { word: 'εὐλογία', strongs: 'G2129', meaning: 'blessing, bounty', lang: 'greek' },
      ],
      financial_keywords: ['sow', 'reap', 'blessing', 'generosity'],
      financial_relevance: 9,
    },
    'Acts 20:35': {
      greek_text: 'μακάριόν ἐστιν μᾶλλον διδόναι ἢ λαμβάνειν',
      strong_numbers: ['G3107', 'G1325', 'G2228', 'G2983'],
      original_words: [
        { word: 'μακάριος', strongs: 'G3107', meaning: 'blessed, happy', lang: 'greek' },
        { word: 'διδόναι', strongs: 'G1325', meaning: 'to give', lang: 'greek' },
        { word: 'λαμβάνειν', strongs: 'G2983', meaning: 'to receive', lang: 'greek' },
      ],
      financial_keywords: ['give', 'receive', 'blessed'],
      financial_relevance: 8,
    },

    // ═══════════════════════════════════════════════════════
    // DEBT & BORROWING
    // ═══════════════════════════════════════════════════════
    'Proverbs 22:7': {
      hebrew_text: 'עָ֭שִׁיר בְּרָשִׁ֣ים יִמְשׁ֑וֹל וְעֶ֥בֶד לֹ֝וֶ֗ה לְאִ֣ישׁ מַלְוֶֽה',
      strong_numbers: ['H6223', 'H7326', 'H4910', 'H5650', 'H3867', 'H376', 'H3867'],
      original_words: [
        { word: 'עָשִׁיר', strongs: 'H6223', meaning: 'rich, wealthy', lang: 'hebrew' },
        { word: 'רָשׁ', strongs: 'H7326', meaning: 'poor, needy', lang: 'hebrew' },
        { word: 'לֹוֶה', strongs: 'H3867', meaning: 'borrower', lang: 'hebrew' },
        { word: 'מַלְוֶה', strongs: 'H3867', meaning: 'lender', lang: 'hebrew' },
        { word: 'עֶבֶד', strongs: 'H5650', meaning: 'servant, slave', lang: 'hebrew' },
      ],
      financial_keywords: ['rich', 'poor', 'borrower', 'lender', 'servant', 'debt'],
      financial_relevance: 10,
    },
    'Romans 13:8': {
      greek_text: 'Μηδενὶ μηδὲν ὀφείλετε εἰ μὴ τὸ ἀλλήλους ἀγαπᾶν· ὁ γὰρ ἀγαπῶν τὸν ἕτερον νόμον πεπλήρωκεν.',
      strong_numbers: ['G3367', 'G3784', 'G1508', 'G240', 'G25', 'G2087', 'G3551', 'G4137'],
      original_words: [
        { word: 'ὀφείλετε', strongs: 'G3784', meaning: 'to owe, be indebted', lang: 'greek' },
        { word: 'ἀγαπᾶν', strongs: 'G25', meaning: 'to love', lang: 'greek' },
      ],
      financial_keywords: ['owe', 'debt', 'love', 'fulfill'],
      financial_relevance: 9,
    },
    'Deuteronomy 15:1': {
      hebrew_text: 'מִקֵּ֥ץ שֶֽׁבַע־שָׁנִ֖ים תַּעֲשֶׂ֥ה שְׁמִטָּֽה',
      strong_numbers: ['H7093', 'H7651', 'H8141', 'H6213', 'H8059'],
      original_words: [
        { word: 'שְׁמִטָּה', strongs: 'H8059', meaning: 'release, remission of debt', lang: 'hebrew' },
        { word: 'שֶׁבַע', strongs: 'H7651', meaning: 'seven', lang: 'hebrew' },
      ],
      financial_keywords: ['release', 'debt', 'sabbatical', 'jubilee', 'seven years'],
      financial_relevance: 10,
    },
    'Nehemiah 5:10': {
      hebrew_text: 'וְגַם־אֲנִ֗י אַחַי֙ וּנְעָרַ֔י נֹשִׁ֥ים בָּהֶ֖ם כֶּ֣סֶף וְדָגָ֑ן נַעַזְבָה־נָּ֖א אֶת־הַמַּשָּׁ֥א הַזֶּֽה',
      strong_numbers: ['H251', 'H5288', 'H5383', 'H3701', 'H1715', 'H5800', 'H4855'],
      original_words: [
        { word: 'נֹשִׁים', strongs: 'H5383', meaning: 'lending at interest', lang: 'hebrew' },
        { word: 'כֶּסֶף', strongs: 'H3701', meaning: 'silver, money', lang: 'hebrew' },
        { word: 'מַשָּׁא', strongs: 'H4855', meaning: 'usury, interest', lang: 'hebrew' },
      ],
      financial_keywords: ['usury', 'interest', 'money', 'silver', 'lending'],
      financial_relevance: 10,
    },
    'Psalm 37:21': {
      hebrew_text: 'לֹוֶ֣ה רָ֭שָׁע וְלֹ֣א יְשַׁלֵּ֑ם וְ֝צַדִּ֗יק חוֹנֵ֥ן וְנוֹתֵֽן',
      strong_numbers: ['H3867', 'H7563', 'H7999', 'H6662', 'H2603', 'H5414'],
      original_words: [
        { word: 'לֹוֶה', strongs: 'H3867', meaning: 'borrower', lang: 'hebrew' },
        { word: 'רָשָׁע', strongs: 'H7563', meaning: 'wicked', lang: 'hebrew' },
        { word: 'שָׁלַם', strongs: 'H7999', meaning: 'to repay, make restitution', lang: 'hebrew' },
        { word: 'צַדִּיק', strongs: 'H6662', meaning: 'righteous', lang: 'hebrew' },
      ],
      financial_keywords: ['borrow', 'repay', 'righteous', 'generous'],
      financial_relevance: 9,
    },
    'Proverbs 6:1-2': {
      hebrew_text: 'בְּ֭נִי אִם־עָרַ֣בְתָּ לְרֵעֶ֑ךָ תָּקַ֖עְתָּ לַזָּ֣ר כַּפֶּֽיךָ נוֹקַ֥שְׁתָּ בְאִמְרֵי־פִ֑יךָ',
      strong_numbers: ['H1121', 'H6148', 'H7453', 'H8628', 'H2114', 'H3709', 'H3369', 'H561'],
      original_words: [
        { word: 'עָרַב', strongs: 'H6148', meaning: 'to be surety, pledge', lang: 'hebrew' },
        { word: 'נוֹקַשׁ', strongs: 'H3369', meaning: 'to be ensnared', lang: 'hebrew' },
      ],
      financial_keywords: ['surety', 'pledge', 'collateral', 'guarantee', 'debt'],
      financial_relevance: 9,
    },
    'Proverbs 22:26': {
      hebrew_text: 'אַל־תְּהִ֥י בְתֹֽקְעֵי־כָ֑ף בַּ֝עֹרְבִ֗ים מַשָּׁאֽוֹת',
      strong_numbers: ['H8628', 'H3709', 'H6148', 'H4859'],
      original_words: [
        { word: 'תֹּקְעֵי כָף', strongs: 'H8628+H3709', meaning: 'those who strike hands (make pledges)', lang: 'hebrew' },
        { word: 'עֹרְבִים', strongs: 'H6148', meaning: 'sureties, guarantors', lang: 'hebrew' },
        { word: 'מַשָּׁאוֹת', strongs: 'H4859', meaning: 'debts, loans', lang: 'hebrew' },
      ],
      financial_keywords: ['surety', 'pledge', 'debt', 'guarantee'],
      financial_relevance: 9,
    },
    'Deuteronomy 28:12': {
      hebrew_text: 'יִפְתַּ֣ח יְהוָ֣ה ׀ לְ֠ךָ אֶת־א֨וֹצָר֤וֹ הַטּוֹב֙ אֶת־הַשָּׁמַ֔יִם... וְהִלְוִ֙יתָ֙ גּוֹיִ֣ם רַבִּ֔ים וְאַתָּ֖ה לֹ֥א תִלְוֶֽה',
      strong_numbers: ['H6605', 'H3068', 'H214', 'H2896', 'H8064', 'H3867', 'H1471', 'H7227'],
      original_words: [
        { word: 'אוֹצָר', strongs: 'H214', meaning: 'treasury, storehouse', lang: 'hebrew' },
        { word: 'הִלְוִיתָ', strongs: 'H3867', meaning: 'to lend', lang: 'hebrew' },
        { word: 'תִלְוֶה', strongs: 'H3867', meaning: 'to borrow', lang: 'hebrew' },
      ],
      financial_keywords: ['treasury', 'lend', 'borrow', 'blessing', 'nations'],
      financial_relevance: 9,
    },

    // ═══════════════════════════════════════════════════════
    // SAVING & INVESTMENT
    // ═══════════════════════════════════════════════════════
    'Genesis 41:36': {
      hebrew_text: 'וְהָיָ֨ה הָאֹ֤כֶל לְפִקָּדוֹן֙ לָאָ֔רֶץ לְשֶׁ֙בַע֙ שְׁנֵ֣י הָרָעָ֔ב',
      strong_numbers: ['H1961', 'H400', 'H6487', 'H776', 'H7651', 'H8141', 'H7458'],
      original_words: [
        { word: 'פִקָּדוֹן', strongs: 'H6487', meaning: 'deposit, store, reserve', lang: 'hebrew' },
        { word: 'רָעָב', strongs: 'H7458', meaning: 'famine, hunger', lang: 'hebrew' },
      ],
      financial_keywords: ['store', 'reserve', 'famine', 'planning', 'savings'],
      financial_relevance: 10,
    },
    'Proverbs 21:5': {
      hebrew_text: 'מַחְשְׁב֣וֹת חָ֭רוּץ אַךְ־לְמוֹתָ֑ר וְכׇל־אָ֝֗ץ אַךְ־לְמַחְסֽוֹר',
      strong_numbers: ['H4284', 'H2742', 'H389', 'H4195', 'H3605', 'H213', 'H4270'],
      original_words: [
        { word: 'חָרוּץ', strongs: 'H2742', meaning: 'diligent, sharp', lang: 'hebrew' },
        { word: 'מוֹתָר', strongs: 'H4195', meaning: 'profit, abundance', lang: 'hebrew' },
        { word: 'מַחְסוֹר', strongs: 'H4270', meaning: 'want, poverty', lang: 'hebrew' },
      ],
      financial_keywords: ['diligent', 'profit', 'planning', 'poverty', 'haste'],
      financial_relevance: 10,
    },
    'Proverbs 13:11': {
      hebrew_text: 'ה֭וֹן מֵהֶ֣בֶל יִמְעָ֑ט וְקֹבֵ֖ץ עַל־יָ֣ד יַרְבֶּֽה',
      strong_numbers: ['H1952', 'H1892', 'H4591', 'H6908', 'H3027', 'H7235'],
      original_words: [
        { word: 'הוֹן', strongs: 'H1952', meaning: 'wealth, riches', lang: 'hebrew' },
        { word: 'הֶבֶל', strongs: 'H1892', meaning: 'vanity, emptiness', lang: 'hebrew' },
        { word: 'קֹבֵץ', strongs: 'H6908', meaning: 'gatherer', lang: 'hebrew' },
      ],
      financial_keywords: ['wealth', 'vanity', 'labor', 'growth', 'compound'],
      financial_relevance: 10,
    },
    'Ecclesiastes 11:2': {
      hebrew_text: 'תֶּן־חֵ֥לֶק לְשִׁבְעָ֖ה וְגַ֣ם לִשְׁמוֹנָ֑ה כִּ֚י לֹ֣א תֵדַ֔ע מַה־יִּהְיֶ֥ה רָעָ֖ה עַל־הָאָֽרֶץ',
      strong_numbers: ['H5414', 'H2506', 'H7651', 'H8083', 'H3045', 'H7451', 'H776'],
      original_words: [
        { word: 'חֵלֶק', strongs: 'H2506', meaning: 'portion, share', lang: 'hebrew' },
        { word: 'שִׁבְעָה', strongs: 'H7651', meaning: 'seven', lang: 'hebrew' },
        { word: 'שְׁמוֹנָה', strongs: 'H8083', meaning: 'eight', lang: 'hebrew' },
      ],
      financial_keywords: ['diversification', 'portion', 'risk', 'investment'],
      financial_relevance: 10,
    },
    'Matthew 25:27': {
      greek_text: 'ἔδει σε οὖν βαλεῖν τὰ ἀργύριά μου τοῖς τραπεζίταις, καὶ ἐλθὼν ἐγὼ ἐκομισάμην ἂν τὸ ἐμὸν σὺν τόκῳ.',
      strong_numbers: ['G1163', 'G906', 'G694', 'G5133', 'G2064', 'G2865', 'G5110'],
      original_words: [
        { word: 'ἀργύρια', strongs: 'G694', meaning: 'silver coins, money', lang: 'greek' },
        { word: 'τραπεζίτης', strongs: 'G5133', meaning: 'banker, money-changer', lang: 'greek' },
        { word: 'τόκος', strongs: 'G5110', meaning: 'interest, usury', lang: 'greek' },
      ],
      financial_keywords: ['money', 'banker', 'interest', 'investment', 'return'],
      financial_relevance: 10,
    },
    'Proverbs 13:22': {
      hebrew_text: 'ט֗וֹב יַנְחִ֥יל בְּנֵי־בָנִ֑ים וְצָפ֥וּן לַ֝צַּדִּ֗יק חֵ֣יל חוֹטֵֽא',
      strong_numbers: ['H2896', 'H5157', 'H1121', 'H6845', 'H6662', 'H2428', 'H2398'],
      original_words: [
        { word: 'יַנְחִיל', strongs: 'H5157', meaning: 'to inherit, leave inheritance', lang: 'hebrew' },
        { word: 'חֵיל', strongs: 'H2428', meaning: 'wealth, substance', lang: 'hebrew' },
        { word: 'צָפוּן', strongs: 'H6845', meaning: 'stored up, laid up', lang: 'hebrew' },
      ],
      financial_keywords: ['inheritance', 'wealth', 'generational', 'stored'],
      financial_relevance: 9,
    },
    'Proverbs 21:20': {
      hebrew_text: 'א֭וֹצָר נֶחְמָ֣ד וָשֶׁ֣מֶן בִּנְוֵ֣ה חָכָ֑ם וּכְסִ֖יל אָדָ֣ם יְבַלְּעֶֽנּוּ',
      strong_numbers: ['H214', 'H2530', 'H8081', 'H5116', 'H2450', 'H3684', 'H120', 'H1104'],
      original_words: [
        { word: 'אוֹצָר', strongs: 'H214', meaning: 'treasure, store', lang: 'hebrew' },
        { word: 'חָכָם', strongs: 'H2450', meaning: 'wise', lang: 'hebrew' },
        { word: 'כְסִיל', strongs: 'H3684', meaning: 'fool', lang: 'hebrew' },
      ],
      financial_keywords: ['treasure', 'savings', 'wise', 'fool', 'consume'],
      financial_relevance: 9,
    },
    'Ecclesiastes 11:6': {
      hebrew_text: 'בַּבֹּ֙קֶר֙ זְרַ֣ע אֶת־זַרְעֶ֔ךָ וְלָעֶ֖רֶב אַל־תַּנַּ֣ח יָדֶ֑ךָ',
      strong_numbers: ['H1242', 'H2232', 'H2233', 'H6153', 'H3240', 'H3027'],
      original_words: [
        { word: 'זְרַע', strongs: 'H2232', meaning: 'to sow, plant', lang: 'hebrew' },
        { word: 'זַרְעֶךָ', strongs: 'H2233', meaning: 'seed', lang: 'hebrew' },
      ],
      financial_keywords: ['sow', 'seed', 'diversify', 'diligence'],
      financial_relevance: 8,
    },
    'Ecclesiastes 11:1': {
      hebrew_text: 'שַׁלַּ֥ח לַחְמְךָ֖ עַל־פְּנֵ֣י הַמָּ֑יִם כִּֽי־בְרֹ֥ב הַיָּמִ֖ים תִּמְצָאֶֽנּוּ',
      strong_numbers: ['H7971', 'H3899', 'H6440', 'H4325', 'H7230', 'H3117', 'H4672'],
      original_words: [
        { word: 'שַׁלַּח', strongs: 'H7971', meaning: 'to send, cast', lang: 'hebrew' },
        { word: 'לֶחֶם', strongs: 'H3899', meaning: 'bread, food', lang: 'hebrew' },
      ],
      financial_keywords: ['venture', 'investment', 'return', 'risk'],
      financial_relevance: 9,
    },

    // ═══════════════════════════════════════════════════════
    // TAXES & GOVERNANCE
    // ═══════════════════════════════════════════════════════
    'Matthew 22:21': {
      greek_text: 'Ἀπόδοτε οὖν τὰ Καίσαρος Καίσαρι καὶ τὰ τοῦ θεοῦ τῷ θεῷ.',
      strong_numbers: ['G591', 'G2541', 'G2316'],
      original_words: [
        { word: 'ἀπόδοτε', strongs: 'G591', meaning: 'render, give back, pay', lang: 'greek' },
        { word: 'Καῖσαρ', strongs: 'G2541', meaning: 'Caesar (government)', lang: 'greek' },
      ],
      financial_keywords: ['render', 'taxes', 'Caesar', 'government', 'obligation'],
      financial_relevance: 10,
    },
    'Romans 13:7': {
      greek_text: 'ἀπόδοτε πᾶσιν τὰς ὀφειλάς· τῷ τὸν φόρον τὸν φόρον, τῷ τὸ τέλος τὸ τέλος, τῷ τὸν φόβον τὸν φόβον, τῷ τὴν τιμὴν τὴν τιμήν.',
      strong_numbers: ['G591', 'G3956', 'G3782', 'G5411', 'G5056', 'G5401', 'G5092'],
      original_words: [
        { word: 'φόρος', strongs: 'G5411', meaning: 'tribute, tax', lang: 'greek' },
        { word: 'τέλος', strongs: 'G5056', meaning: 'custom, duty, toll', lang: 'greek' },
        { word: 'ὀφειλή', strongs: 'G3782', meaning: 'debt, obligation', lang: 'greek' },
      ],
      financial_keywords: ['tribute', 'tax', 'custom', 'duty', 'obligation'],
      financial_relevance: 10,
    },
    'Romans 13:6': {
      greek_text: 'διὰ τοῦτο γὰρ καὶ φόρους τελεῖτε· λειτουργοὶ γὰρ θεοῦ εἰσιν εἰς αὐτὸ τοῦτο προσκαρτεροῦντες.',
      strong_numbers: ['G5411', 'G5055', 'G3011', 'G2316', 'G4342'],
      original_words: [
        { word: 'φόρος', strongs: 'G5411', meaning: 'tribute, tax', lang: 'greek' },
        { word: 'λειτουργός', strongs: 'G3011', meaning: 'public servant, minister', lang: 'greek' },
      ],
      financial_keywords: ['taxes', 'tribute', 'minister', 'government'],
      financial_relevance: 9,
    },
    'Mark 12:17': {
      greek_text: 'Τὰ Καίσαρος ἀπόδοτε Καίσαρι καὶ τὰ τοῦ θεοῦ τῷ θεῷ.',
      strong_numbers: ['G2541', 'G591', 'G2316'],
      original_words: [
        { word: 'ἀπόδοτε', strongs: 'G591', meaning: 'render, give back', lang: 'greek' },
        { word: 'Καῖσαρ', strongs: 'G2541', meaning: 'Caesar', lang: 'greek' },
      ],
      financial_keywords: ['render', 'Caesar', 'taxes', 'obligation'],
      financial_relevance: 9,
    },
    'Romans 13:1': {
      greek_text: 'Πᾶσα ψυχὴ ἐξουσίαις ὑπερεχούσαις ὑποτασσέσθω. οὐ γὰρ ἔστιν ἐξουσία εἰ μὴ ὑπὸ θεοῦ',
      strong_numbers: ['G3956', 'G5590', 'G1849', 'G5242', 'G5293', 'G2316'],
      original_words: [
        { word: 'ἐξουσία', strongs: 'G1849', meaning: 'authority, power', lang: 'greek' },
        { word: 'ὑποτάσσω', strongs: 'G5293', meaning: 'to submit, be subject', lang: 'greek' },
      ],
      financial_keywords: ['authority', 'submit', 'governance', 'law'],
      financial_relevance: 7,
    },
    '1 Peter 2:13': {
      greek_text: 'Ὑποτάγητε πάσῃ ἀνθρωπίνῃ κτίσει διὰ τὸν κύριον',
      strong_numbers: ['G5293', 'G3956', 'G442', 'G2937', 'G2962'],
      original_words: [
        { word: 'ὑποτάγητε', strongs: 'G5293', meaning: 'submit, be subject to', lang: 'greek' },
        { word: 'κτίσις', strongs: 'G2937', meaning: 'institution, ordinance', lang: 'greek' },
      ],
      financial_keywords: ['submit', 'authority', 'ordinance', 'compliance'],
      financial_relevance: 7,
    },
    'Deuteronomy 25:13': {
      hebrew_text: 'לֹא־יִהְיֶ֥ה לְךָ֛ בְּכִֽיסְךָ֖ אֶ֣בֶן וָאָ֑בֶן גְּדוֹלָ֖ה וּקְטַנָּֽה',
      strong_numbers: ['H1961', 'H3599', 'H68', 'H1419', 'H6996'],
      original_words: [
        { word: 'אֶבֶן', strongs: 'H68', meaning: 'stone (weight)', lang: 'hebrew' },
        { word: 'כִּיס', strongs: 'H3599', meaning: 'bag, purse', lang: 'hebrew' },
      ],
      financial_keywords: ['weights', 'measures', 'honesty', 'fair trade'],
      financial_relevance: 9,
    },

    // ═══════════════════════════════════════════════════════
    // STEWARDSHIP & WISDOM
    // ═══════════════════════════════════════════════════════
    '1 Corinthians 4:2': {
      greek_text: 'ὧδε λοιπὸν ζητεῖται ἐν τοῖς οἰκονόμοις, ἵνα πιστός τις εὑρεθῇ.',
      strong_numbers: ['G5602', 'G3063', 'G2212', 'G3623', 'G4103', 'G2147'],
      original_words: [
        { word: 'οἰκονόμος', strongs: 'G3623', meaning: 'steward, manager', lang: 'greek' },
        { word: 'πιστός', strongs: 'G4103', meaning: 'faithful, trustworthy', lang: 'greek' },
      ],
      financial_keywords: ['steward', 'faithful', 'management', 'trustworthy'],
      financial_relevance: 10,
    },
    'Proverbs 27:23': {
      hebrew_text: 'יָדֹ֣עַ תֵּ֭דַע פְּנֵ֣י צֹאנֶ֑ךָ שִׁ֥ית לִ֝בְּךָ֗ לַעֲדָרִֽים',
      strong_numbers: ['H3045', 'H6440', 'H6629', 'H7896', 'H3820', 'H5739'],
      original_words: [
        { word: 'יָדֹעַ תֵּדַע', strongs: 'H3045', meaning: 'know thoroughly', lang: 'hebrew' },
        { word: 'צֹאן', strongs: 'H6629', meaning: 'flock (assets)', lang: 'hebrew' },
        { word: 'עֲדָרִים', strongs: 'H5739', meaning: 'herds (portfolio)', lang: 'hebrew' },
      ],
      financial_keywords: ['know', 'assets', 'portfolio', 'diligence', 'management'],
      financial_relevance: 10,
    },
    'Proverbs 24:27': {
      hebrew_text: 'הָכֵ֣ן בַּ֭חוּץ מְלַאכְתֶּ֑ךָ וְעַתְּדָ֥הּ בַ֝שָּׂדֶ֗ה אַ֣חַר וּבָנִ֥יתָ בֵיתֶֽךָ',
      strong_numbers: ['H3559', 'H2351', 'H4399', 'H6257', 'H7704', 'H310', 'H1129', 'H1004'],
      original_words: [
        { word: 'מְלָאכָה', strongs: 'H4399', meaning: 'work, business', lang: 'hebrew' },
        { word: 'שָׂדֶה', strongs: 'H7704', meaning: 'field (income source)', lang: 'hebrew' },
        { word: 'בָּנָה', strongs: 'H1129', meaning: 'to build', lang: 'hebrew' },
      ],
      financial_keywords: ['prepare', 'work', 'field', 'build', 'planning'],
      financial_relevance: 9,
    },
    'Luke 14:28': {
      greek_text: 'τίς γὰρ ἐξ ὑμῶν θέλων πύργον οἰκοδομῆσαι οὐχὶ πρῶτον καθίσας ψηφίζει τὴν δαπάνην',
      strong_numbers: ['G5101', 'G2309', 'G4444', 'G3618', 'G4412', 'G2523', 'G5585', 'G1160'],
      original_words: [
        { word: 'ψηφίζω', strongs: 'G5585', meaning: 'to calculate, count the cost', lang: 'greek' },
        { word: 'δαπάνη', strongs: 'G1160', meaning: 'cost, expense', lang: 'greek' },
        { word: 'πύργος', strongs: 'G4444', meaning: 'tower (project)', lang: 'greek' },
      ],
      financial_keywords: ['cost', 'calculate', 'budget', 'planning', 'build'],
      financial_relevance: 10,
    },
    'Proverbs 15:22': {
      hebrew_text: 'הָפֵ֣ר מַ֭חֲשָׁבוֹת בְּאֵ֣ין ס֑וֹד וּבְרֹ֥ב י֝וֹעֲצִ֗ים תָּקֽוּם',
      strong_numbers: ['H6565', 'H4284', 'H369', 'H5475', 'H7230', 'H3289', 'H6965'],
      original_words: [
        { word: 'סוֹד', strongs: 'H5475', meaning: 'counsel, advice', lang: 'hebrew' },
        { word: 'יוֹעֲצִים', strongs: 'H3289', meaning: 'counselors, advisors', lang: 'hebrew' },
      ],
      financial_keywords: ['counsel', 'advisors', 'planning', 'strategy'],
      financial_relevance: 8,
    },
    'Luke 16:10': {
      greek_text: 'ὁ πιστὸς ἐν ἐλαχίστῳ καὶ ἐν πολλῷ πιστός ἐστιν, καὶ ὁ ἐν ἐλαχίστῳ ἄδικος καὶ ἐν πολλῷ ἄδικός ἐστιν.',
      strong_numbers: ['G4103', 'G1646', 'G4183', 'G94'],
      original_words: [
        { word: 'πιστός', strongs: 'G4103', meaning: 'faithful, trustworthy', lang: 'greek' },
        { word: 'ἐλάχιστος', strongs: 'G1646', meaning: 'least, smallest', lang: 'greek' },
        { word: 'ἄδικος', strongs: 'G94', meaning: 'unjust, unrighteous', lang: 'greek' },
      ],
      financial_keywords: ['faithful', 'stewardship', 'trustworthy', 'integrity'],
      financial_relevance: 9,
    },
    'Matthew 25:21': {
      greek_text: 'Εὖ, δοῦλε ἀγαθὲ καὶ πιστέ, ἐπὶ ὀλίγα ἦς πιστός, ἐπὶ πολλῶν σε καταστήσω· εἴσελθε εἰς τὴν χαρὰν τοῦ κυρίου σου.',
      strong_numbers: ['G2095', 'G1401', 'G18', 'G4103', 'G3641', 'G4183', 'G2525', 'G5479', 'G2962'],
      original_words: [
        { word: 'δοῦλος', strongs: 'G1401', meaning: 'servant', lang: 'greek' },
        { word: 'πιστός', strongs: 'G4103', meaning: 'faithful', lang: 'greek' },
        { word: 'καθίστημι', strongs: 'G2525', meaning: 'to put in charge', lang: 'greek' },
      ],
      financial_keywords: ['faithful', 'servant', 'stewardship', 'reward', 'promotion'],
      financial_relevance: 10,
    },
    'Matthew 25:29': {
      greek_text: 'τῷ γὰρ ἔχοντι παντὶ δοθήσεται καὶ περισσευθήσεται· τοῦ δὲ μὴ ἔχοντος, καὶ ὃ ἔχει ἀρθήσεται ἀπ᾽ αὐτοῦ.',
      strong_numbers: ['G2192', 'G3956', 'G1325', 'G4052', 'G142'],
      original_words: [
        { word: 'περισσεύω', strongs: 'G4052', meaning: 'to abound, have surplus', lang: 'greek' },
        { word: 'αἴρω', strongs: 'G142', meaning: 'to take away', lang: 'greek' },
      ],
      financial_keywords: ['abundance', 'surplus', 'compound', 'growth', 'stewardship'],
      financial_relevance: 9,
    },
    'Romans 14:12': {
      greek_text: 'ἄρα οὖν ἕκαστος ἡμῶν περὶ ἑαυτοῦ λόγον δώσει τῷ θεῷ.',
      strong_numbers: ['G1538', 'G4012', 'G1438', 'G3056', 'G1325', 'G2316'],
      original_words: [
        { word: 'λόγος', strongs: 'G3056', meaning: 'account, word', lang: 'greek' },
      ],
      financial_keywords: ['account', 'accountability', 'stewardship'],
      financial_relevance: 7,
    },

    // ═══════════════════════════════════════════════════════
    // LOVE OF MONEY & CONTENTMENT
    // ═══════════════════════════════════════════════════════
    '1 Timothy 6:10': {
      greek_text: 'ῥίζα γὰρ πάντων τῶν κακῶν ἐστιν ἡ φιλαργυρία, ἧς τινες ὀρεγόμενοι ἀπεπλανήθησαν ἀπὸ τῆς πίστεως',
      strong_numbers: ['G4491', 'G3956', 'G2556', 'G5365', 'G3713', 'G635', 'G4102'],
      original_words: [
        { word: 'φιλαργυρία', strongs: 'G5365', meaning: 'love of money, avarice', lang: 'greek' },
        { word: 'ῥίζα', strongs: 'G4491', meaning: 'root', lang: 'greek' },
      ],
      financial_keywords: ['love of money', 'avarice', 'greed', 'evil', 'root'],
      financial_relevance: 10,
    },
    'Hebrews 13:5': {
      greek_text: 'Ἀφιλάργυρος ὁ τρόπος· ἀρκούμενοι τοῖς παροῦσιν· αὐτὸς γὰρ εἴρηκεν· Οὐ μή σε ἀνῶ οὐδ᾽ οὐ μή σε ἐγκαταλίπω·',
      strong_numbers: ['G866', 'G5158', 'G714', 'G3918', 'G447', 'G1459'],
      original_words: [
        { word: 'ἀφιλάργυρος', strongs: 'G866', meaning: 'free from love of money', lang: 'greek' },
        { word: 'ἀρκέω', strongs: 'G714', meaning: 'to be content, sufficient', lang: 'greek' },
      ],
      financial_keywords: ['contentment', 'free from greed', 'sufficiency'],
      financial_relevance: 9,
    },
    'Ecclesiastes 5:10': {
      hebrew_text: 'אֹהֵ֥ב כֶּ֙סֶף֙ לֹא־יִשְׂבַּ֣ע כֶּ֔סֶף וּמִֽי־אֹהֵ֥ב בֶּהָמ֖וֹן לֹ֣א תְבוּאָ֑ה',
      strong_numbers: ['H157', 'H3701', 'H7646', 'H1995', 'H8393'],
      original_words: [
        { word: 'כֶּסֶף', strongs: 'H3701', meaning: 'silver, money', lang: 'hebrew' },
        { word: 'שָׂבַע', strongs: 'H7646', meaning: 'to be satisfied', lang: 'hebrew' },
        { word: 'הָמוֹן', strongs: 'H1995', meaning: 'abundance, wealth', lang: 'hebrew' },
      ],
      financial_keywords: ['money', 'satisfaction', 'abundance', 'contentment'],
      financial_relevance: 9,
    },
    'Proverbs 23:4-5': {
      hebrew_text: 'אַל־תִּיגַ֥ע לְהַעֲשִׁ֑יר מִֽבִּינָתְךָ֥ חֲדָֽל הֲתָעִ֤יף עֵינֶ֨יךָ ׀ בּ֗וֹ וְֽאֵינֶ֗נּוּ',
      strong_numbers: ['H3021', 'H6238', 'H998', 'H2308', 'H5774', 'H5869'],
      original_words: [
        { word: 'לְהַעֲשִׁיר', strongs: 'H6238', meaning: 'to become rich', lang: 'hebrew' },
        { word: 'בִּינָה', strongs: 'H998', meaning: 'understanding, discernment', lang: 'hebrew' },
      ],
      financial_keywords: ['toil', 'riches', 'fleeting', 'discernment'],
      financial_relevance: 8,
    },
    '1 Timothy 6:6-7': {
      greek_text: 'ἔστιν δὲ πορισμὸς μέγας ἡ εὐσέβεια μετὰ αὐταρκείας· οὐδὲν γὰρ εἰσηνέγκαμεν εἰς τὸν κόσμον',
      strong_numbers: ['G4200', 'G3173', 'G2150', 'G841', 'G3762', 'G1533', 'G2889'],
      original_words: [
        { word: 'πορισμός', strongs: 'G4200', meaning: 'gain, profit', lang: 'greek' },
        { word: 'αὐτάρκεια', strongs: 'G841', meaning: 'contentment, self-sufficiency', lang: 'greek' },
        { word: 'εὐσέβεια', strongs: 'G2150', meaning: 'godliness', lang: 'greek' },
      ],
      financial_keywords: ['gain', 'contentment', 'godliness', 'profit'],
      financial_relevance: 9,
    },
    'Proverbs 16:8': {
      hebrew_text: 'ט֣וֹב מְ֭עַט בִּצְדָקָ֑ה מֵרֹ֥ב תְּ֝בוּא֗וֹת בְּלֹ֣א מִשְׁפָּֽט',
      strong_numbers: ['H2896', 'H4592', 'H6666', 'H7230', 'H8393', 'H3808', 'H4941'],
      original_words: [
        { word: 'צְדָקָה', strongs: 'H6666', meaning: 'righteousness', lang: 'hebrew' },
        { word: 'תְּבוּאָה', strongs: 'H8393', meaning: 'revenue, income', lang: 'hebrew' },
        { word: 'מִשְׁפָּט', strongs: 'H4941', meaning: 'justice', lang: 'hebrew' },
      ],
      financial_keywords: ['righteousness', 'revenue', 'justice', 'integrity'],
      financial_relevance: 8,
    },
    'Proverbs 28:22': {
      hebrew_text: 'נִבְהָ֣ל לַ֭הוֹן אִ֣ישׁ רַע־עָ֑יִן וְלֹֽא־יֵ֝דַ֗ע כִּֽי־חֶ֥סֶר יְבֹאֶֽנּוּ',
      strong_numbers: ['H926', 'H1952', 'H376', 'H7451', 'H5869', 'H3045', 'H2639'],
      original_words: [
        { word: 'הוֹן', strongs: 'H1952', meaning: 'wealth', lang: 'hebrew' },
        { word: 'רַע עַיִן', strongs: 'H7451+H5869', meaning: 'evil eye (stingy/greedy)', lang: 'hebrew' },
        { word: 'חֶסֶר', strongs: 'H2639', meaning: 'want, poverty', lang: 'hebrew' },
      ],
      financial_keywords: ['wealth', 'greed', 'haste', 'poverty'],
      financial_relevance: 8,
    },
    '1 Timothy 6:17': {
      greek_text: 'Τοῖς πλουσίοις ἐν τῷ νῦν αἰῶνι παράγγελλε μὴ ὑψηλοφρονεῖν μηδὲ ἠλπικέναι ἐπὶ πλούτου ἀδηλότητι',
      strong_numbers: ['G4145', 'G3568', 'G165', 'G3853', 'G5309', 'G1679', 'G4149', 'G83'],
      original_words: [
        { word: 'πλούσιος', strongs: 'G4145', meaning: 'rich, wealthy', lang: 'greek' },
        { word: 'πλοῦτος', strongs: 'G4149', meaning: 'riches, wealth', lang: 'greek' },
        { word: 'ἀδηλότης', strongs: 'G83', meaning: 'uncertainty', lang: 'greek' },
      ],
      financial_keywords: ['rich', 'wealth', 'uncertainty', 'humility'],
      financial_relevance: 8,
    },
    'Proverbs 30:8': {
      hebrew_text: 'רֵ֣אשׁ וָ֭עֹשֶׁר אַל־תִּתֶּן־לִ֑י הַ֝טְרִיפֵ֗נִי לֶ֣חֶם חֻקִּֽי',
      strong_numbers: ['H7389', 'H6239', 'H5414', 'H2963', 'H3899', 'H2706'],
      original_words: [
        { word: 'רֵאשׁ', strongs: 'H7389', meaning: 'poverty', lang: 'hebrew' },
        { word: 'עֹשֶׁר', strongs: 'H6239', meaning: 'riches, wealth', lang: 'hebrew' },
        { word: 'חֹק', strongs: 'H2706', meaning: 'portion, allotment', lang: 'hebrew' },
      ],
      financial_keywords: ['poverty', 'riches', 'contentment', 'daily bread'],
      financial_relevance: 8,
    },
    'Proverbs 15:27': {
      hebrew_text: 'עֹכֵ֣ר בֵּ֭יתוֹ בּוֹצֵ֣עַ בָּ֑צַע וְשׂוֹנֵ֖א מַתָּנֹ֣ת יִחְיֶֽה',
      strong_numbers: ['H5916', 'H1004', 'H1214', 'H1215', 'H8130', 'H4979', 'H2421'],
      original_words: [
        { word: 'בֶּצַע', strongs: 'H1215', meaning: 'unjust gain, profit', lang: 'hebrew' },
        { word: 'מַתָּנוֹת', strongs: 'H4979', meaning: 'gifts, bribes', lang: 'hebrew' },
      ],
      financial_keywords: ['unjust gain', 'bribes', 'corruption', 'integrity'],
      financial_relevance: 8,
    },
    'Proverbs 20:17': {
      hebrew_text: 'עָרֵ֣ב לָ֭אִישׁ לֶ֣חֶם שָׁ֑קֶר וְ֝אַחַ֗ר יִמָּלֵ֥א פִ֣יהוּ חָצָֽץ',
      strong_numbers: ['H6149', 'H376', 'H3899', 'H8267', 'H310', 'H4390', 'H6310', 'H2687'],
      original_words: [
        { word: 'שֶׁקֶר', strongs: 'H8267', meaning: 'falsehood, fraud', lang: 'hebrew' },
        { word: 'חָצָץ', strongs: 'H2687', meaning: 'gravel', lang: 'hebrew' },
      ],
      financial_keywords: ['fraud', 'deceit', 'consequences'],
      financial_relevance: 7,
    },

    // ═══════════════════════════════════════════════════════
    // WORK & DILIGENCE
    // ═══════════════════════════════════════════════════════
    'Proverbs 22:29': {
      hebrew_text: 'חָזִ֡יתָ אִ֤ישׁ ׀ מָהִ֥יר בִּמְלַאכְתּ֗וֹ לִפְנֵי־מְלָכִ֥ים יִתְיַצָּ֑ב',
      strong_numbers: ['H2372', 'H376', 'H4106', 'H4399', 'H6440', 'H4428', 'H3320'],
      original_words: [
        { word: 'מָהִיר', strongs: 'H4106', meaning: 'skillful, diligent', lang: 'hebrew' },
        { word: 'מְלָאכָה', strongs: 'H4399', meaning: 'work, craft', lang: 'hebrew' },
        { word: 'מֶלֶךְ', strongs: 'H4428', meaning: 'king', lang: 'hebrew' },
      ],
      financial_keywords: ['skillful', 'diligent', 'work', 'excellence'],
      financial_relevance: 8,
    },
    'Proverbs 28:19': {
      hebrew_text: 'עֹבֵ֣ד אַ֭דְמָתוֹ יִֽשְׂבַּֽע־לָ֑חֶם וּמְרַדֵּ֥ף רֵ֝קִ֗ים יִֽשְׂבַּֽע־רִֽישׁ',
      strong_numbers: ['H5647', 'H127', 'H7646', 'H3899', 'H7291', 'H7386', 'H7389'],
      original_words: [
        { word: 'עֹבֵד', strongs: 'H5647', meaning: 'to work, cultivate', lang: 'hebrew' },
        { word: 'אֲדָמָה', strongs: 'H127', meaning: 'ground, land', lang: 'hebrew' },
        { word: 'רֵיקִים', strongs: 'H7386', meaning: 'vain things, empty pursuits', lang: 'hebrew' },
      ],
      financial_keywords: ['work', 'land', 'food', 'poverty', 'diligence'],
      financial_relevance: 8,
    },
    'Ecclesiastes 9:10': {
      hebrew_text: 'כֹּ֠ל אֲשֶׁ֨ר תִּמְצָ֧א יָדְךָ֛ לַעֲשׂ֥וֹת בְּכֹחֲךָ֖ עֲשֵׂ֑ה',
      strong_numbers: ['H3605', 'H4672', 'H3027', 'H6213', 'H3581'],
      original_words: [
        { word: 'כֹּחַ', strongs: 'H3581', meaning: 'strength, ability', lang: 'hebrew' },
        { word: 'עָשָׂה', strongs: 'H6213', meaning: 'to do, make', lang: 'hebrew' },
      ],
      financial_keywords: ['work', 'strength', 'diligence', 'effort'],
      financial_relevance: 7,
    },
    'Proverbs 12:24': {
      hebrew_text: 'יַד־חָרוּצִ֥ים תִּמְשׁ֑וֹל וּ֝רְמִיָּ֗ה תִּהְיֶ֥ה לָמַֽס',
      strong_numbers: ['H3027', 'H2742', 'H4910', 'H7423', 'H4522'],
      original_words: [
        { word: 'חָרוּץ', strongs: 'H2742', meaning: 'diligent', lang: 'hebrew' },
        { word: 'מָשַׁל', strongs: 'H4910', meaning: 'to rule', lang: 'hebrew' },
        { word: 'רְמִיָּה', strongs: 'H7423', meaning: 'slackness, laziness', lang: 'hebrew' },
        { word: 'מַס', strongs: 'H4522', meaning: 'forced labor, tribute', lang: 'hebrew' },
      ],
      financial_keywords: ['diligent', 'rule', 'lazy', 'forced labor'],
      financial_relevance: 8,
    },
    'Proverbs 6:6-8': {
      hebrew_text: 'לֵךְ־אֶל־נְמָלָ֥ה עָצֵ֑ל רְאֵ֖ה דְרָכֶ֣יהָ וַחֲכָֽם... תָּכִ֣ין בַּקַּ֣יִץ לַחְמָ֑הּ אָגְרָ֥ה בַ֝קָּצִ֗יר מַאֲכָלָֽהּ',
      strong_numbers: ['H1980', 'H5244', 'H6102', 'H7200', 'H1870', 'H2449', 'H3559', 'H7019', 'H3899', 'H103', 'H7105'],
      original_words: [
        { word: 'נְמָלָה', strongs: 'H5244', meaning: 'ant', lang: 'hebrew' },
        { word: 'עָצֵל', strongs: 'H6102', meaning: 'sluggard, lazy', lang: 'hebrew' },
        { word: 'חָכַם', strongs: 'H2449', meaning: 'to be wise', lang: 'hebrew' },
      ],
      financial_keywords: ['ant', 'sluggard', 'wise', 'savings', 'harvest', 'preparation'],
      financial_relevance: 9,
    },
    'Proverbs 10:5': {
      hebrew_text: 'אֹגֵ֣ר בַּ֭קַּיִץ בֵּ֣ן מַשְׂכִּ֑יל נִרְדָּ֥ם בַּ֝קָּצִ֗יר בֵּ֣ן מֵבִֽישׁ',
      strong_numbers: ['H103', 'H7019', 'H1121', 'H7919', 'H7290', 'H7105', 'H954'],
      original_words: [
        { word: 'אֹגֵר', strongs: 'H103', meaning: 'to gather, store', lang: 'hebrew' },
        { word: 'מַשְׂכִּיל', strongs: 'H7919', meaning: 'wise, prudent', lang: 'hebrew' },
      ],
      financial_keywords: ['gather', 'harvest', 'wise', 'lazy', 'timing'],
      financial_relevance: 8,
    },
    'Proverbs 13:4': {
      hebrew_text: 'מִתְאַוָּ֣ה וָ֭אַיִן נַפְשׁ֣וֹ עָצֵ֑ל וְנֶ֖פֶשׁ חָרֻצִ֣ים תְּדֻשָּֽׁן',
      strong_numbers: ['H183', 'H369', 'H5315', 'H6102', 'H2742', 'H1878'],
      original_words: [
        { word: 'עָצֵל', strongs: 'H6102', meaning: 'sluggard', lang: 'hebrew' },
        { word: 'חָרוּץ', strongs: 'H2742', meaning: 'diligent', lang: 'hebrew' },
        { word: 'דָּשֵׁן', strongs: 'H1878', meaning: 'to be made fat, prosper', lang: 'hebrew' },
      ],
      financial_keywords: ['sluggard', 'diligent', 'prosper', 'desire'],
      financial_relevance: 8,
    },

    // ═══════════════════════════════════════════════════════
    // FAIR TRADE & JUSTICE
    // ═══════════════════════════════════════════════════════
    'Proverbs 11:1': {
      hebrew_text: 'מֹאזְנֵ֣י מִ֭רְמָה תּוֹעֲבַ֣ת יְהוָ֑ה וְאֶ֖בֶן שְׁלֵמָ֣ה רְצוֹנֽוֹ',
      strong_numbers: ['H3976', 'H4820', 'H8441', 'H3068', 'H68', 'H8003', 'H7522'],
      original_words: [
        { word: 'מֹאזְנַיִם', strongs: 'H3976', meaning: 'scales, balances', lang: 'hebrew' },
        { word: 'מִרְמָה', strongs: 'H4820', meaning: 'deceit, fraud', lang: 'hebrew' },
        { word: 'תּוֹעֵבָה', strongs: 'H8441', meaning: 'abomination', lang: 'hebrew' },
      ],
      financial_keywords: ['scales', 'deceit', 'abomination', 'honest', 'fair trade'],
      financial_relevance: 10,
    },
    'Leviticus 19:35': {
      hebrew_text: 'לֹא־תַעֲשׂ֥וּ עָ֖וֶל בַּמִּשְׁפָּ֑ט בַּמִּדָּ֕ה בַּמִּשְׁקָ֖ל וּבַמְּשׂוּרָֽה',
      strong_numbers: ['H6213', 'H5766', 'H4941', 'H4060', 'H4948', 'H4884'],
      original_words: [
        { word: 'עָוֶל', strongs: 'H5766', meaning: 'injustice, unrighteousness', lang: 'hebrew' },
        { word: 'מִדָּה', strongs: 'H4060', meaning: 'measure', lang: 'hebrew' },
        { word: 'מִשְׁקָל', strongs: 'H4948', meaning: 'weight', lang: 'hebrew' },
      ],
      financial_keywords: ['injustice', 'measure', 'weight', 'fair'],
      financial_relevance: 9,
    },
    'Leviticus 19:35-36': {
      hebrew_text: 'לֹא־תַעֲשׂ֥וּ עָ֖וֶל בַּמִּשְׁפָּ֑ט ... מֹאזְנֵ֣י צֶ֗דֶק אַבְנֵי־צֶ֤דֶק אֵיפַת־צֶ֙דֶק֙ וְהִ֥ין צֶ֖דֶק',
      strong_numbers: ['H6213', 'H5766', 'H4941', 'H3976', 'H6664', 'H68', 'H374', 'H1969'],
      original_words: [
        { word: 'צֶדֶק', strongs: 'H6664', meaning: 'justice, righteousness', lang: 'hebrew' },
        { word: 'אֵיפָה', strongs: 'H374', meaning: 'ephah (dry measure)', lang: 'hebrew' },
        { word: 'הִין', strongs: 'H1969', meaning: 'hin (liquid measure)', lang: 'hebrew' },
      ],
      financial_keywords: ['justice', 'honest scales', 'measures', 'ephah', 'hin'],
      financial_relevance: 9,
    },
    'Proverbs 20:10': {
      hebrew_text: 'אֶ֣בֶן וָ֭אֶבֶן אֵיפָ֣ה וְאֵיפָ֑ה תּוֹעֲבַ֥ת יְ֝הוָ֗ה גַּם־שְׁנֵיהֶֽם',
      strong_numbers: ['H68', 'H374', 'H8441', 'H3068', 'H8147'],
      original_words: [
        { word: 'אֶבֶן', strongs: 'H68', meaning: 'stone (weight)', lang: 'hebrew' },
        { word: 'אֵיפָה', strongs: 'H374', meaning: 'ephah (measure)', lang: 'hebrew' },
        { word: 'תּוֹעֵבָה', strongs: 'H8441', meaning: 'abomination', lang: 'hebrew' },
      ],
      financial_keywords: ['weights', 'measures', 'dishonest', 'abomination'],
      financial_relevance: 9,
    },
    'Micah 6:8': {
      hebrew_text: 'הִגִּ֥יד לְךָ֛ אָדָ֖ם מַה־טּ֑וֹב וּמָה־יְהוָ֞ה דּוֹרֵ֣שׁ מִמְּךָ֗ כִּ֣י אִם־עֲשׂ֤וֹת מִשְׁפָּט֙ וְאַ֣הֲבַת חֶ֔סֶד וְהַצְנֵ֥עַ לֶ֖כֶת עִם־אֱלֹהֶֽיךָ',
      strong_numbers: ['H5046', 'H120', 'H2896', 'H3068', 'H1875', 'H6213', 'H4941', 'H160', 'H2617', 'H6800', 'H1980', 'H430'],
      original_words: [
        { word: 'מִשְׁפָּט', strongs: 'H4941', meaning: 'justice', lang: 'hebrew' },
        { word: 'חֶסֶד', strongs: 'H2617', meaning: 'mercy, lovingkindness', lang: 'hebrew' },
        { word: 'הַצְנֵעַ', strongs: 'H6800', meaning: 'to walk humbly', lang: 'hebrew' },
      ],
      financial_keywords: ['justice', 'mercy', 'humility', 'ethics'],
      financial_relevance: 8,
    },
    'Proverbs 21:6': {
      hebrew_text: 'פֹּ֣עַל א֭וֹצָרוֹת בִּלְשׁ֣וֹן שָׁ֑קֶר הֶ֥בֶל נִ֝דָּ֗ף מְבַקְשֵׁי־מָֽוֶת',
      strong_numbers: ['H6467', 'H214', 'H3956', 'H8267', 'H1892', 'H5086', 'H1245', 'H4194'],
      original_words: [
        { word: 'אוֹצָרוֹת', strongs: 'H214', meaning: 'treasures', lang: 'hebrew' },
        { word: 'שֶׁקֶר', strongs: 'H8267', meaning: 'falsehood, lying', lang: 'hebrew' },
        { word: 'הֶבֶל', strongs: 'H1892', meaning: 'vanity, vapor', lang: 'hebrew' },
      ],
      financial_keywords: ['treasure', 'lying', 'fraud', 'vanity', 'death'],
      financial_relevance: 8,
    },
    'Jeremiah 22:13': {
      hebrew_text: 'ה֛וֹי בֹּנֶ֥ה בֵית֖וֹ בְּלֹא־צֶ֑דֶק וַעֲלִיּוֹתָ֣יו בְּלֹ֣א מִשְׁפָּ֗ט בְּרֵעֵ֙הוּ֙ יַעֲבֹ֣ד חִנָּ֔ם וּפֹעֲל֖וֹ לֹ֥א יִתֶּן־לֽוֹ',
      strong_numbers: ['H1945', 'H1129', 'H1004', 'H6664', 'H5944', 'H4941', 'H7453', 'H5647', 'H2600', 'H6467', 'H5414'],
      original_words: [
        { word: 'צֶדֶק', strongs: 'H6664', meaning: 'righteousness, justice', lang: 'hebrew' },
        { word: 'חִנָּם', strongs: 'H2600', meaning: 'without pay, for nothing', lang: 'hebrew' },
        { word: 'פֹּעַל', strongs: 'H6467', meaning: 'wages, work', lang: 'hebrew' },
      ],
      financial_keywords: ['unjust', 'wages', 'exploitation', 'labor'],
      financial_relevance: 9,
    },

    // ═══════════════════════════════════════════════════════
    // GENEROSITY & CHARITY
    // ═══════════════════════════════════════════════════════
    'Proverbs 19:17': {
      hebrew_text: 'מַלְוֵ֣ה יְ֭הוָה ח֣וֹנֵן דָּ֑ל וּ֝גְמֻל֗וֹ יְשַׁלֶּם־לֽוֹ',
      strong_numbers: ['H3867', 'H3068', 'H2603', 'H1800', 'H1576', 'H7999'],
      original_words: [
        { word: 'מַלְוֵה', strongs: 'H3867', meaning: 'lender (to the LORD)', lang: 'hebrew' },
        { word: 'חוֹנֵן', strongs: 'H2603', meaning: 'showing grace/mercy to', lang: 'hebrew' },
        { word: 'דָּל', strongs: 'H1800', meaning: 'poor, needy', lang: 'hebrew' },
        { word: 'גְּמוּל', strongs: 'H1576', meaning: 'reward, recompense', lang: 'hebrew' },
      ],
      financial_keywords: ['lend', 'LORD', 'poor', 'reward', 'charity'],
      financial_relevance: 9,
    },
    'James 2:15': {
      greek_text: 'ἐὰν ἀδελφὸς ἢ ἀδελφὴ γυμνοὶ ὑπάρχωσιν καὶ λειπόμενοι τῆς ἐφημέρου τροφῆς',
      strong_numbers: ['G80', 'G79', 'G1131', 'G5225', 'G3007', 'G2184', 'G5160'],
      original_words: [
        { word: 'γυμνός', strongs: 'G1131', meaning: 'naked, poorly clothed', lang: 'greek' },
        { word: 'τροφή', strongs: 'G5160', meaning: 'food, nourishment', lang: 'greek' },
      ],
      financial_keywords: ['brother', 'need', 'food', 'charity'],
      financial_relevance: 7,
    },
    'Proverbs 11:25': {
      hebrew_text: 'נֶפֶשׁ־בְּרָכָ֥ה תְדֻשָּׁ֑ן וּ֝מַרְוֶ֗ה גַּם־ה֥וּא יוֹרֶֽא',
      strong_numbers: ['H5315', 'H1293', 'H1878', 'H7301'],
      original_words: [
        { word: 'בְּרָכָה', strongs: 'H1293', meaning: 'blessing', lang: 'hebrew' },
        { word: 'דָּשֵׁן', strongs: 'H1878', meaning: 'to prosper, be enriched', lang: 'hebrew' },
        { word: 'מַרְוֶה', strongs: 'H7301', meaning: 'one who waters/refreshes', lang: 'hebrew' },
      ],
      financial_keywords: ['generous', 'blessing', 'prosper', 'refreshes'],
      financial_relevance: 8,
    },
    'Proverbs 25:21': {
      hebrew_text: 'אִם־רָעֵ֣ב שֹׂ֭נַאֲךָ הַאֲכִלֵ֣הוּ לָ֑חֶם וְאִם־צָ֝מֵ֗א הַשְׁקֵ֥הוּ מָֽיִם',
      strong_numbers: ['H7456', 'H8130', 'H398', 'H3899', 'H6771', 'H8248', 'H4325'],
      original_words: [
        { word: 'רָעֵב', strongs: 'H7456', meaning: 'hungry', lang: 'hebrew' },
        { word: 'שׂוֹנֵא', strongs: 'H8130', meaning: 'enemy, one who hates', lang: 'hebrew' },
      ],
      financial_keywords: ['enemy', 'feed', 'generosity', 'mercy'],
      financial_relevance: 6,
    },
    'Isaiah 58:7': {
      hebrew_text: 'הֲל֨וֹא פָרֹ֤ס לָֽרָעֵב֙ לַחְמֶ֔ךָ וַעֲנִיִּ֥ים מְרוּדִ֖ים תָּבִ֣יא בָ֑יִת',
      strong_numbers: ['H6536', 'H7456', 'H3899', 'H6041', 'H4788', 'H935', 'H1004'],
      original_words: [
        { word: 'פָּרַס', strongs: 'H6536', meaning: 'to break, share', lang: 'hebrew' },
        { word: 'רָעֵב', strongs: 'H7456', meaning: 'hungry', lang: 'hebrew' },
        { word: 'עָנִי', strongs: 'H6041', meaning: 'poor, afflicted', lang: 'hebrew' },
      ],
      financial_keywords: ['share', 'bread', 'poor', 'homeless', 'charity'],
      financial_relevance: 8,
    },
    'Luke 12:33': {
      greek_text: 'Πωλήσατε τὰ ὑπάρχοντα ὑμῶν καὶ δότε ἐλεημοσύνην· ποιήσατε ἑαυτοῖς βαλλάντια μὴ παλαιούμενα, θησαυρὸν ἀνέκλειπτον ἐν τοῖς οὐρανοῖς',
      strong_numbers: ['G4453', 'G5224', 'G1325', 'G1654', 'G4160', 'G905', 'G3822', 'G2344', 'G413', 'G3772'],
      original_words: [
        { word: 'πωλέω', strongs: 'G4453', meaning: 'to sell', lang: 'greek' },
        { word: 'ἐλεημοσύνη', strongs: 'G1654', meaning: 'alms, charity', lang: 'greek' },
        { word: 'θησαυρός', strongs: 'G2344', meaning: 'treasure', lang: 'greek' },
      ],
      financial_keywords: ['sell', 'alms', 'treasure', 'heaven', 'charity'],
      financial_relevance: 9,
    },
    'Proverbs 21:13': {
      hebrew_text: 'אֹטֵ֣ם אׇ֭זְנוֹ מִזַּעֲקַת־דָּ֑ל גַּם־ה֥וּא יִ֝קְרָ֗א וְלֹ֣א יֵעָנֶֽה',
      strong_numbers: ['H331', 'H241', 'H2201', 'H1800', 'H7121', 'H6030'],
      original_words: [
        { word: 'אֹטֵם', strongs: 'H331', meaning: 'shuts, closes', lang: 'hebrew' },
        { word: 'דָּל', strongs: 'H1800', meaning: 'poor', lang: 'hebrew' },
      ],
      financial_keywords: ['poor', 'cry', 'ignore', 'charity'],
      financial_relevance: 7,
    },

    // ═══════════════════════════════════════════════════════
    // WISDOM & DISCERNMENT
    // ═══════════════════════════════════════════════════════
    'Proverbs 4:7': {
      hebrew_text: 'רֵאשִׁ֣ית חׇ֭כְמָה קְנֵ֣ה חׇכְמָ֑ה וּבְכׇל־קִ֝נְיָנְךָ֗ קְנֵ֣ה בִינָֽה',
      strong_numbers: ['H7225', 'H2451', 'H7069', 'H3605', 'H7075', 'H998'],
      original_words: [
        { word: 'חׇכְמָה', strongs: 'H2451', meaning: 'wisdom', lang: 'hebrew' },
        { word: 'קָנָה', strongs: 'H7069', meaning: 'to acquire, buy', lang: 'hebrew' },
        { word: 'בִּינָה', strongs: 'H998', meaning: 'understanding', lang: 'hebrew' },
      ],
      financial_keywords: ['wisdom', 'acquire', 'understanding', 'investment'],
      financial_relevance: 9,
    },
    'Proverbs 4:23': {
      hebrew_text: 'מִֽכׇּל־מִ֭שְׁמָר נְצֹ֣ר לִבֶּ֑ךָ כִּֽי־מִ֝מֶּ֗נּוּ תּוֹצְא֥וֹת חַיִּֽים',
      strong_numbers: ['H3605', 'H4929', 'H5341', 'H3820', 'H8444', 'H2416'],
      original_words: [
        { word: 'מִשְׁמָר', strongs: 'H4929', meaning: 'guard, watch', lang: 'hebrew' },
        { word: 'לֵב', strongs: 'H3820', meaning: 'heart', lang: 'hebrew' },
        { word: 'תּוֹצָאוֹת', strongs: 'H8444', meaning: 'issues, outgoings', lang: 'hebrew' },
      ],
      financial_keywords: ['guard', 'heart', 'life', 'protection'],
      financial_relevance: 7,
    },
    'Proverbs 22:1': {
      hebrew_text: 'נִבְחָ֣ר שֵׁ֭ם מֵעֹ֣שֶׁר רָ֑ב מִכֶּ֥סֶף וּ֝מִזָּהָ֗ב חֵ֣ן טֽוֹב',
      strong_numbers: ['H977', 'H8034', 'H6239', 'H7227', 'H3701', 'H2091', 'H2580', 'H2896'],
      original_words: [
        { word: 'שֵׁם', strongs: 'H8034', meaning: 'name, reputation', lang: 'hebrew' },
        { word: 'עֹשֶׁר', strongs: 'H6239', meaning: 'riches, wealth', lang: 'hebrew' },
        { word: 'כֶּסֶף', strongs: 'H3701', meaning: 'silver', lang: 'hebrew' },
        { word: 'זָהָב', strongs: 'H2091', meaning: 'gold', lang: 'hebrew' },
      ],
      financial_keywords: ['name', 'reputation', 'riches', 'silver', 'gold'],
      financial_relevance: 9,
    },
    'Proverbs 12:15': {
      hebrew_text: 'דֶּ֣רֶךְ אֱ֭וִיל יָשָׁ֣ר בְּעֵינָ֑יו וְשֹׁמֵ֖עַ לְעֵצָ֣ה חָכָֽם',
      strong_numbers: ['H1870', 'H191', 'H3477', 'H5869', 'H8085', 'H6098', 'H2450'],
      original_words: [
        { word: 'אֱוִיל', strongs: 'H191', meaning: 'fool', lang: 'hebrew' },
        { word: 'עֵצָה', strongs: 'H6098', meaning: 'counsel, advice', lang: 'hebrew' },
        { word: 'חָכָם', strongs: 'H2450', meaning: 'wise', lang: 'hebrew' },
      ],
      financial_keywords: ['fool', 'advice', 'counsel', 'wise'],
      financial_relevance: 7,
    },
    'James 1:5': {
      greek_text: 'Εἰ δέ τις ὑμῶν λείπεται σοφίας, αἰτείτω παρὰ τοῦ διδόντος θεοῦ πᾶσιν ἁπλῶς καὶ μὴ ὀνειδίζοντος, καὶ δοθήσεται αὐτῷ.',
      strong_numbers: ['G1536', 'G3007', 'G4678', 'G154', 'G1325', 'G2316', 'G3956', 'G574', 'G3679'],
      original_words: [
        { word: 'σοφία', strongs: 'G4678', meaning: 'wisdom', lang: 'greek' },
        { word: 'αἰτέω', strongs: 'G154', meaning: 'to ask, request', lang: 'greek' },
        { word: 'ἁπλῶς', strongs: 'G574', meaning: 'generously, liberally', lang: 'greek' },
      ],
      financial_keywords: ['wisdom', 'ask', 'generously', 'God'],
      financial_relevance: 8,
    },
    'Proverbs 16:16': {
      hebrew_text: 'קְֽנֹה־חׇכְמָ֗ה מַה־טּ֥וֹב מֵחָר֑וּץ וּקְנ֥וֹת בִּ֝ינָ֗ה נִבְחָ֥ר מִכָּֽסֶף',
      strong_numbers: ['H7069', 'H2451', 'H2896', 'H2742', 'H998', 'H977', 'H3701'],
      original_words: [
        { word: 'חׇכְמָה', strongs: 'H2451', meaning: 'wisdom', lang: 'hebrew' },
        { word: 'חָרוּץ', strongs: 'H2742', meaning: 'gold (fine gold)', lang: 'hebrew' },
        { word: 'בִּינָה', strongs: 'H998', meaning: 'understanding', lang: 'hebrew' },
        { word: 'כֶּסֶף', strongs: 'H3701', meaning: 'silver', lang: 'hebrew' },
      ],
      financial_keywords: ['wisdom', 'gold', 'understanding', 'silver', 'value'],
      financial_relevance: 9,
    },

    // ═══════════════════════════════════════════════════════
    // PROSPERITY & BLESSING
    // ═══════════════════════════════════════════════════════
    'Proverbs 10:22': {
      hebrew_text: 'בִּרְכַּ֣ת יְ֭הוָה הִ֣יא תַעֲשִׁ֑יר וְלֹא־יוֹסִ֖ף עֶ֣צֶב עִמָּֽהּ',
      strong_numbers: ['H1293', 'H3068', 'H6238', 'H3254', 'H6089'],
      original_words: [
        { word: 'בִּרְכָּה', strongs: 'H1293', meaning: 'blessing', lang: 'hebrew' },
        { word: 'עָשַׁר', strongs: 'H6238', meaning: 'to be or become rich', lang: 'hebrew' },
        { word: 'עֶצֶב', strongs: 'H6089', meaning: 'sorrow, pain', lang: 'hebrew' },
      ],
      financial_keywords: ['blessing', 'rich', 'sorrow', 'prosperity'],
      financial_relevance: 9,
    },
    '3 John 1:2': {
      greek_text: 'Ἀγαπητέ, περὶ πάντων εὔχομαί σε εὐοδοῦσθαι καὶ ὑγιαίνειν, καθὼς εὐοδοῦταί σου ἡ ψυχή.',
      strong_numbers: ['G27', 'G4012', 'G3956', 'G2172', 'G2137', 'G5198', 'G5590'],
      original_words: [
        { word: 'εὐοδόω', strongs: 'G2137', meaning: 'to prosper, succeed', lang: 'greek' },
        { word: 'ὑγιαίνω', strongs: 'G5198', meaning: 'to be healthy', lang: 'greek' },
        { word: 'ψυχή', strongs: 'G5590', meaning: 'soul', lang: 'greek' },
      ],
      financial_keywords: ['prosper', 'health', 'soul', 'prayer'],
      financial_relevance: 7,
    },
    '1 Samuel 2:7': {
      hebrew_text: 'יְהוָ֖ה מוֹרִ֣ישׁ וּמַעֲשִׁ֑יר מַשְׁפִּ֖יל אַף־מְרוֹמֵֽם',
      strong_numbers: ['H3068', 'H3423', 'H6238', 'H8213', 'H7311'],
      original_words: [
        { word: 'מוֹרִישׁ', strongs: 'H3423', meaning: 'makes poor', lang: 'hebrew' },
        { word: 'מַעֲשִׁיר', strongs: 'H6238', meaning: 'makes rich', lang: 'hebrew' },
        { word: 'מַשְׁפִּיל', strongs: 'H8213', meaning: 'brings low', lang: 'hebrew' },
        { word: 'מְרוֹמֵם', strongs: 'H7311', meaning: 'lifts up', lang: 'hebrew' },
      ],
      financial_keywords: ['poor', 'rich', 'humbles', 'exalts', 'sovereignty'],
      financial_relevance: 8,
    },
    '2 Corinthians 9:8': {
      greek_text: 'δυνατεῖ δὲ ὁ θεὸς πᾶσαν χάριν περισσεῦσαι εἰς ὑμᾶς, ἵνα ἐν παντὶ πάντοτε πᾶσαν αὐτάρκειαν ἔχοντες περισσεύητε εἰς πᾶν ἔργον ἀγαθόν·',
      strong_numbers: ['G1414', 'G2316', 'G3956', 'G5485', 'G4052', 'G3842', 'G841', 'G2192', 'G2041', 'G18'],
      original_words: [
        { word: 'χάρις', strongs: 'G5485', meaning: 'grace', lang: 'greek' },
        { word: 'αὐτάρκεια', strongs: 'G841', meaning: 'sufficiency, contentment', lang: 'greek' },
        { word: 'περισσεύω', strongs: 'G4052', meaning: 'to abound', lang: 'greek' },
      ],
      financial_keywords: ['grace', 'sufficiency', 'abound', 'good works'],
      financial_relevance: 8,
    },
    'Deuteronomy 28:8': {
      hebrew_text: 'יְצַ֨ו יְהוָ֤ה אִתְּךָ֙ אֶת־הַבְּרָכָ֔ה בַּאֲסָמֶ֕יךָ וּבְכֹ֖ל מִשְׁלַ֣ח יָדֶ֑ךָ',
      strong_numbers: ['H6680', 'H3068', 'H1293', 'H618', 'H3605', 'H4916', 'H3027'],
      original_words: [
        { word: 'בְּרָכָה', strongs: 'H1293', meaning: 'blessing', lang: 'hebrew' },
        { word: 'אָסָם', strongs: 'H618', meaning: 'storehouse, barn', lang: 'hebrew' },
        { word: 'מִשְׁלַח', strongs: 'H4916', meaning: 'undertaking, what you put your hand to', lang: 'hebrew' },
      ],
      financial_keywords: ['blessing', 'storehouse', 'endeavor', 'hand'],
      financial_relevance: 9,
    },
    'Proverbs 27:24': {
      hebrew_text: 'כִּ֤י לֹ֣א לְעוֹלָ֣ם חֹ֑סֶן וְאִם־נֵ֝֗זֶר לְד֣וֹר וָדֽוֹר',
      strong_numbers: ['H5769', 'H2633', 'H5145', 'H1755'],
      original_words: [
        { word: 'חֹסֶן', strongs: 'H2633', meaning: 'wealth, treasure', lang: 'hebrew' },
        { word: 'נֵזֶר', strongs: 'H5145', meaning: 'crown', lang: 'hebrew' },
        { word: 'דּוֹר', strongs: 'H1755', meaning: 'generation', lang: 'hebrew' },
      ],
      financial_keywords: ['wealth', 'crown', 'generation', 'impermanence'],
      financial_relevance: 7,
    },

    // ═══════════════════════════════════════════════════════
    // MISCELLANEOUS FINANCIAL WISDOM
    // ═══════════════════════════════════════════════════════
    'Proverbs 11:14': {
      hebrew_text: 'בְּאֵ֣ין תַּ֭חְבֻּלוֹת יִפׇּל־עָ֑ם וּ֝תְשׁוּעָ֗ה בְּרֹ֣ב יוֹעֵֽץ',
      strong_numbers: ['H369', 'H8458', 'H5307', 'H5971', 'H8668', 'H7230', 'H3289'],
      original_words: [
        { word: 'תַּחְבֻּלוֹת', strongs: 'H8458', meaning: 'guidance, counsel', lang: 'hebrew' },
        { word: 'תְּשׁוּעָה', strongs: 'H8668', meaning: 'deliverance, salvation', lang: 'hebrew' },
        { word: 'יוֹעֵץ', strongs: 'H3289', meaning: 'counselor', lang: 'hebrew' },
      ],
      financial_keywords: ['guidance', 'counsel', 'advisors', 'safety'],
      financial_relevance: 8,
    },
    'Proverbs 14:15': {
      hebrew_text: 'פֶּ֭תִי יַאֲמִ֣ין לְכׇל־דָּבָ֑ר וְ֝עָר֗וּם יָבִ֥ין לַאֲשֻׁרֽוֹ',
      strong_numbers: ['H6612', 'H539', 'H3605', 'H1697', 'H6175', 'H995', 'H838'],
      original_words: [
        { word: 'פֶּתִי', strongs: 'H6612', meaning: 'simple, naive', lang: 'hebrew' },
        { word: 'עָרוּם', strongs: 'H6175', meaning: 'prudent, shrewd', lang: 'hebrew' },
      ],
      financial_keywords: ['naive', 'prudent', 'discernment', 'due diligence'],
      financial_relevance: 8,
    },
    'Ecclesiastes 10:19': {
      hebrew_text: 'לִשְׂחוֹק֙ עֹשִׂ֣ים לֶ֔חֶם וְיַ֖יִן יְשַׂמַּ֣ח חַיִּ֑ים וְהַכֶּ֖סֶף יַעֲנֶ֥ה אֶת־הַכֹּֽל',
      strong_numbers: ['H7814', 'H6213', 'H3899', 'H3196', 'H8055', 'H2416', 'H3701', 'H6030', 'H3605'],
      original_words: [
        { word: 'כֶּסֶף', strongs: 'H3701', meaning: 'silver, money', lang: 'hebrew' },
        { word: 'עָנָה', strongs: 'H6030', meaning: 'answers, responds', lang: 'hebrew' },
      ],
      financial_keywords: ['money', 'answers', 'feast', 'wine'],
      financial_relevance: 7,
    },
    'Ecclesiastes 2:14': {
      hebrew_text: 'הֶֽחָכָם֙ עֵינָ֣יו בְּרֹאשׁ֔וֹ וְהַכְּסִ֖יל בַּחֹ֣שֶׁךְ הוֹלֵ֑ךְ',
      strong_numbers: ['H2450', 'H5869', 'H7218', 'H3684', 'H2822', 'H1980'],
      original_words: [
        { word: 'חָכָם', strongs: 'H2450', meaning: 'wise', lang: 'hebrew' },
        { word: 'כְּסִיל', strongs: 'H3684', meaning: 'fool', lang: 'hebrew' },
      ],
      financial_keywords: ['wise', 'fool', 'foresight', 'darkness'],
      financial_relevance: 7,
    },
    'Ecclesiastes 10:18': {
      hebrew_text: 'בַּעֲצַלְתַּ֖יִם יִמַּ֣ךְ הַמְּקָרֶ֑ה וּבְשִׁפְל֥וּת יָ֝דַ֗יִם יִדְלֹ֥ף הַבָּֽיִת',
      strong_numbers: ['H6103', 'H4355', 'H4746', 'H8217', 'H3027', 'H1811', 'H1004'],
      original_words: [
        { word: 'עֲצַלְתַּיִם', strongs: 'H6103', meaning: 'laziness, sloth', lang: 'hebrew' },
        { word: 'בַּיִת', strongs: 'H1004', meaning: 'house', lang: 'hebrew' },
      ],
      financial_keywords: ['laziness', 'neglect', 'decay', 'maintenance'],
      financial_relevance: 7,
    },
    'Ephesians 5:6': {
      greek_text: 'Μηδεὶς ὑμᾶς ἀπατάτω κενοῖς λόγοις· διὰ ταῦτα γὰρ ἔρχεται ἡ ὀργὴ τοῦ θεοῦ ἐπὶ τοὺς υἱοὺς τῆς ἀπειθείας.',
      strong_numbers: ['G3367', 'G538', 'G2756', 'G3056', 'G2064', 'G3709', 'G2316', 'G5207', 'G543'],
      original_words: [
        { word: 'ἀπατάω', strongs: 'G538', meaning: 'to deceive', lang: 'greek' },
        { word: 'κενός', strongs: 'G2756', meaning: 'empty, vain', lang: 'greek' },
      ],
      financial_keywords: ['deceive', 'empty words', 'fraud', 'warning'],
      financial_relevance: 6,
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // One-time seeder - uses direct REST to bypass schema restriction
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const restHeaders = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
  };

  async function restSelect(table: string, query: string) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
      headers: { ...restHeaders, 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`SELECT ${table}: ${await res.text()}`);
    return res.json();
  }

  async function restInsert(table: string, row: Record<string, unknown>) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...restHeaders, 'Prefer': 'return=minimal,resolution=merge-duplicates' },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`INSERT ${table}: ${txt}`);
    }
    return true;
  }

  async function restUpdate(table: string, matchParams: string, updates: Record<string, unknown>) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${matchParams}`, {
      method: 'PATCH',
      headers: restHeaders,
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`UPDATE ${table}: ${txt}`);
    }
    return true;
  }
  try {
    // 1. Get all verses from biblical_knowledge_base
    const bkbVerses = await restSelect('biblical_knowledge_base', 'select=reference,verse_text,category');

    // 2. Get existing comprehensive texts
    const existing = await restSelect('comprehensive_biblical_texts', 'select=book,chapter,verse');

    const existingSet = new Set(
      (existing || []).map((e: any) => `${e.book}|${e.chapter}|${e.verse}`)
    );

    // 3. Get original language data
    const langData = getOriginalLanguageData();

    // 4. Deduplicate references from bkb
    const uniqueRefs = new Map<string, { reference: string; verse_text: string; category: string }>();
    for (const v of (bkbVerses || [])) {
      if (!uniqueRefs.has(v.reference)) {
        uniqueRefs.set(v.reference, v);
      }
    }

    let inserted = 0;
    let skipped = 0;
    let noData = 0;
    const details: { reference: string; status: string }[] = [];

    for (const [ref, verse] of uniqueRefs) {
      const parsed = parseReference(ref);
      if (!parsed) {
        details.push({ reference: ref, status: 'parse_error' });
        continue;
      }

      const key = `${parsed.book}|${parsed.chapter}|${parsed.verse}`;
      if (existingSet.has(key)) {
        // Update existing row with original language data if available
        const lang = langData[ref];
        if (lang) {
          try {
            const matchParams = `book=eq.${encodeURIComponent(parsed.book)}&chapter=eq.${parsed.chapter}&verse=eq.${parsed.verse}`;
            await restUpdate('comprehensive_biblical_texts', matchParams, {
              hebrew_text: lang.hebrew_text || null,
              greek_text: lang.greek_text || null,
              aramaic_text: lang.aramaic_text || null,
              strong_numbers: lang.strong_numbers,
              original_words: lang.original_words,
              financial_keywords: lang.financial_keywords,
              financial_relevance: lang.financial_relevance,
            });
            details.push({ reference: ref, status: 'updated_existing' });
          } catch (e: any) {
            details.push({ reference: ref, status: `update_error: ${e.message}` });
          }
        } else {
          details.push({ reference: ref, status: 'already_exists_no_lang_data' });
        }
        skipped++;
        continue;
      }

      const lang = langData[ref];
      if (!lang) {
        noData++;
        try {
          await restInsert('comprehensive_biblical_texts', {
            book: parsed.book,
            chapter: parsed.chapter,
            verse: parsed.verse,
            kjv_text: verse.verse_text,
            financial_keywords: [verse.category],
            financial_relevance: 5,
          });
          inserted++;
          existingSet.add(key);
          details.push({ reference: ref, status: 'inserted_kjv_only' });
        } catch (e: any) {
          details.push({ reference: ref, status: `insert_error: ${e.message}` });
        }
        continue;
      }

      try {
        await restInsert('comprehensive_biblical_texts', {
          book: parsed.book,
          chapter: parsed.chapter,
          verse: parsed.verse,
          kjv_text: verse.verse_text,
          hebrew_text: lang.hebrew_text || null,
          greek_text: lang.greek_text || null,
          aramaic_text: lang.aramaic_text || null,
          strong_numbers: lang.strong_numbers,
          original_words: lang.original_words,
          financial_keywords: lang.financial_keywords,
          financial_relevance: lang.financial_relevance,
        });
        inserted++;
        existingSet.add(key);
        details.push({ reference: ref, status: 'inserted_full' });
      } catch (e: any) {
        details.push({ reference: ref, status: `insert_error: ${e.message}` });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      totalInBKB: uniqueRefs.size,
      inserted,
      skipped,
      noOriginalData: noData,
      details,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
