import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import { biblicalWisdomService } from '@/services/biblicalWisdomService';

interface DaimoPaymentParams {
  recipient: string;
  amount: string;
  token: string;
  message?: string;
}

interface ChurchDonationParams {
  churchId: string;
  churchName: string;
  churchAddress: string;
  amount: string;
  token: string;
  message?: string;
  recurringFrequency?: 'one-time' | 'weekly' | 'monthly';
}

export class DaimoClient {
  private readonly DEFAULT_RECIPIENT = "0xb638831Adf73A08490f71a45E613Bb9045AccEFE";

  /**
   * Generate a Daimo payment link - Updated with correct URL structure
   */
  public generatePaymentLink(params: DaimoPaymentParams): string {
    const { recipient, amount, token, message } = params;
    
    // Create Daimo payment link using the correct URL structure
    let url = `https://daimo.com/l/send/${recipient}?amount=${amount}&coin=${token.toUpperCase()}`;
    
    if (message) {
      url += `&note=${encodeURIComponent(message)}`;
    }
    
    return url;
  }

  /**
   * Generate a Daimo payment link for church donations with additional context
   */
  public generateChurchDonationLink(params: ChurchDonationParams): string {
    const { churchAddress, amount, token, message, churchName } = params;
    
    // Use default recipient if church doesn't have crypto address
    const recipient = churchAddress || this.DEFAULT_RECIPIENT;
    
    // Create donation-specific message
    const donationMessage = message || `Tithe to ${churchName} via BibleFi`;
    
    return this.generatePaymentLink({
      recipient,
      amount,
      token,
      message: donationMessage
    });
  }

  /**
   * Get a list of supported tokens for Daimo payments (Base chain tokens)
   */
  public getSupportedTokens(): {symbol: string, name: string, decimals: number, address: string}[] {
    return [
      {symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'},
      {symbol: 'ETH', name: 'Ethereum', decimals: 18, address: '0x4200000000000000000000000000000000000006'},
      {symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb'},
      {symbol: 'USDT', name: 'Tether USD', decimals: 6, address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'}
    ];
  }

  /**
   * Calculate tithing amount based on biblical principles
   */
  public calculateBiblicalTithe(income: number, tithingPercentage: number = 10): number {
    return income * (tithingPercentage / 100);
  }

  /**
   * Suggest additional offering based on prosperity
   */
  public suggestAdditionalOffering(income: number, expenses: number): number {
    const surplus = income - expenses;
    if (surplus <= 0) return 0;
    
    // Bible-based progressive offering suggestion
    if (surplus < 500) {
      return surplus * 0.05; // 5% of surplus
    } else if (surplus < 2000) {
      return surplus * 0.08; // 8% of surplus
    } else {
      return surplus * 0.12; // 12% of surplus
    }
  }

  /**
   * Make a donation to a church using the default address
   */
  public async donateToChurch(
    churchId: string,
    amount: string,
    token: string,
    senderAddress?: string
  ): Promise<{ success: boolean; txHash?: string; error?: string; paymentUrl?: string }> {
    try {
      // Generate a Daimo payment URL using the default recipient
      const paymentUrl = this.generatePaymentLink({
        recipient: this.DEFAULT_RECIPIENT,
        amount,
        token: token.toLowerCase(),
        message: `Tithe via BibleFi ${senderAddress ? `from ${senderAddress}` : ''}`
      });
      
      return {
        success: true,
        txHash: '0x' + Math.random().toString(16).substr(2, 64),
        paymentUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during donation'
      };
    }
  }
  
  /**
   * Set up a recurring tithe using Superfluid integration
   */
  public async setupRecurringTithe(
    churchId: string,
    monthlyAmount: string,
    token: string,
    senderAddress?: string
  ): Promise<{ success: boolean; flowId?: string; error?: string; setupUrl?: string }> {
    try {
      // Map tokens to Superfluid equivalents
      const superfluidTokens: Record<string, string> = {
        'usdc': 'USDCx',
        'dai': 'DAIx',
        'eth': 'ETHx',
        'usdt': 'USDTx'
      };
      
      const superfluidToken = superfluidTokens[token.toLowerCase()] || 'USDCx';
      
      // Calculate flow rate (monthly amount to per-second rate)
      const monthlyAmountNum = parseFloat(monthlyAmount);
      const perSecondRate = (monthlyAmountNum / (30 * 24 * 60 * 60)).toFixed(18);
      
      // Create Superfluid URL for setting up stream to default recipient
      const setupUrl = `https://app.superfluid.finance/stream/base/${this.DEFAULT_RECIPIENT}?token=${superfluidToken}&flowRate=${perSecondRate}`;
      
      return {
        success: true,
        flowId: 'flow_' + Math.random().toString(16).substr(2, 8),
        setupUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error setting up recurring tithe'
      };
    }
  }

  /**
   * Calculate first fruits offering (biblical concept)
   * Based on Proverbs 3:9-10 - "Honor the LORD with your wealth, with the firstfruits"
   */
  public calculateFirstFruits(newIncome: number): number {
    // Biblical first fruits typically refers to giving from the first of your increase
    return newIncome * 0.10; // 10% of new income as first fruits
  }

  /**
   * Get a biblical financial principle related to tithing
   */
  public getTithingPrinciple(): string {
    const principles = [
      "Give, and it will be given to you. (Luke 6:38)",
      "Bring the whole tithe into the storehouse. (Malachi 3:10)",
      "Each of you should give what you have decided in your heart to give. (2 Corinthians 9:7)",
      "Honor the LORD with your wealth, with the firstfruits. (Proverbs 3:9)",
      "God loves a cheerful giver. (2 Corinthians 9:7)"
    ];
    
    return principles[Math.floor(Math.random() * principles.length)];
  }
}

// Create a hook to use the Daimo client with toast notifications
export const useDaimo = () => {
  const { toast } = useToast();
  const client = new DaimoClient();
  
  const donateWithToast = async (churchId: string, amount: string, token: string) => {
    toast({
      title: "Processing Donation",
      description: "Connecting to Daimo for secure payment...",
    });
    
    const result = await client.donateToChurch(churchId, amount, token);
    
    if (result.success) {
      toast({
        title: "Donation Ready",
        description: "You'll be redirected to complete your donation.",
      });
      
      if (result.paymentUrl) {
        // Wait a moment before redirecting
        setTimeout(() => {
          window.open(result.paymentUrl, "_blank");
        }, 1500);
      }
      
      return result;
    } else {
      toast({
        title: "Donation Failed",
        description: result.error || "Could not process your donation. Please try again.",
        variant: "destructive",
      });
      
      return result;
    }
  };
  
  return {
    donateToChurch: donateWithToast,
    generatePaymentLink: client.generatePaymentLink.bind(client),
    generateChurchDonationLink: client.generateChurchDonationLink.bind(client),
    setupRecurringTithe: client.setupRecurringTithe.bind(client),
    getSupportedTokens: client.getSupportedTokens.bind(client),
    calculateBiblicalTithe: client.calculateBiblicalTithe.bind(client),
    suggestAdditionalOffering: client.suggestAdditionalOffering.bind(client),
    calculateFirstFruits: client.calculateFirstFruits.bind(client),
    getTithingPrinciple: client.getTithingPrinciple.bind(client),
  };
};

export const daimoClient = new DaimoClient();
