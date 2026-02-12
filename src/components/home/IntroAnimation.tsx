
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
