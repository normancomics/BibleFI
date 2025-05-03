
import React from "react";
import { Link } from "react-router-dom";
import { BarChart } from "lucide-react";
import BibleCharacter from "@/components/BibleCharacter";
import PixelButton from "@/components/PixelButton";
import { useSound } from "@/contexts/SoundContext";

const TaxSection: React.FC = () => {
  const { playSound } = useSound();

  return (
    <section className="my-10">
      <div className="bg-ancient-scroll border-2 border-ancient-gold p-6 rounded-lg">
        <h2 className="text-2xl font-scroll mb-4 text-center">Render Unto Caesar</h2>
        <BibleCharacter 
          character="jesus" 
          message="Render unto Caesar the things that are Caesar's, and unto GOD the things that are GOD's. - Matthew 22:21"
          className="mb-4"
        />
        <p className="mb-4">BIBLE.Fi helps you track and report your crypto transactions for proper tax compliance.</p>
        <div className="text-center">
          <Link to="/taxes">
            <PixelButton className="flex items-center mx-auto" onClick={() => playSound("powerup")}>
              <BarChart size={16} className="mr-2" />
              Track Taxes
            </PixelButton>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TaxSection;
