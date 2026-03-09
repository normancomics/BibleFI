import React from 'react';
import GrandmaTestWizard from '@/components/onboarding/GrandmaTestWizard';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Start Tithing</h1>
          <p className="text-xs text-muted-foreground">Simple as 1-2-3 — even Grandma can do it 🙏</p>
        </div>
      </header>
      <GrandmaTestWizard />
    </div>
  );
};

export default OnboardingPage;
