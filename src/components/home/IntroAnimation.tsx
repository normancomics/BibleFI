
import React, { useEffect, useState } from "react";
import { useSound } from "@/contexts/SoundContext";
import { GlowingText } from "@/components/ui/tailwind-extensions";

interface IntroAnimationProps {
  onComplete: () => void;
}

const biblicalScenes = [
  {
    id: "scene1",
    kjv: "\"In the beginning God created the heaven and the earth.\"",
    reference: "Genesis 1:1",
    hebrew: "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ",
    greek: "Ἐν ἀρχῇ ἐποίησεν ὁ θεὸς τὸν οὐρανὸν καὶ τὴν γῆν",
    aramaic: "בְּקַדְמִין בְּרָא יְיָ יָת שְׁמַיָּא וְיָת אַרְעָא",
    sound: "powerup"
  },
  {
    id: "scene2",
    kjv: "\"For the LORD giveth wisdom: out of his mouth cometh knowledge and understanding.\"",
    reference: "Proverbs 2:6",
    hebrew: "כִּי יְהוָה יִתֵּן חָכְמָה מִפִּיו דַּעַת וּתְבוּנָה",
    greek: "ὅτι κύριος δίδωσιν σοφίαν καὶ ἀπὸ προσώπου αὐτοῦ γνῶσις καὶ σύνεσις",
    aramaic: "אֲרֵי יְיָ יְהַב חָכְמְתָא מִפּוּמֵיהּ מַדְּעָא וְסוּכְלְתָנוּ",
    sound: "scroll"
  },
  {
    id: "scene3",
    kjv: "\"Bring ye all the tithes into the storehouse, that there may be meat in mine house.\"",
    reference: "Malachi 3:10",
    hebrew: "הָבִיאוּ אֶת־כָּל־הַמַּעֲשֵׂר אֶל־בֵּית הָאוֹצָר",
    greek: "εἰσενέγκατε πάντα τὰ ἐπιδέκατα εἰς τὰ δοχεῖα",
    aramaic: "אַיתוֹ יָת כָּל מַעְשְׂרַיָּא לְבֵית גִּנְזַיָּא",
    sound: "coin"
  },
  {
    id: "scene4",
    kjv: "\"A faithful man shall abound with blessings: but he that maketh haste to be rich shall not be innocent.\"",
    reference: "Proverbs 28:20",
    hebrew: "אִישׁ אֱמוּנוֹת רַב־בְּרָכוֹת וְאָץ לְהַעֲשִׁיר לֹא יִנָּקֶה",
    greek: "ἀνὴρ πιστὸς πολυευλογηθήσεται ὁ δὲ κακὸς οὐκ ἀτιμώρητος ἔσται",
    aramaic: "גַּבְרָא מְהֵימָנָא סַגִּי בִּרְכָן וּדְמִסְתַּרְהַב לְאִתְעַתָּרָא לָא יִזְכֵּי",
    sound: "select"
  },
  {
    id: "scene5",
    kjv: "\"Wealth gotten by vanity shall be diminished: but he that gathereth by labour shall increase.\"",
    reference: "Proverbs 13:11",
    hebrew: "הוֹן מֵהֶבֶל יִמְעָט וְקֹבֵץ עַל־יָד יַרְבֶּה",
    greek: "ὕπαρξις ἐπισπουδαζομένη μετὰ ἀνομίας ἐλάσσων γίνεται",
    aramaic: "נִכְסִין דְּמִתְבַּהֲלִין יִזְעֲרוּן וּדְכָנֵשׁ עַל יְדָא יַסְגֵּי",
    sound: "coin"
  },
  {
    id: "scene6",
    kjv: "\"Render therefore unto Caesar the things which are Caesar's; and unto God the things that are God's.\"",
    reference: "Matthew 22:21",
    hebrew: "תְּנוּ לְקֵיסָר אֶת אֲשֶׁר לְקֵיסָר וְלֵאלֹהִים אֶת אֲשֶׁר לֵאלֹהִים",
    greek: "ἀπόδοτε οὖν τὰ Καίσαρος Καίσαρι καὶ τὰ τοῦ θεοῦ τῷ θεῷ",
    aramaic: "הַבוּ הָכִיל דְּקֵיסָר לְקֵיסָר וְדַאלָהָא לַאלָהָא",
    sound: "powerup"
  },
  {
    id: "scene7",
    kjv: "\"Behold, I have given thee a wise and an understanding heart; so that there was none like thee before thee, neither after thee shall any arise like unto thee.\"",
    reference: "1 Kings 3:12",
    hebrew: "הִנֵּה נָתַתִּי לְךָ לֵב חָכָם וְנָבוֹן אֲשֶׁר כָּמוֹךָ לֹא הָיָה לְפָנֶיךָ וְאַחֲרֶיךָ לֹא יָקוּם כָּמוֹךָ",
    greek: "ἰδοὺ δέδωκά σοι καρδίαν φρονίμην καὶ σοφήν ὡς σὺ οὐ γέγονεν ἔμπροσθέν σου καὶ μετὰ σὲ οὐκ ἀναστήσεται ὅμοιός σοι",
    aramaic: "הָא יְהַבִית לָךְ לִבָּא חַכִּימָא וּסָכְלְתָנָא דִּכְוָתָךְ לָא הֲוָה קֳדָמָךְ וּבָתְרָךְ לָא יְקוּם כְּוָתָךְ",
    sound: "scroll"
  },
  {
    id: "scene8",
    kjv: "\"And let them gather all the food of those good years that come, and lay up corn under the hand of Pharaoh, and let them keep food in the cities.\"",
    reference: "Genesis 41:35-36",
    hebrew: "וְיִקְבְּצוּ אֶת־כָּל־אֹכֶל הַשָּׁנִים הַטֹּבוֹת הַבָּאֹת וְיִצְבְּרוּ בָר תַּחַת יַד פַּרְעֹה",
    greek: "καὶ συναγαγέτωσαν πάντα τὰ βρώματα τῶν ἐτῶν τῶν ἀγαθῶν τῶν ἐρχομένων καὶ συναχθήτω σῖτος ὑπὸ χεῖρα Φαραω",
    aramaic: "וְיִכְנְשׁוּן יָת כָּל עִיבוּרָא דִּשְׁנַיָּא טָבָתָא דְּאָתְיָן וְיִצְבְּרוּן עִיבוּרָא תְּחוֹת יְדָא דְּפַרְעֹה",
    sound: "coin"
  },
  {
    id: "scene9",
    kjv: "\"Well done, thou good and faithful servant: thou hast been faithful over a few things, I will make thee ruler over many things.\"",
    reference: "Matthew 25:21",
    hebrew: "יָפֶה עָשִׂיתָ עֶבֶד טוֹב וְנֶאֱמָן עַל מְעַט הָיִיתָ נֶאֱמָן עַל הַרְבֵּה אֲשִׂימְךָ",
    greek: "εὖ δοῦλε ἀγαθὲ καὶ πιστέ ἐπὶ ὀλίγα ἦς πιστός ἐπὶ πολλῶν σε καταστήσω",
    aramaic: "יָאוּת עַבְדָּא טָבָא וּמְהֵימָנָא עַל קַלִּיל הֲוַיתְּ מְהֵימָן עַל סַגִּי אֲמַנִּנָךְ",
    sound: "success"
  },
  {
    id: "scene10",
    kjv: "\"But he that received seed into the good ground is he that heareth the word, and understandeth it; which also beareth fruit, and bringeth forth, some an hundredfold, some sixty, some thirty.\"",
    reference: "Matthew 13:23",
    hebrew: "וְהַנִּזְרָע עַל הָאֲדָמָה הַטּוֹבָה הוּא הַשֹּׁמֵעַ אֶת הַדָּבָר וּמֵבִין אֹתוֹ וְהוּא עֹשֶׂה פְרִי",
    greek: "ὁ δὲ ἐπὶ τὴν καλὴν γῆν σπαρείς οὗτός ἐστιν ὁ τὸν λόγον ἀκούων καὶ συνιείς ὃς δὴ καρποφορεῖ",
    aramaic: "וְהוּ דְּאִתְזְרַע בְּאַרְעָא טָבְתָא הוּ דְּשָׁמַע מִלְּתָא וּמִסְתַּכַּל בָּהּ וְעָבֵד פֵּירֵי",
    sound: "scroll"
  },
  {
    id: "scene11",
    kjv: "\"He that is faithful in that which is least is faithful also in much: and he that is unjust in the least is unjust also in much.\"",
    reference: "Luke 16:10",
    hebrew: "הַנֶּאֱמָן בִּמְעַט גַּם בְּהַרְבֵּה נֶאֱמָן וְהַמְעַוֵּל בִּמְעַט גַּם בְּהַרְבֵּה מְעַוֵּל",
    greek: "ὁ πιστὸς ἐν ἐλαχίστῳ καὶ ἐν πολλῷ πιστός ἐστιν καὶ ὁ ἐν ἐλαχίστῳ ἄδικος καὶ ἐν πολλῷ ἄδικός ἐστιν",
    aramaic: "מַן דִּמְהֵימָן בִּקְלִיל אָף בְּסַגִּי מְהֵימָן וּמַן דְּעַוָּל בִּקְלִיל אָף בְּסַגִּי עַוָּל",
    sound: "coin"
  },
  {
    id: "scene12",
    kjv: "\"Give a portion to seven, and also to eight; for thou knowest not what evil shall be upon the earth.\"",
    reference: "Ecclesiastes 11:2",
    hebrew: "תֶּן חֵלֶק לְשִׁבְעָה וְגַם לִשְׁמוֹנָה כִּי לֹא תֵדַע מַה יִּהְיֶה רָעָה עַל הָאָרֶץ",
    greek: "δὸς μερίδα τοῖς ἑπτὰ καί γε τοῖς ὀκτώ ὅτι οὐ γινώσκεις τί ἔσται πονηρὸν ἐπὶ τὴν γῆν",
    aramaic: "הַב חוּלָקָא לְשַׁבְעָא וְאַף לִתְמָנְיָא אֲרֵי לָא יָדַע אַתְּ מָה יְהֵי בִישׁ עַל אַרְעָא",
    sound: "powerup"
  },
  {
    id: "scene13",
    kjv: "\"The borrower is servant to the lender.\"",
    reference: "Proverbs 22:7",
    hebrew: "עָשִׁיר בְּרָשִׁים יִמְשׁוֹל וְעֶבֶד לֹוֶה לְאִישׁ מַלְוֶה",
    greek: "πλούσιοι πτωχῶν ἄρξουσιν καὶ οἰκέτης ἰδίῳ δεσπότῃ δανιεῖ",
    aramaic: "עַתִּירָא בְמִסְכְּנַיָּא שַׁלִּיט וְעַבְדָּא דְּלָוֵי לְגַבְרָא דְּמוֹזֵיף",
    sound: "select"
  },
  {
    id: "scene14",
    kjv: "\"Be thou diligent to know the state of thy flocks, and look well to thy herds.\"",
    reference: "Proverbs 27:23",
    hebrew: "יָדֹעַ תֵּדַע פְּנֵי צֹאנֶךָ שִׁית לִבְּךָ לַעֲדָרִים",
    greek: "γνωστῶς ἐπιγνώσῃ ψυχὰς ποιμνίου σου καὶ ἐπιστήσεις καρδίαν σου ἀγέλαις",
    aramaic: "מִנְדַע תִּנְדַע אַפֵּי עָנָךְ שַׁוִּי לִבָּךְ לְעֶדְרָיָא",
    sound: "scroll"
  },
  {
    id: "scene15",
    kjv: "\"Owe no man any thing, but to love one another: for he that loveth another hath fulfilled the law.\"",
    reference: "Romans 13:8",
    hebrew: "אַל תִּהְיוּ חַיָּבִים לְאִישׁ דָּבָר בִּלְתִּי אִם לְאַהֲבָה אִישׁ אֶת רֵעֵהוּ",
    greek: "μηδενὶ μηδὲν ὀφείλετε εἰ μὴ τὸ ἀλλήλους ἀγαπᾶν ὁ γὰρ ἀγαπῶν τὸν ἕτερον νόμον πεπλήρωκεν",
    aramaic: "לָא תֶהְוֹן חַיָּבִין לְאֱנָשׁ מִדֶּם אֶלָּא דִּתְרַחְמוּן חַד לְחַד",
    sound: "coin"
  },
  {
    id: "scene16",
    kjv: "\"The plans of the diligent lead surely to abundance, but everyone who is hasty comes only to poverty.\"",
    reference: "Proverbs 21:5",
    hebrew: "מַחְשְׁבוֹת חָרוּץ אַךְ לְמוֹתָר וְכָל אָץ אַךְ לְמַחְסוֹר",
    greek: "λογισμοὶ ἐπιμελοῦς πρὸς πλεονασμόν καὶ πᾶς ὁ σπεύδων πρὸς ἐλάττωμα",
    aramaic: "מַחְשְׁבַת חָרוּצָא בְּרַם לְיוּתְרָנָא וְכָל דִּמְבַהֵל בְּרַם לְחַסְרוּנָא",
    sound: "powerup"
  },
  {
    id: "scene17",
    kjv: "\"Honour the LORD with thy substance, and with the firstfruits of all thine increase.\"",
    reference: "Proverbs 3:9",
    hebrew: "כַּבֵּד אֶת יְהוָה מֵהוֹנֶךָ וּמֵרֵאשִׁית כָּל תְּבוּאָתֶךָ",
    greek: "τίμα τὸν κύριον ἀπὸ σῶν δικαίων πόνων καὶ ἀπάρχου αὐτῷ ἀπὸ σῶν καρπῶν",
    aramaic: "יַקַּר יָת יְיָ מִנִּכְסָךְ וּמֵרֵאשִׁית כָּל עַלְלָתָךְ",
    sound: "select"
  },
  {
    id: "scene18",
    kjv: "\"Cast thy bread upon the waters: for thou shalt find it after many days.\"",
    reference: "Ecclesiastes 11:1",
    hebrew: "שַׁלַּח לַחְמְךָ עַל פְּנֵי הַמָּיִם כִּי בְרֹב הַיָּמִים תִּמְצָאֶנּוּ",
    greek: "ἀπόστειλον τὸν ἄρτον σου ἐπὶ πρόσωπον τοῦ ὕδατος ὅτι ἐν πλήθει τῶν ἡμερῶν εὑρήσεις αὐτόν",
    aramaic: "שַׁדַּר לַחְמָךְ עַל אַפֵּי מַיָּא אֲרֵי בְּסוֹגָאַת יוֹמַיָּא תַּשְׁכְּחִנֵּיהּ",
    sound: "coin"
  }
];

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const { playSound } = useSound();
  const [typedText, setTypedText] = useState("");
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [showMainTitle, setShowMainTitle] = useState(false);
  const fullText = "Biblical wisdom for your financial journey. Tithe, Stake, Invest & grow wealth according to scripture.";
  
  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.substring(0, i + 1));
        i++;
        if (i % 5 === 0) playSound("select");
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setShowMainTitle(true);
          playSound("powerup");
          const sceneInterval = setInterval(() => {
            setCurrentSceneIndex(prev => {
              const nextIndex = prev + 1;
              if (nextIndex >= biblicalScenes.length) {
                clearInterval(sceneInterval);
                setTimeout(() => onComplete(), 3000);
                return prev;
              }
              playSound(biblicalScenes[nextIndex].sound as any);
              return nextIndex;
            });
          }, 5000);
        }, 1000);
      }
    }, 80);
    return () => clearInterval(typingInterval);
  }, [playSound, fullText, onComplete]);

  const currentScene = biblicalScenes[currentSceneIndex];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-purple-900/90 to-purple-800/70">
      <div className="text-center max-w-3xl mx-auto p-8">
        {showMainTitle ? (
          <div className="mb-12 animate-entrance">
            <div className="text-5xl md:text-7xl font-scroll font-bold mb-4">
              <GlowingText color="yellow">Bible.fi</GlowingText>
            </div>
            <div className="text-xl font-scroll font-bold text-ancient-gold" style={{ textShadow: '0 0 20px rgb(168 85 247 / 0.8), 0 0 40px rgb(168 85 247 / 0.6)' }}>
              Biblical Wisdom for Financial Stewardship
            </div>
          </div>
        ) : (
          <div className="mb-8 animate-pulse-glow">
            <div className="text-5xl md:text-6xl font-scroll font-bold mb-2">
              <GlowingText color="yellow">Bible.fi</GlowingText>
            </div>
          </div>
        )}
        
        <div className="border-2 border-ancient-gold/50 p-6 bg-purple-900/30 min-h-[280px] flex flex-col items-center justify-center rounded-lg">
          {showMainTitle ? (
            <div className="space-y-5 animate-fade-in" key={currentScene?.id}>
              {/* KJV Scripture */}
              <p className="text-lg md:text-xl font-scroll font-bold text-white leading-relaxed" style={{ textShadow: '0 0 12px rgba(255, 255, 255, 0.4), 0 0 24px rgba(168, 85, 247, 0.5)' }}>
                {currentScene?.kjv}
              </p>
              
              {/* Reference */}
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-ancient-gold/20 border border-ancient-gold/40 text-ancient-gold" style={{ textShadow: '0 0 8px rgba(212, 175, 55, 0.6)' }}>
                {currentScene?.reference}
              </span>

              {/* Divider */}
              <div className="w-24 h-px mx-auto bg-gradient-to-r from-transparent via-ancient-gold/50 to-transparent" />

              {/* Original Languages */}
              <div className="space-y-3 pt-1">
                {/* Hebrew */}
                <div className="flex items-center justify-center gap-2">
                  <span 
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border"
                    style={{ 
                      color: '#60A5FA',
                      borderColor: 'rgba(96, 165, 250, 0.3)',
                      backgroundColor: 'rgba(96, 165, 250, 0.08)',
                      textShadow: '0 0 6px rgba(96, 165, 250, 0.5)'
                    }}
                  >
                    Hebrew
                  </span>
                  <span 
                    className="text-base md:text-lg font-medium" 
                    dir="rtl"
                    style={{ 
                      color: '#93C5FD',
                      textShadow: '0 0 10px rgba(96, 165, 250, 0.6), 0 0 20px rgba(96, 165, 250, 0.3), 0 0 40px rgba(96, 165, 250, 0.15)',
                      fontFamily: "'Noto Serif Hebrew', 'Times New Roman', serif"
                    }}
                  >
                    {currentScene?.hebrew}
                  </span>
                </div>

                {/* Greek */}
                <div className="flex items-center justify-center gap-2">
                  <span 
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border"
                    style={{ 
                      color: '#34D399',
                      borderColor: 'rgba(52, 211, 153, 0.3)',
                      backgroundColor: 'rgba(52, 211, 153, 0.08)',
                      textShadow: '0 0 6px rgba(52, 211, 153, 0.5)'
                    }}
                  >
                    Greek
                  </span>
                  <span 
                    className="text-base md:text-lg font-medium"
                    style={{ 
                      color: '#6EE7B7',
                      textShadow: '0 0 10px rgba(52, 211, 153, 0.6), 0 0 20px rgba(52, 211, 153, 0.3), 0 0 40px rgba(52, 211, 153, 0.15)',
                      fontFamily: "'Noto Serif', Georgia, serif"
                    }}
                  >
                    {currentScene?.greek}
                  </span>
                </div>

                {/* Aramaic */}
                <div className="flex items-center justify-center gap-2">
                  <span 
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border"
                    style={{ 
                      color: '#FBBF24',
                      borderColor: 'rgba(251, 191, 36, 0.3)',
                      backgroundColor: 'rgba(251, 191, 36, 0.08)',
                      textShadow: '0 0 6px rgba(251, 191, 36, 0.5)'
                    }}
                  >
                    Aramaic
                  </span>
                  <span 
                    className="text-base md:text-lg font-medium"
                    dir="rtl"
                    style={{ 
                      color: '#FCD34D',
                      textShadow: '0 0 10px rgba(251, 191, 36, 0.6), 0 0 20px rgba(251, 191, 36, 0.3), 0 0 40px rgba(251, 191, 36, 0.15)',
                      fontFamily: "'Noto Serif Hebrew', 'Times New Roman', serif"
                    }}
                  >
                    {currentScene?.aramaic}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xl font-scroll font-extrabold text-ancient-gold" style={{ textShadow: '0 0 20px rgb(168 85 247 / 0.8), 0 0 40px rgb(168 85 247 / 0.6)', WebkitTextStroke: '0.5px rgba(212, 175, 55, 0.3)' }}>
              {typedText}
              <span className="animate-pulse">|</span>
            </p>
          )}
        </div>
        
        {showMainTitle && (
          <div className="mt-8">
            <div className="mt-4">
              <p className="text-sm text-ancient-gold font-scroll font-bold" style={{ textShadow: '0 0 20px rgb(168 85 247 / 0.8), 0 0 40px rgb(168 85 247 / 0.6)' }}>Loading Biblical Wisdom...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntroAnimation;
