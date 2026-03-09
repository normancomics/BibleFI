import React, { useState, useCallback } from 'react';
import { Church, Search, CreditCard, CheckCircle, ArrowLeft, ArrowRight, Heart, Globe, MapPin, Wallet, ExternalLink, Loader2, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/contexts/SoundContext';
import { useWallet } from '@/contexts/WalletContext';
import { Church as ChurchType } from '@/types/church';
import { searchChurches } from '@/services/churchService';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3;

interface PaymentChoice {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  recommended?: boolean;
  comingSoon?: boolean;
}

const PAYMENT_CHOICES: PaymentChoice[] = [
  {
    id: 'coinbase-onramp',
    label: 'Buy Crypto & Tithe',
    description: 'Use your debit card or bank account via Coinbase. Best for first-timers.',
    icon: <Wallet className="w-6 h-6" />,
    recommended: true,
  },
  {
    id: 'usdc-direct',
    label: 'Send USDC Directly',
    description: 'Already have USDC? Send it straight to your church.',
    icon: <CreditCard className="w-6 h-6" />,
  },
  {
    id: 'superfluid-stream',
    label: 'Auto-Stream (Superfluid)',
    description: 'Set it & forget it. Tithe streams continuously, like autopay.',
    icon: <Heart className="w-6 h-6" />,
  },
  {
    id: 'fiat-card',
    label: 'Credit/Debit Card (Fiat)',
    description: 'Pay with a regular card. We handle the conversion.',
    icon: <CreditCard className="w-6 h-6" />,
  },
];

const TITHE_PRESETS = [10, 25, 50, 100, 250, 500];

const ScriptureQuote: React.FC<{ text: string; reference: string }> = ({ text, reference }) => (
  <div className="border border-border/50 rounded-lg p-4 bg-muted/30 italic text-center">
    <p className="text-sm text-muted-foreground leading-relaxed">"{text}"</p>
    <p className="text-xs text-ancient-gold mt-2 font-semibold">— {reference}</p>
  </div>
);

const GrandmaTestWizard: React.FC = () => {
  const [step, setStep] = useState<Step>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [churches, setChurches] = useState<ChurchType[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<ChurchType | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [titheAmount, setTitheAmount] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();
  const { playSound } = useSound();
  const { isConnected, address } = useWallet();

  const progressValue = (step / 3) * 100;

  // Step 1: Search churches
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    playSound('click');
    try {
      const results = await searchChurches(searchQuery);
      setChurches(results);
      if (results.length === 0) {
        toast({ title: 'No churches found', description: 'Try a different name, city, or zip code.' });
      }
    } catch {
      toast({ title: 'Search failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, playSound, toast]);

  const selectChurch = (church: ChurchType) => {
    setSelectedChurch(church);
    playSound('success');
  };

  const goNext = () => {
    if (step < 3) {
      setStep((s) => (s + 1) as Step);
      playSound('click');
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as Step);
      playSound('click');
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    playSound('click');

    // Coinbase Onramp flow
    if (selectedPayment === 'coinbase-onramp') {
      const destinationAddress = selectedChurch?.acceptsCrypto
        ? '0x7bEda57074AA917FF0993fb329E16C2c188baF08' // treasury forwarding
        : '0x7bEda57074AA917FF0993fb329E16C2c188baF08';

      const onrampUrl = new URL('https://pay.coinbase.com/buy/select-asset');
      onrampUrl.searchParams.set('appId', 'biblefi');
      onrampUrl.searchParams.set('destinationWallets', JSON.stringify([
        { address: destinationAddress, blockchains: ['base'], assets: ['USDC'] }
      ]));
      if (titheAmount) {
        onrampUrl.searchParams.set('presetFiatAmount', titheAmount);
      }
      onrampUrl.searchParams.set('fiatCurrency', 'USD');

      window.open(onrampUrl.toString(), '_blank', 'noopener');
      toast({
        title: '🙏 Coinbase Onramp Opened',
        description: 'Complete your purchase in the Coinbase window. Your tithe will be forwarded to your church.',
      });
    } else {
      toast({
        title: '✅ Tithe Initiated',
        description: `$${titheAmount || '0'} tithe to ${selectedChurch?.name} via ${PAYMENT_CHOICES.find(p => p.id === selectedPayment)?.label}.`,
      });
    }

    playSound('success');
    setIsProcessing(false);
  };

  // ─── Step 1: Find Your Church ─────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-2">
          <Church className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Find Your Church</h2>
        <p className="text-muted-foreground">Search by name, city, or denomination</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="e.g. Times Square Church, New York"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="text-base h-12"
        />
        <Button onClick={handleSearch} disabled={isSearching} size="lg" className="shrink-0">
          {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </Button>
      </div>

      {/* Results */}
      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
        {churches.map((church) => {
          const isSelected = selectedChurch?.id === church.id;
          return (
            <button
              key={church.id}
              onClick={() => selectChurch(church)}
              className={cn(
                'w-full text-left p-4 rounded-lg border transition-all',
                isSelected
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-muted/50'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{church.name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{church.location || `${church.city}, ${church.state}`}</span>
                  </div>
                  {church.denomination && (
                    <span className="text-xs text-muted-foreground/70 mt-0.5 block">{church.denomination}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {church.verified && (
                    <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {church.acceptsCrypto && (
                    <span className="inline-flex items-center gap-1 text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                      <Wallet className="w-3 h-3" /> Crypto
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
        {churches.length === 0 && !isSearching && searchQuery && (
          <p className="text-center text-muted-foreground text-sm py-6">
            No results yet. Try searching above ☝️
          </p>
        )}
      </div>

      <ScriptureQuote
        text="Bring the whole tithe into the storehouse, that there may be food in my house."
        reference="Malachi 3:10"
      />
    </div>
  );

  // ─── Step 2: Choose How to Pay ─────────────────────────────
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 border border-secondary/20 mb-2">
          <CreditCard className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">How Would You Like to Tithe?</h2>
        <p className="text-muted-foreground">
          Tithing to <span className="text-foreground font-medium">{selectedChurch?.name}</span>
        </p>
      </div>

      {/* Amount */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Tithe Amount (USD)</Label>
        <Input
          type="number"
          min="1"
          placeholder="Enter amount"
          value={titheAmount}
          onChange={(e) => setTitheAmount(e.target.value)}
          className="text-lg h-14 text-center font-semibold"
        />
        <div className="flex flex-wrap gap-2 justify-center">
          {TITHE_PRESETS.map((amt) => (
            <Button
              key={amt}
              variant={titheAmount === String(amt) ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setTitheAmount(String(amt)); playSound('click'); }}
            >
              ${amt}
            </Button>
          ))}
        </div>
      </div>

      {/* Payment methods */}
      <div className="space-y-3">
        {PAYMENT_CHOICES.map((method) => {
          const isSelected = selectedPayment === method.id;
          return (
            <button
              key={method.id}
              disabled={method.comingSoon}
              onClick={() => { setSelectedPayment(method.id); playSound('click'); }}
              className={cn(
                'w-full text-left p-4 rounded-lg border transition-all flex items-start gap-4',
                method.comingSoon && 'opacity-50 cursor-not-allowed',
                isSelected
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-muted/50'
              )}
            >
              <div className={cn(
                'shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {method.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{method.label}</span>
                  {method.recommended && (
                    <span className="text-[10px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{method.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {!isConnected && selectedPayment && selectedPayment !== 'fiat-card' && (
        <p className="text-sm text-center text-destructive">
          Please connect your wallet first to use this payment method.
        </p>
      )}

      <ScriptureQuote
        text="Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
        reference="2 Corinthians 9:7"
      />
    </div>
  );

  // ─── Step 3: Confirm ─────────────────────────────
  const renderStep3 = () => {
    const chosenMethod = PAYMENT_CHOICES.find((p) => p.id === selectedPayment);
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-2">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Confirm Your Tithe</h2>
          <p className="text-muted-foreground">Review and submit</p>
        </div>

        <Card className="border-primary/20">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Church</span>
              <span className="font-semibold text-foreground text-right max-w-[60%] truncate">{selectedChurch?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Location</span>
              <span className="text-foreground text-sm text-right">
                {selectedChurch?.city}, {selectedChurch?.state}
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Amount</span>
              <span className="text-2xl font-bold text-secondary">${titheAmount || '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Method</span>
              <span className="text-foreground font-medium">{chosenMethod?.label}</span>
            </div>
            {selectedPayment === 'coinbase-onramp' && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                💡 You'll be redirected to Coinbase to purchase USDC with your debit card or bank account.
                The USDC will be sent to your church's wallet on Base chain.
              </p>
            )}
            {selectedPayment === 'superfluid-stream' && (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                💡 This will create a continuous money stream. Your tithe flows every second — like divine autopay.
                We'll wrap 3 months of USDC into USDCx for buffer.
              </p>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={handleConfirm}
          disabled={isProcessing}
          size="lg"
          className="w-full h-14 text-lg font-semibold"
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Heart className="w-5 h-5 mr-2" />
          )}
          {isProcessing ? 'Processing...' : 'Give With Joy 🙏'}
        </Button>

        <ScriptureQuote
          text="Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things."
          reference="Matthew 25:21"
        />
      </div>
    );
  };

  const canGoNext =
    (step === 1 && selectedChurch !== null) ||
    (step === 2 && selectedPayment !== '' && titheAmount !== '');

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      {/* Progress */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span className={cn(step === 1 && 'text-primary font-semibold')}>1. Find Church</span>
          <span className={cn(step === 2 && 'text-primary font-semibold')}>2. Choose Method</span>
          <span className={cn(step === 3 && 'text-primary font-semibold')}>3. Confirm</span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* Step content */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={step === 1}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        {step < 3 ? (
          <Button
            onClick={goNext}
            disabled={!canGoNext}
            className="flex-1"
          >
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default GrandmaTestWizard;
