
import React from "react";
import BibleCharacter from "@/components/BibleCharacter";

const HomeHeader: React.FC = () => {
  return (
    <section className="text-center mb-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-scroll text-scripture-dark mb-4 gold-gradient-text">BIBLE.Fi</h1>
      <p className="text-xl max-w-2xl mx-auto">
        Biblical wisdom for your financial journey. Tithe, Stake, Invest & grow wealth according to scripture.
      </p>
      <p className="text-sm mt-2 opacity-70">Made on Base Chain</p>
      
      <BibleCharacter 
        character="solomon" 
        message="Wisdom is more precious than rubies, and all the things you may desire cannot compare with her. - Proverbs 8:11"
        className="mt-8 max-w-2xl mx-auto text-left"
      />
    </section>
  );
};

export default HomeHeader;
