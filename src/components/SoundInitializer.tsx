
import React, { useEffect } from "react";
import { useSound } from "@/contexts/SoundContext";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

// This component helps initialize sounds early in the app lifecycle
const SoundInitializer: React.FC = () => {
  const { setUserInteracted } = useSound();
  
  // Detect iOS
  const isIOS = typeof navigator !== 'undefined' && 
    (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  
  const isSafari = typeof navigator !== 'undefined' && 
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  useEffect(() => {
    // Force enable user interaction for all devices
    setUserInteracted(true);
    
    // Log device information for debugging
    console.log("🔍 Device Information:");
    console.log("- User Agent:", navigator.userAgent);
    console.log("- Platform:", navigator.platform);
    console.log("- iOS Device:", isIOS ? "Yes" : "No");
    console.log("- Safari Browser:", isSafari ? "Yes" : "No");
    console.log("- Touch Points:", navigator.maxTouchPoints);
    
    // Create empty audio elements to help unlock audio 
    if (isIOS || isSafari) {
      console.log("📱 iOS/Safari detected - pre-creating audio elements");
      
      // We'll silently create some audio elements that might help
      const soundTypes = ["click", "coin", "select"];
      
      soundTypes.forEach(type => {
        const audio = new Audio(`/sounds/${type}.mp3`);
        audio.volume = 0.1;
        audio.muted = false;
        audio.setAttribute("playsinline", "");
        audio.setAttribute("webkit-playsinline", "");
        audio.load();
        
        // Don't auto-play - iOS won't allow it anyway
      });
    }
  }, [setUserInteracted, isIOS, isSafari]);
  
  // Only show for iOS/Safari
  if (!isIOS && !isSafari) return null;
  
  return (
    <div className="fixed bottom-20 right-4 z-50 animate-bounce">
      <Button
        onClick={() => {
          // Redirect focus to the main sound panel
          const soundPanel = document.getElementById('sound-test-target');
          if (soundPanel) {
            soundPanel.scrollIntoView({ behavior: 'smooth' });
          }
          setUserInteracted(true);
        }}
        variant="default"
        className="bg-red-600 hover:bg-red-700 flex items-center gap-2 px-4 py-2 rounded-full text-white shadow-lg"
        size="lg"
      >
        <Volume2 className="h-5 w-5" />
        <span>Enable Sound</span>
      </Button>
    </div>
  );
};

export default SoundInitializer;
