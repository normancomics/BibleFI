export interface CompleteBiblicalExample {
  id: string;
  reference: string;
  text: string;
  category: "wealth" | "giving" | "work" | "stewardship" | "taxes" | "debt" | "contentment" | "generosity" | "planning" | "investing" | "business" | "contracts" | "inheritance" | "property" | "farming" | "trading" | "banking" | "partnerships" | "justice" | "wages" | "poverty" | "budgeting" | "saving" | "borrowing" | "lending" | "interest" | "profit" | "loss" | "fraud" | "honesty" | "corruption";
  character?: string;
  story?: string;
  principle: string;
  application: string;
  defiRelevance: string;
  modernParallel: string;
  book: string;
  testament: "Old" | "New";
  financialKeywords: string[];
  riskLevel?: "low" | "medium" | "high";
  timePeriod?: string;
}

export const completeBiblicalFinances: CompleteBiblicalExample[] = [
  // GENESIS - The Foundation
  {
    id: "gen-1-28",
    reference: "Genesis 1:28",
    text: "God blessed them and said to them, 'Be fruitful and increase in number; fill the earth and subdue it. Rule over the fish in the sea and the birds in the sky and over every living creature that moves on the ground.'",
    category: "stewardship",
    character: "Adam & Eve",
    story: "The first mandate for resource management and stewardship",
    principle: "Humans are appointed as stewards of God's creation and resources",
    application: "Manage resources responsibly with environmental and social consciousness",
    defiRelevance: "Invest in sustainable protocols that don't harm communities or environment",
    modernParallel: "ESG investing and responsible asset management",
    book: "Genesis",
    testament: "Old",
    financialKeywords: ["stewardship", "management", "responsibility", "dominion"],
    riskLevel: "low",
    timePeriod: "Creation"
  },
  {
    id: "gen-3-19",
    reference: "Genesis 3:19",
    text: "By the sweat of your brow you will eat your food until you return to the ground, since from it you were taken; for dust you are and to dust you will return.",
    category: "work",
    character: "Adam",
    story: "The curse introduces the necessity of hard work for provision",
    principle: "Work is necessary for provision and survival",
    application: "Understand that earning money requires effort and labor",
    defiRelevance: "Active management and research are needed for DeFi success",
    modernParallel: "No free lunches in investing - everything requires effort",
    book: "Genesis",
    testament: "Old",
    financialKeywords: ["work", "labor", "effort", "provision"],
    riskLevel: "medium",
    timePeriod: "Fall of Man"
  },
  {
    id: "gen-4-2-4",
    reference: "Genesis 4:2-4",
    text: "Abel kept flocks, and Cain worked the soil. In the course of time Cain brought some of the fruits of the soil as an offering to the LORD. And Abel also brought an offering—fat portions from some of the firstborn of his flock.",
    category: "giving",
    character: "Cain & Abel",
    story: "The first recorded tithes and offerings",
    principle: "Give the firstfruits and best portions to God",
    application: "Prioritize giving the best, not leftovers",
    defiRelevance: "Tithe from your best performing assets, not just the scraps",
    modernParallel: "Quality over quantity in charitable giving",
    book: "Genesis",
    testament: "Old",
    financialKeywords: ["offering", "firstfruits", "sacrifice", "giving"],
    riskLevel: "low",
    timePeriod: "Early Civilization"
  },
  {
    id: "gen-13-2",
    reference: "Genesis 13:2",
    text: "Abram had become very wealthy in livestock and in silver and gold.",
    category: "wealth",
    character: "Abraham",
    story: "Abraham's wealth accumulation through God's blessing",
    principle: "God can bless faithful stewards with great wealth",
    application: "Wealth is not inherently evil if gained righteously",
    defiRelevance: "Growing wealth through DeFi can be a blessing when managed biblically",
    modernParallel: "Diversified portfolio of assets (livestock, precious metals)",
    book: "Genesis",
    testament: "Old",
    financialKeywords: ["wealth", "livestock", "silver", "gold", "prosperity"],
    riskLevel: "medium",
    timePeriod: "Patriarchal Period"
  },
  {
    id: "gen-14-18-20",
    reference: "Genesis 14:18-20",
    text: "Then Melchizedek king of Salem brought out bread and wine. He was priest of God Most High, and he blessed Abram... Then Abram gave him a tenth of everything.",
    category: "giving",
    character: "Abraham",
    story: "Abraham's tithe to Melchizedek - first recorded tithe",
    principle: "Tithing predates the Mosaic Law and is a natural response to God's blessing",
    application: "Tithe as an act of worship and acknowledgment of God's provision",
    defiRelevance: "Set up automated 10% tithing from DeFi yields",
    modernParallel: "Systematic charitable giving and tax planning",
    book: "Genesis",
    testament: "Old",
    financialKeywords: ["tithe", "tenth", "offering", "priest"],
    riskLevel: "low",
    timePeriod: "Patriarchal Period"
  },
  {
    id: "gen-23-3-16",
    reference: "Genesis 23:3-16",
    text: "Abraham rose from beside his dead wife and spoke to the Hittites... 'I will pay the price of the field. Accept it from me so I can bury my dead there.' ... Abraham agreed to Ephron's terms and weighed out for him the price he had named in the hearing of the Hittites: four hundred shekels of silver, according to the weight current among the merchants.",
    category: "property",
    character: "Abraham",
    story: "First recorded real estate transaction in the Bible",
    principle: "Honest business dealings and fair market prices",
    application: "Pay fair prices and conduct transparent transactions",
    defiRelevance: "Use transparent, audited protocols with clear pricing",
    modernParallel: "Real estate transactions and property ownership",
    book: "Genesis",
    testament: "Old",
    financialKeywords: ["property", "price", "silver", "transaction", "merchant"],
    riskLevel: "low",
    timePeriod: "Patriarchal Period"
  },
  {
    id: "gen-25-29-34",
    reference: "Genesis 25:29-34",
    text: "Once when Jacob was cooking some stew, Esau came in from the open country, famished... 'Look, I am about to die,' Esau said. 'What good is the birthright to me?' But Jacob said, 'Swear to me first.' So he swore an oath to him, selling his birthright to Jacob. Then Jacob gave Esau some bread and some lentil stew.",
    category: "contracts",
    character: "Jacob & Esau",
    story: "Esau sells his birthright for immediate gratification",
    principle: "Don't trade long-term value for short-term comfort",
    application: "Avoid decisions driven by immediate needs that sacrifice future wealth",
    defiRelevance: "Don't panic sell valuable positions during temporary market stress",
    modernParallel: "Poor financial decisions during emotional states",
    book: "Genesis",
    testament: "Old",
    financialKeywords: ["birthright", "inheritance", "trade", "value"],
    riskLevel: "high",
    timePeriod: "Patriarchal Period"
  },
  {
    id: "gen-30-25-43",
    reference: "Genesis 30:25-43",
    text: "After Rachel gave birth to Joseph, Jacob said to Laban... 'Give me my wages so that I may go to my own place and my own country.'... In this way the man grew exceedingly prosperous and came to own large flocks, and female and male servants, and camels and donkeys.",
    category: "business",
    character: "Jacob",
    story: "Jacob's innovative livestock breeding business with Laban",
    principle: "Innovation and hard work can lead to legitimate business success",
    application: "Use creative but honest methods to build wealth",
    defiRelevance: "Develop innovative DeFi strategies within ethical bounds",
    modernParallel: "Entrepreneurship and business development",
    book: "Genesis",
    testament: "Old",
    financialKeywords: ["wages", "business", "prosperity", "livestock", "servants"],
    riskLevel: "medium",
    timePeriod: "Patriarchal Period"
  },
  {
    id: "gen-37-28",
    reference: "Genesis 37:28",
    text: "So when the Midianite merchants came by, his brothers pulled Joseph up out of the cistern and sold him for twenty shekels of silver to the Ishmaelites.",
    category: "trading",
    character: "Joseph",
    story: "Joseph sold into slavery - the human trafficking trade",
    principle: "Some forms of trade are morally wrong and exploitative",
    application: "Avoid investments that profit from human exploitation",
    defiRelevance: "Don't invest in protocols that exploit users or promote harmful activities",
    modernParallel: "Ethical investing and avoiding exploitation-based profits",
    book: "Genesis",
    testament: "Old",
    financialKeywords: ["merchants", "silver", "trade", "exploitation"],
    riskLevel: "high",
    timePeriod: "Patriarchal Period"
  },
  {
    id: "gen-41-34-36",
    reference: "Genesis 41:34-36",
    text: "Let Pharaoh appoint commissioners over the land to take a fifth of the harvest of Egypt during the seven years of abundance. They should collect all the food of these good years that are coming and store up the grain under the authority of Pharaoh, to be kept in the cities for food. This food should be held in reserve for the country, to be used during the seven years of famine.",
    category: "saving",
    character: "Joseph",
    story: "Joseph's economic plan to save Egypt from famine",
    principle: "Save during times of abundance to prepare for times of scarcity",
    application: "Build emergency funds and save during good economic times",
    defiRelevance: "Accumulate stablecoins during bull markets for bear market opportunities",
    modernParallel: "Economic planning and reserve funds",
    book: "Genesis",
    testament: "Old",
    financialKeywords: ["commissioners", "harvest", "store", "reserve", "famine"],
    riskLevel: "low",
    timePeriod: "Egyptian Period"
  },
  {
    id: "gen-41-56-57",
    reference: "Genesis 41:56-57",
    text: "When the famine had spread over the whole country, Joseph opened all the storehouses and sold grain to the Egyptians, for the famine was severe throughout Egypt. And all the world came to Egypt to buy grain from Joseph because the famine was severe everywhere.",
    category: "business",
    character: "Joseph",
    story: "Joseph's grain trading business during the famine",
    principle: "Wise preparation creates opportunities to serve others and profit",
    application: "Strategic positioning can create win-win scenarios",
    defiRelevance: "Position yourself to provide liquidity during market stress",
    modernParallel: "Strategic business positioning and crisis management",
    book: "Genesis",
    testament: "Old",
    financialKeywords: ["storehouses", "sold", "grain", "business"],
    riskLevel: "medium",
    timePeriod: "Egyptian Period"
  },
  {
    id: "gen-47-13-20",
    reference: "Genesis 47:13-20",
    text: "There was no food, however, in the whole region because the famine was severe... When the money of the people of Egypt and Canaan was gone, all Egypt came to Joseph and said, 'Give us food. Why should we die before your eyes? Our money is all gone.' ... So Joseph bought all the land in Egypt for Pharaoh.",
    category: "property",
    character: "Joseph",
    story: "Joseph's acquisition of all Egyptian land for Pharaoh",
    principle: "Economic crises can lead to massive wealth transfers",
    application: "Be prepared for economic downturns to create opportunities",
    defiRelevance: "Position for opportunities during DeFi winter periods",
    modernParallel: "Asset acquisition during economic downturns",
    book: "Genesis",
    testament: "Old",
    financialKeywords: ["money", "land", "bought", "wealth transfer"],
    riskLevel: "high",
    timePeriod: "Egyptian Period"
  },
  
  // EXODUS - Liberation and Law
  {
    id: "exo-12-35-36",
    reference: "Exodus 12:35-36",
    text: "The Israelites did as Moses instructed and asked the Egyptians for articles of silver and gold and for clothing. The LORD had made the Egyptians favorably disposed toward the people, and they gave them what they asked for; so they plundered the Egyptians.",
    category: "wealth",
    character: "Israelites",
    story: "The Israelites receive wealth from the Egyptians before leaving",
    principle: "God can provide wealth through unexpected means",
    application: "Be open to divine provision from unexpected sources",
    defiRelevance: "Opportunities for wealth can come from surprising protocols or airdrops",
    modernParallel: "Unexpected windfalls and providential opportunities",
    book: "Exodus",
    testament: "Old",
    financialKeywords: ["silver", "gold", "clothing", "plundered"],
    riskLevel: "low",
    timePeriod: "Exodus"
  },
  {
    id: "exo-16-19-20",
    reference: "Exodus 16:19-20",
    text: "Then Moses said to them, 'No one is to keep any of it until morning.' However, some of them paid no attention to Moses; they kept part of it until morning, but it was full of maggots and began to smell.",
    category: "contentment",
    character: "Israelites",
    story: "The manna teaches about daily provision and contentment",
    principle: "Hoarding beyond your needs leads to waste and corruption",
    application: "Take only what you need and trust God for daily provision",
    defiRelevance: "Don't over-leverage or hoard excessively; maintain reasonable positions",
    modernParallel: "Living within means and avoiding excessive accumulation",
    book: "Exodus",
    testament: "Old",
    financialKeywords: ["keeping", "hoarding", "provision", "waste"],
    riskLevel: "medium",
    timePeriod: "Wilderness"
  },
  {
    id: "exo-20-15",
    reference: "Exodus 20:15",
    text: "You shall not steal.",
    category: "honesty",
    character: "Moses",
    story: "The eighth commandment protecting property rights",
    principle: "Respect for property rights is fundamental to economic justice",
    application: "Never take what doesn't belong to you through any means",
    defiRelevance: "Don't exploit bugs or vulnerabilities in protocols to steal funds",
    modernParallel: "Property rights and honest business practices",
    book: "Exodus",
    testament: "Old",
    financialKeywords: ["steal", "property", "rights"],
    riskLevel: "high",
    timePeriod: "Sinai"
  },
  {
    id: "exo-22-25",
    reference: "Exodus 22:25",
    text: "If you lend money to one of my people among you who is needy, do not treat it like a business deal; charge no interest.",
    category: "lending",
    character: "Moses",
    story: "Laws about lending to the poor without interest",
    principle: "Lending to the poor should be motivated by compassion, not profit",
    application: "Help those in need without exploiting their desperation",
    defiRelevance: "Consider zero-interest lending pools for those in genuine need",
    modernParallel: "Microfinance and compassionate lending",
    book: "Exodus",
    testament: "Old",
    financialKeywords: ["lend", "money", "needy", "interest"],
    riskLevel: "low",
    timePeriod: "Sinai"
  },
  {
    id: "exo-25-1-2",
    reference: "Exodus 25:1-2",
    text: "The LORD said to Moses, 'Tell the Israelites to bring me an offering. You are to receive the offering for me from everyone whose heart prompts them to give.'",
    category: "giving",
    character: "Moses",
    story: "Voluntary offerings for the tabernacle construction",
    principle: "Giving should be voluntary and from the heart",
    application: "Give willingly and joyfully, not under compulsion",
    defiRelevance: "Choose charitable DAOs and giving that genuinely moves your heart",
    modernParallel: "Voluntary charitable giving and crowdfunding",
    book: "Exodus",
    testament: "Old",
    financialKeywords: ["offering", "heart", "prompts", "give"],
    riskLevel: "low",
    timePeriod: "Sinai"
  },
  {
    id: "exo-30-11-16",
    reference: "Exodus 30:11-16",
    text: "Then the LORD said to Moses, 'When you take a census of the Israelites to count them, each one must pay the LORD a ransom for his life at the time he is counted... Each one who crosses over to those already counted is to give a half shekel... This half shekel is an offering to the LORD.'",
    category: "taxes",
    character: "Moses",
    story: "The temple tax instituted for tabernacle maintenance",
    principle: "Contributing to religious institutions is both privilege and responsibility",
    application: "Support your church and religious organizations financially",
    defiRelevance: "Consider allocating a portion of DeFi gains to church building funds",
    modernParallel: "Church taxes and religious institutional support",
    book: "Exodus",
    testament: "Old",
    financialKeywords: ["census", "ransom", "shekel", "offering"],
    riskLevel: "low",
    timePeriod: "Sinai"
  },
  {
    id: "exo-36-3-7",
    reference: "Exodus 36:3-7",
    text: "They received from Moses all the offerings the Israelites had brought to carry out the work of constructing the sanctuary. And the people continued to bring freewill offerings morning after morning... Then Moses gave an order and they sent this word throughout the camp: 'No man or woman is to make anything else as an offering for the sanctuary.' And so the people were restrained from bringing more, because what they had was more than enough to do all the work.",
    category: "generosity",
    character: "Israelites",
    story: "The people gave so generously that Moses had to stop them",
    principle: "Generous giving can exceed even the greatest needs",
    application: "When God moves hearts to give, the results can be overwhelming",
    defiRelevance: "Sometimes the best DeFi opportunities are those that give back to community",
    modernParallel: "Successful fundraising campaigns and generous communities",
    book: "Exodus",
    testament: "Old",
    financialKeywords: ["offerings", "freewill", "enough", "restrained"],
    riskLevel: "low",
    timePeriod: "Sinai"
  },

  // LEVITICUS - Detailed Financial Laws
  {
    id: "lev-19-35-36",
    reference: "Leviticus 19:35-36",
    text: "Do not use dishonest standards when measuring length, weight or quantity. Use honest scales and honest weights, an honest ephah and an honest hin.",
    category: "honesty",
    character: "Moses",
    story: "Laws requiring honest business measurements",
    principle: "Business transactions must be conducted with complete honesty",
    application: "Be completely transparent and honest in all business dealings",
    defiRelevance: "Use transparent protocols with clear metrics and avoid manipulated ones",
    modernParallel: "Accurate financial reporting and honest business practices",
    book: "Leviticus",
    testament: "Old",
    financialKeywords: ["measuring", "scales", "weights", "honest"],
    riskLevel: "low",
    timePeriod: "Sinai"
  },
  {
    id: "lev-25-8-17",
    reference: "Leviticus 25:8-17",
    text: "Count off seven sabbath years—seven times seven years—so that the seven sabbath years amount to a period of forty-nine years. Then have the trumpet sounded everywhere on the tenth day of the seventh month; on the Day of Atonement sound the trumpet throughout your land. Consecrate the fiftieth year and proclaim liberty throughout the land to all its inhabitants. It shall be a jubilee for you; each of you is to return to your family property and to your own clan.",
    category: "justice",
    character: "Moses",
    story: "The Year of Jubilee - periodic wealth redistribution",
    principle: "Economic systems should include mechanisms to prevent permanent inequality",
    application: "Support systems that give people second chances and prevent permanent poverty",
    defiRelevance: "Look for protocols that include wealth redistribution or community support mechanisms",
    modernParallel: "Debt forgiveness programs and economic reset mechanisms",
    book: "Leviticus",
    testament: "Old",
    financialKeywords: ["jubilee", "liberty", "property", "clan"],
    riskLevel: "low",
    timePeriod: "Sinai"
  },
  {
    id: "lev-25-23-24",
    reference: "Leviticus 25:23-24",
    text: "The land must not be sold permanently, because the land is mine and you reside in my land as foreigners and strangers. Throughout the land that you hold as a possession, you must provide for the redemption of the land.",
    category: "property",
    character: "Moses",
    story: "God's ownership of the land and redemption rights",
    principle: "All property ultimately belongs to God; we are merely stewards",
    application: "Hold property and wealth with the understanding that God is the true owner",
    defiRelevance: "Remember that even digital assets are held in stewardship for God",
    modernParallel: "Stewardship view of property ownership",
    book: "Leviticus",
    testament: "Old",
    financialKeywords: ["land", "sold", "possession", "redemption"],
    riskLevel: "low",
    timePeriod: "Sinai"
  },
  {
    id: "lev-25-35-37",
    reference: "Leviticus 25:35-37",
    text: "If any of your fellow Israelites become poor and are unable to support themselves among you, help them as you would a foreigner and stranger, so they can continue to live among you. Do not take interest or any profit from them, but fear your God, so that they may continue to live among you. You must not lend them money at interest or sell them food at a profit.",
    category: "lending",
    character: "Moses",
    story: "Laws about lending to the poor without interest",
    principle: "Don't profit from the desperation of the poor",
    application: "Help those in financial distress without taking advantage",
    defiRelevance: "Avoid predatory lending protocols; support those that help the financially vulnerable",
    modernParallel: "Anti-predatory lending laws and ethical finance",
    book: "Leviticus",
    testament: "Old",
    financialKeywords: ["poor", "support", "interest", "profit"],
    riskLevel: "low",
    timePeriod: "Sinai"
  },
  {
    id: "lev-27-30-32",
    reference: "Leviticus 27:30-32",
    text: "A tithe of everything from the land, whether grain from the soil or fruit from the trees, belongs to the LORD; it is holy to the LORD. Whoever would redeem any of their tithe must add a fifth of the value to it. Every tithe of the herd and flock—every tenth animal that passes under the shepherd's rod—will be holy to the LORD.",
    category: "giving",
    character: "Moses",
    story: "The law of tithing established",
    principle: "The first tenth of all production belongs to God",
    application: "Consistently give the first 10% of income to God's work",
    defiRelevance: "Set up automated tithing from all DeFi yields and gains",
    modernParallel: "Systematic charitable giving and tax-deductible donations",
    book: "Leviticus",
    testament: "Old",
    financialKeywords: ["tithe", "land", "grain", "fruit", "herd", "flock"],
    riskLevel: "low",
    timePeriod: "Sinai"
  },

  // NUMBERS - Wilderness Economics
  {
    id: "num-18-21-24",
    reference: "Numbers 18:21-24",
    text: "I give to the Levites all the tithes in Israel as their inheritance in return for the work they do while serving at the tent of meeting... It is the Levites' inheritance. That is why I said concerning them: 'They will have no inheritance among the Israelites.'",
    category: "giving",
    character: "Moses",
    story: "Tithes designated for supporting full-time ministry",
    principle: "Those who serve God full-time deserve financial support from the community",
    application: "Support pastors, missionaries, and full-time ministry workers",
    defiRelevance: "Direct some DeFi gains to support full-time Christian workers",
    modernParallel: "Clergy support and ministry funding",
    book: "Numbers",
    testament: "Old",
    financialKeywords: ["tithes", "Levites", "inheritance", "serving"],
    riskLevel: "low",
    timePeriod: "Wilderness"
  },
  {
    id: "num-31-25-30",
    reference: "Numbers 31:25-30",
    text: "The LORD said to Moses, 'You and Eleazar the priest and the family heads of the community are to count all the people and animals that were captured. Divide the spoils equally between the soldiers who took part in the battle and the rest of the community. From the soldiers who fought in the battle, set apart as tribute for the LORD one out of every five hundred, whether people, cattle, donkeys or sheep.'",
    category: "taxes",
    character: "Moses",
    story: "Division of war spoils and tribute to God",
    principle: "Even gains from conflict should include tribute to God",
    application: "Give to God from all types of income, even unexpected gains",
    defiRelevance: "Include God in profits from all trading strategies, even arbitrage",
    modernParallel: "Capital gains taxes and profit sharing",
    book: "Numbers",
    testament: "Old",
    financialKeywords: ["spoils", "divide", "tribute", "five hundred"],
    riskLevel: "medium",
    timePeriod: "Wilderness"
  },

  // DEUTERONOMY - Renewed Covenant Economics
  {
    id: "deu-8-17-18",
    reference: "Deuteronomy 8:17-18",
    text: "You may say to yourself, 'My power and the strength of my hands have produced this wealth for me.' But remember the LORD your God, for it is he who gives you the ability to produce wealth, and so confirms his covenant, which he swore to your ancestors, as it is today.",
    category: "wealth",
    character: "Moses",
    story: "Warning against pride in wealth accumulation",
    principle: "God is the ultimate source of wealth-building ability",
    application: "Remain humble and grateful for financial success",
    defiRelevance: "Acknowledge God as the source of wisdom for successful DeFi strategies",
    modernParallel: "Humility in business success and gratitude for opportunities",
    book: "Deuteronomy",
    testament: "Old",
    financialKeywords: ["power", "strength", "wealth", "ability"],
    riskLevel: "medium",
    timePeriod: "Pre-Conquest"
  },
  {
    id: "deu-14-22-23",
    reference: "Deuteronomy 14:22-23",
    text: "Be sure to set aside a tenth of all that your fields produce each year. Eat the tithe of your grain, new wine and olive oil, and the firstborn of your herds and flocks in the presence of the LORD your God at the place he will choose as a dwelling for his Name, so that you may learn to revere the LORD your God always.",
    category: "giving",
    character: "Moses",
    story: "The celebratory aspect of tithing",
    principle: "Tithing should include celebration and fellowship with God",
    application: "Make giving a joyful celebration, not a burden",
    defiRelevance: "Celebrate DeFi gains with gratitude and share the joy with your church community",
    modernParallel: "Charitable events and celebratory giving",
    book: "Deuteronomy",
    testament: "Old",
    financialKeywords: ["tenth", "fields", "produce", "tithe"],
    riskLevel: "low",
    timePeriod: "Pre-Conquest"
  },
  {
    id: "deu-15-1-6",
    reference: "Deuteronomy 15:1-6",
    text: "At the end of every seven years you must cancel debts. This is how it is to be done: Every creditor shall cancel the loan they have made to their fellow Israelite. They shall not require payment from anyone among their own people, because the LORD's time for canceling debts has been proclaimed.",
    category: "debt",
    character: "Moses",
    story: "The seven-year debt cancellation law",
    principle: "Debt should not become permanent bondage",
    application: "Consider debt forgiveness and avoid trapping people in permanent debt",
    defiRelevance: "Support protocols that don't create permanent debt slavery",
    modernParallel: "Bankruptcy laws and debt forgiveness programs",
    book: "Deuteronomy",
    testament: "Old",
    financialKeywords: ["seven years", "cancel", "debts", "creditor"],
    riskLevel: "low",
    timePeriod: "Pre-Conquest"
  },
  {
    id: "deu-15-7-11",
    reference: "Deuteronomy 15:7-11",
    text: "If anyone is poor among your fellow Israelites in any of the towns of the land the LORD your God is giving you, do not be hardhearted or tightfisted toward them. Rather, be openhanded and freely lend them whatever they need... Give generously to them and do so without a grudging heart; then because of this the LORD your God will bless you in all your work and in everything you put your hand to.",
    category: "generosity",
    character: "Moses",
    story: "Commands about generosity to the poor",
    principle: "Generous giving to the poor brings God's blessing",
    application: "Give freely and cheerfully to those in need",
    defiRelevance: "Allocate DeFi gains to help those experiencing financial hardship",
    modernParallel: "Social welfare and charitable giving",
    book: "Deuteronomy",
    testament: "Old",
    financialKeywords: ["poor", "openhanded", "lend", "generously"],
    riskLevel: "low",
    timePeriod: "Pre-Conquest"
  },
  {
    id: "deu-16-16-17",
    reference: "Deuteronomy 16:16-17",
    text: "Three times a year all your men must appear before the LORD your God at the place he will choose: at the Festival of Unleavened Bread, the Festival of Weeks and the Festival of Tabernacles. No one should appear before the LORD empty-handed: Each of you must bring a gift in proportion to the way the LORD your God has blessed you.",
    category: "giving",
    character: "Moses",
    story: "Proportional giving at religious festivals",
    principle: "Giving should be proportional to God's blessing in your life",
    application: "Give more when God has blessed you with more",
    defiRelevance: "Increase tithing percentages when DeFi profits are higher",
    modernParallel: "Progressive charitable giving and tithing",
    book: "Deuteronomy",
    testament: "Old",
    financialKeywords: ["gift", "proportion", "blessed"],
    riskLevel: "low",
    timePeriod: "Pre-Conquest"
  },
  {
    id: "deu-17-17",
    reference: "Deuteronomy 17:17",
    text: "He must not take many wives, or his heart will be led astray. He must not accumulate large amounts of silver and gold.",
    category: "wealth",
    character: "Future Kings",
    story: "Restrictions on royal wealth accumulation",
    principle: "Even leaders should not accumulate excessive wealth",
    application: "Avoid excessive accumulation that might corrupt your heart",
    defiRelevance: "Set reasonable wealth targets; don't let greed drive investment decisions",
    modernParallel: "Executive compensation limits and wealth inequality concerns",
    book: "Deuteronomy",
    testament: "Old",
    financialKeywords: ["accumulate", "silver", "gold"],
    riskLevel: "medium",
    timePeriod: "Pre-Conquest"
  },
  {
    id: "deu-23-19-20",
    reference: "Deuteronomy 23:19-20",
    text: "Do not charge a fellow Israelite interest, whether on money or food or anything else that may earn interest. You may charge a foreigner interest, but not a fellow Israelite, so that the LORD your God may bless you in everything you put your hand to in the land you are entering to possess.",
    category: "interest",
    character: "Moses",
    story: "Laws about charging interest on loans",
    principle: "Different standards may apply to community members versus outsiders",
    application: "Give preferential treatment to fellow believers in financial matters",
    defiRelevance: "Consider offering better terms to Christians in business dealings",
    modernParallel: "Community-based lending and preferential rates",
    book: "Deuteronomy",
    testament: "Old",
    financialKeywords: ["interest", "money", "food", "foreigner"],
    riskLevel: "medium",
    timePeriod: "Pre-Conquest"
  },
  {
    id: "deu-24-10-13",
    reference: "Deuteronomy 24:10-13",
    text: "When you make a loan of any kind to your neighbor, do not go into their house to get what is offered to you as a pledge. Stay outside and let the neighbor to whom you are making the loan bring the pledge out to you... Return the cloak by sunset so that your neighbor may sleep in it. Then they will thank you, and it will be regarded as a righteous act in the sight of the LORD your God.",
    category: "lending",
    character: "Moses",
    story: "Respectful and compassionate lending practices",
    principle: "Lending should be done with dignity and compassion",
    application: "Treat borrowers with respect and consider their basic needs",
    defiRelevance: "Choose lending protocols that don't exploit or shame borrowers",
    modernParallel: "Dignified lending practices and borrower protection laws",
    book: "Deuteronomy",
    testament: "Old",
    financialKeywords: ["loan", "pledge", "cloak", "righteous"],
    riskLevel: "low",
    timePeriod: "Pre-Conquest"
  },
  {
    id: "deu-24-14-15",
    reference: "Deuteronomy 24:14-15",
    text: "Do not take advantage of a hired worker who is poor and needy, whether that worker is a fellow Israelite or a foreigner residing in one of your towns. Pay them their wages each day before sunset, because they are poor and are counting on it. Otherwise they may cry to the LORD against you, and you will be guilty of sin.",
    category: "wages",
    character: "Moses",
    story: "Fair treatment of workers and timely payment",
    principle: "Workers deserve prompt and fair payment for their labor",
    application: "Pay employees and contractors promptly and fairly",
    defiRelevance: "Ensure fair compensation for all participants in DeFi protocols",
    modernParallel: "Labor laws and fair wage practices",
    book: "Deuteronomy",
    testament: "Old",
    financialKeywords: ["hired worker", "poor", "wages", "sunset"],
    riskLevel: "low",
    timePeriod: "Pre-Conquest"
  },
  {
    id: "deu-25-13-16",
    reference: "Deuteronomy 25:13-16",
    text: "Do not have two differing weights in your bag—one heavy, one light. Do not have two differing measures in your house—one large, one small. You must have accurate and honest weights and measures, so that you may live long in the land the LORD your God is giving you. For the LORD your God detests anyone who does these things, anyone who deals dishonestly.",
    category: "honesty",
    character: "Moses",
    story: "Prohibition against dishonest business practices",
    principle: "Complete honesty in business dealings is required by God",
    application: "Use consistent, honest standards in all business transactions",
    defiRelevance: "Use protocols with transparent, consistent metrics and avoid manipulated ones",
    modernParallel: "Standardized measurements and honest business practices",
    book: "Deuteronomy",
    testament: "Old",
    financialKeywords: ["weights", "measures", "accurate", "honest"],
    riskLevel: "low",
    timePeriod: "Pre-Conquest"
  },

  // Additional entries continuing through all 66 books...
  // JOSHUA - Conquest and Land Distribution
  {
    id: "jos-6-17-19",
    reference: "Joshua 6:17-19",
    text: "The city and all that is in it are to be devoted to the LORD. Only Rahab the prostitute and all who are with her in her house shall be spared... But keep away from the devoted things, so that you will not bring about your own destruction by taking any of them. Otherwise you will make the camp of Israel liable to destruction and bring trouble on it. All the silver and gold and the articles of bronze and iron are sacred to the LORD and must go into his treasury.",
    category: "giving",
    character: "Joshua",
    story: "The devoted things of Jericho belonged to God",
    principle: "First victories should be dedicated entirely to God",
    application: "Consider dedicating first major financial successes entirely to God",
    defiRelevance: "Consider giving the first major DeFi gains completely to ministry",
    modernParallel: "Dedicating business first fruits to charitable causes",
    book: "Joshua",
    testament: "Old",
    financialKeywords: ["devoted", "silver", "gold", "treasury"],
    riskLevel: "low",
    timePeriod: "Conquest"
  },
  {
    id: "jos-7-20-21",
    reference: "Joshua 7:20-21",
    text: "Achan replied, 'It is true! I have sinned against the LORD, the God of Israel. This is what I have done: When I saw in the plunder a beautiful robe from Babylonia, two hundred shekels of silver and a bar of gold weighing fifty shekels, I coveted them and took them. They are hidden in the ground inside my tent, with the silver underneath.'",
    category: "fraud",
    character: "Achan",
    story: "Achan's theft of devoted things brings judgment",
    principle: "Hidden financial sin affects the entire community",
    application: "Financial dishonesty has consequences beyond just yourself",
    defiRelevance: "Avoid taking advantage of protocol vulnerabilities or insider information",
    modernParallel: "Corporate fraud and insider trading consequences",
    book: "Joshua",
    testament: "Old",
    financialKeywords: ["plunder", "robe", "silver", "gold", "coveted"],
    riskLevel: "high",
    timePeriod: "Conquest"
  }

  // Continue with all remaining books... (This is a sample of the comprehensive structure)
  // The complete file would include every financial example from all 66 books
];

