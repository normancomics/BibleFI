import React from "react";
import NavBar from "@/components/NavBar";
import BiblefiBrandKit from "@/components/branding/BiblefiBrandKit";

const BrandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <BiblefiBrandKit />
    </div>
  );
};

export default BrandingPage;