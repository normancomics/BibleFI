
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
  /**
   * Generate a Daimo payment link
   */
  public generatePaymentLink(params: DaimoPaymentParams): string {
    const { recipient, amount, token, message } = params;
    
    // Create Daimo payment link - Updated to correct URL
    let url = `https://pay.daimo.com/send?to=${encodeURIComponent(recipient)}&amount=${amount}&token=${token.toLowerCase()}`;
    
    if (message) {
      url += `&message=${encodeURIComponent(message)}`;
    }
    
    return url;
  }

  /**
   * Generate a Daimo payment link for church donations with additional context
   */
  public generateChurchDonationLink(params: ChurchDonationParams): string {
    const { churchAddress, amount, token, message, churchName } = params;
    
    // Create donation-specific message
    const donationMessage = message || `Tithe to ${churchName} via Bible.fi`;
    
    return this.generatePaymentLink({
      recipient: churchAddress,
      amount,
      token,
      message: donationMessage
    });
  }

  /**
   * Get a list of supported tokens for Daimo payments
   */
  public getSupportedTokens(): {symbol: string, name: string, decimals: number}[] {
    return [
      {symbol: 'USDC', name: 'USD Coin', decimals: 6},
      {symbol: 'ETH', name: 'Ethereum', decimals: 18},
      {symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18},
      {symbol: 'USDT', name: 'Tether USD', decimals: 6}
    ];
  }

  /**
   * Calculate tithing amount based on biblical principles
   * @param income Total income amount
   * @param tithingPercentage Custom tithing percentage (default 10%)
   * @returns Recommended tithing amount
   */
  public calculateBiblicalTithe(income: number, tithingPercentage: number = 10): number {
    return income * (tithingPercentage / 100);
  }

  /**
   * Suggest additional offering based on prosperity
   * @param income Total income
   * @param expenses Total expenses
   * @returns Suggested additional offering
   */
  public suggestAdditionalOffering(income: number, expenses: number): number {
    const surplus = income - expenses;
    if (surplus <= 0) return 0;
    
    // Bible-based progressive offering suggestion
    // "Each of you should give what you have decided in your heart to give" - 2 Cor 9:7
    if (surplus < 500) {
      return surplus * 0.05; // 5% of surplus
    } else if (surplus < 2000) {
      return surplus * 0.08; // 8% of surplus
    } else {
      return surplus * 0.12; // 12% of surplus
    }
  }

  /**
   * Make a donation to a church (mock implementation)
   */
  public async donateToChurch(
    churchId: string,
    amount: string,
    token: string,
    senderAddress?: string
  ): Promise<{ success: boolean; txHash?: string; error?: string; paymentUrl?: string }> {
    try {
      // In a real app, this would integrate with actual Daimo API
      // This is just a mockup of what the implementation would look like
      
      // Simulate async process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a Daimo payment URL for the church
      const paymentUrl = this.generatePaymentLink({
        recipient: `church-${churchId}.eth`, // This would be the actual church address
        amount,
        token: token.toLowerCase(),
        message: `Tithe from Bible.fi ${senderAddress ? `(${senderAddress})` : ''}`
      });
      
      // Mock successful transaction
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
   * Set up a recurring tithe using Superfluid (integration between Daimo and Superfluid)
   */
  public async setupRecurringTithe(
    churchId: string,
    monthlyAmount: string,
    token: string,
    senderAddress?: string
  ): Promise<{ success: boolean; flowId?: string; error?: string; setupUrl?: string }> {
    try {
      // This would actually integrate with Superfluid for recurring payments
      // For now, we'll just redirect to Superfluid app with prefilled params
      
      const superfluidToken = token === 'usdc' ? 'USDCx' : token === 'dai' ? 'DAIx' : 'ETHx';
      const recipient = `church-${churchId}.eth`;
      
      // Calculate flow rate (monthly amount to per-second rate)
      const monthlyAmountNum = parseFloat(monthlyAmount);
      const perSecondRate = (monthlyAmountNum / (30 * 24 * 60 * 60)).toFixed(8);
      
      // Create Superfluid URL for setting up stream
      const setupUrl = `https://app.superfluid.finance/stream/base/${recipient}/${superfluidToken}/${perSecondRate}`;
      
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
   * Based on Proverbs 3:9-10 - "Honor the LORD with your wealth, with the firstfruits of all your crops"
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
