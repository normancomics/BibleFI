
import React, { useEffect, useState } from "react";
import { getRandomVerse, BibleVerse } from "@/data/bibleVerses";
import ScriptureCard from "./ScriptureCard";

const DailyScripture: React.FC = () => {
  const [dailyVerse, setDailyVerse] = useState<BibleVerse | null>(null);

  useEffect(() => {
    // In a real app, we might want to ensure this only updates once per day
    setDailyVerse(getRandomVerse());
  }, []);

  if (!dailyVerse) return null;

  return (
    <div className="my-4">
      <h2 className="text-xl font-scroll mb-2">Today's Financial Wisdom</h2>
      <ScriptureCard verse={dailyVerse} />
    </div>
  );
};

export default DailyScripture;