export const getExamplesByCategory = (category: CompleteBiblicalExample["category"]) => {
  return completeBiblicalFinances.filter(example => example.category === category);
};

export const getExamplesByCharacter = (character: string) => {
  return completeBiblicalFinances.filter(example => 
    example.character?.toLowerCase().includes(character.toLowerCase())
  );
};

export const getExamplesByBook = (book: string) => {
  return completeBiblicalFinances.filter(example => example.book === book);
};

export const getExamplesByTestament = (testament: "Old" | "New") => {
  return completeBiblicalFinances.filter(example => example.testament === testament);
};

export const searchExamples = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return completeBiblicalFinances.filter(example => 
    example.text.toLowerCase().includes(lowerQuery) ||
    example.principle.toLowerCase().includes(lowerQuery) ||
    example.application.toLowerCase().includes(lowerQuery) ||
    example.modernParallel.toLowerCase().includes(lowerQuery) ||
    example.financialKeywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
  );
};

export const getRandomExample = () => {
  return completeBiblicalFinances[Math.floor(Math.random() * completeBiblicalFinances.length)];
};

export const getAllCategories = () => {
  const categories = new Set<string>();
  completeBiblicalFinances.forEach(example => {
    categories.add(example.category);
  });
  return Array.from(categories);
};

export const getAllCharacters = () => {
  const characters = new Set<string>();
  completeBiblicalFinances.forEach(example => {
    if (example.character) {
      characters.add(example.character);
    }
  });
  return Array.from(characters);
};

export const getAllBooks = () => {
  const books = new Set<string>();
  completeBiblicalFinances.forEach(example => {
    books.add(example.book);
  });
  return Array.from(books);
};