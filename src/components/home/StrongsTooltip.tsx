
import React, { useState } from "react";
import { useSound } from "@/contexts/SoundContext";
import type { StrongsWord } from "./biblicalScenesData";

interface StrongsTooltipProps {
  words: StrongsWord[];
  language: "hebrew" | "greek" | "aramaic";
  label: string;
  labelColor: string;
  labelBorderColor: string;
  labelBgColor: string;
  labelGlow: string;
}

const languageColors = {
  hebrew: {
    word: "#93C5FD",
    glow: "rgba(96, 165, 250, 0.6)",
    border: "rgba(96, 165, 250, 0.3)",
    bg: "rgba(96, 165, 250, 0.06)",
  },
  greek: {
    word: "#6EE7B7",
    glow: "rgba(52, 211, 153, 0.6)",
    border: "rgba(52, 211, 153, 0.3)",
    bg: "rgba(52, 211, 153, 0.06)",
  },
  aramaic: {
    word: "#FCD34D",
    glow: "rgba(251, 191, 36, 0.6)",
    border: "rgba(251, 191, 36, 0.3)",
    bg: "rgba(251, 191, 36, 0.06)",
  },
};

const StrongsTooltip: React.FC<StrongsTooltipProps> = ({
  words,
  language,
  label,
  labelColor,
  labelBorderColor,
  labelBgColor,
  labelGlow,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { playSound } = useSound();
  const colors = languageColors[language];
  const filteredWords = words.filter((w) => w.language === language);

  if (filteredWords.length === 0) return (
    <span
      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border"
      style={{
        color: labelColor,
        borderColor: labelBorderColor,
        backgroundColor: labelBgColor,
        textShadow: `0 0 6px ${labelGlow}`,
      }}
    >
      {label}
    </span>
  );

  return (
    <div className="relative inline-block">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          playSound("scroll");
        }}
        className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border cursor-pointer transition-all duration-200 hover:scale-110"
        style={{
          color: labelColor,
          borderColor: isOpen ? labelColor : labelBorderColor,
          backgroundColor: isOpen ? `${labelBgColor.replace('0.08', '0.2')}` : labelBgColor,
          textShadow: `0 0 6px ${labelGlow}`,
          boxShadow: isOpen ? `0 0 12px ${labelGlow}` : 'none',
        }}
        title={`View Strong's Concordance for ${label} words`}
      >
        {label} {isOpen ? "▾" : "◂"}
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-2 left-1/2 -translate-x-1/2 w-[320px] md:w-[400px] rounded-lg p-3 space-y-2 animate-fade-in"
          style={{
            backgroundColor: 'rgba(15, 10, 30, 0.95)',
            border: `1px solid ${colors.border}`,
            boxShadow: `0 0 20px ${colors.bg}, 0 4px 20px rgba(0,0,0,0.5)`,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="text-[9px] uppercase tracking-[0.2em] font-bold mb-2 text-center" style={{ color: colors.word }}>
            Strong's Concordance — {label}
          </div>
          {filteredWords.map((word, i) => (
            <div
              key={i}
              className="rounded p-2.5 space-y-1"
              style={{
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-base font-semibold"
                  dir={language === "greek" ? "ltr" : "rtl"}
                  style={{
                    color: colors.word,
                    textShadow: `0 0 8px ${colors.glow}`,
                    fontFamily: language === "greek"
                      ? "'Noto Serif', Georgia, serif"
                      : "'Noto Serif Hebrew', 'Times New Roman', serif",
                  }}
                >
                  {word.original}
                </span>
                <span
                  className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{
                    color: colors.word,
                    backgroundColor: `${colors.border}`,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {word.strongsNumber}
                </span>
              </div>
              <div className="text-[11px] text-white/50 italic font-mono">
                {word.transliteration}
              </div>
              <div className="text-[11px] text-white/80 leading-relaxed">
                {word.definition}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StrongsTooltip;
