import { supabase } from '@/integrations/supabase/client';

export interface ChurchPaymentProcessor {
  id: string;
  name: string;
  type: 'tithe_ly' | 'pushpay' | 'givelify' | 'planning_center' | 'stripe' | 'square' | 'paypal' | 'daimo' | 'superfluid';
  apiEndpoint: string;
  supportedCurrencies: string[];
  supportedMethods: string[];
  fees: {
    percentage?: number;
    fixed?: number;
    crypto?: number;
  };
  features: string[];
  churchSpecific: boolean;
}

export interface PaymentProcessorResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
  redirectUrl?: string;
}

export class ChurchPaymentProcessorService {
  private static readonly PROCESSORS: ChurchPaymentProcessor[] = [
    {
      id: 'tithe_ly',
      name: 'Tithe.ly',
      type: 'tithe_ly',
      apiEndpoint: 'https://api.tithe.ly/v1',
      supportedCurrencies: ['USD', 'CAD', 'GBP', 'EUR', 'AUD'],
      supportedMethods: ['card', 'bank_transfer', 'apple_pay', 'google_pay'],
      fees: { percentage: 2.9, fixed: 0.30 },
      features: ['recurring_giving', 'text_giving', 'church_app', 'donor_management'],
      churchSpecific: true
    },
    {
      id: 'pushpay',
      name: 'Pushpay',
      type: 'pushpay',
      apiEndpoint: 'https://api.pushpay.com/v1',
      supportedCurrencies: ['USD', 'NZD', 'AUD', 'CAD'],
      supportedMethods: ['card', 'bank_transfer', 'apple_pay', 'google_pay', 'paypal'],
      fees: { percentage: 2.9, fixed: 0.30 },
      features: ['mobile_app', 'donor_management', 'church_management', 'analytics'],
      churchSpecific: true
    },
    {
      id: 'givelify',
      name: 'Givelify',
      type: 'givelify',
      apiEndpoint: 'https://api.givelify.com/v2',
      supportedCurrencies: ['USD'],
      supportedMethods: ['card', 'bank_transfer', 'apple_pay', 'google_pay'],
      fees: { percentage: 2.9, fixed: 0.30 },
      features: ['mobile_first', 'social_giving', 'donor_insights', 'custom_campaigns'],
      churchSpecific: true
    },
    {
      id: 'planning_center_giving',
      name: 'Planning Center Giving',
      type: 'planning_center',
      apiEndpoint: 'https://api.planningcenteronline.com/giving/v2',
      supportedCurrencies: ['USD'],
      supportedMethods: ['card', 'bank_transfer'],
      fees: { percentage: 2.9, fixed: 0.30 },
      features: ['church_management', 'donor_management', 'reporting', 'recurring_giving'],
      churchSpecific: true
    },
    {
      id: 'stripe',
      name: 'Stripe',
      type: 'stripe',
      apiEndpoint: 'https://api.stripe.com/v1',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF'],
      supportedMethods: ['card', 'bank_transfer', 'apple_pay', 'google_pay', 'klarna', 'afterpay'],
      fees: { percentage: 2.9, fixed: 0.30 },
      features: ['global_payments', 'crypto_support', 'subscriptions', 'marketplace'],
      churchSpecific: false
    },
    {
      id: 'daimo',
      name: 'Daimo Pay',
      type: 'daimo',
      apiEndpoint: 'https://api.daimo.com/v1',
      supportedCurrencies: ['USDC', 'ETH', 'DAI'],
      supportedMethods: ['crypto_wallet', 'qr_code', 'usdc_transfer'],
      fees: { crypto: 0.5 },
      features: ['instant_usdc', 'gas_sponsorship', 'mobile_wallet', 'qr_payments'],
      churchSpecific: false
    },
    {
      id: 'superfluid',
      name: 'Superfluid Streams',
      type: 'superfluid',
      apiEndpoint: 'https://api.superfluid.finance',
      supportedCurrencies: ['USDCx', 'ETHx', 'DAIx', 'BIBLEx'],
      supportedMethods: ['stream', 'continuous_payment'],
      fees: { crypto: 0.1 },
      features: ['money_streaming', 'continuous_payments', 'automated_giving', 'real_time_finance'],
      churchSpecific: false
    }
  ];

  static getProcessors(): ChurchPaymentProcessor[] {
    return this.PROCESSORS;
  }

  static getChurchSpecificProcessors(): ChurchPaymentProcessor[] {
    return this.PROCESSORS.filter(p => p.churchSpecific);
  }

  static getCryptoProcessors(): ChurchPaymentProcessor[] {
    return this.PROCESSORS.filter(p => p.type === 'daimo' || p.type === 'superfluid');
  }

  static getProcessorById(id: string): ChurchPaymentProcessor | null {
    return this.PROCESSORS.find(p => p.id === id) || null;
  }

  // Tithe.ly Integration
  static async processTitheLyPayment(
    amount: number,
    currency: string,
    churchId: string,
    donorInfo: any,
    paymentMethod: string
  ): Promise<PaymentProcessorResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('tithe-ly-payment', {
        body: {
          amount,
          currency,
          churchId,
          donorInfo,
          paymentMethod
        }
      });

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Tithe.ly payment failed'
      };
    }
  }

  // Pushpay Integration
  static async processPushpayPayment(
    amount: number,
    currency: string,
    churchId: string,
    donorInfo: any,
    paymentMethod: string
  ): Promise<PaymentProcessorResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('pushpay-payment', {
        body: {
          amount,
          currency,
          churchId,
          donorInfo,
          paymentMethod
        }
      });

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pushpay payment failed'
      };
    }
  }

  // Givelify Integration
  static async processGivelifyPayment(
    amount: number,
    currency: string,
    churchId: string,
    donorInfo: any,
    paymentMethod: string
  ): Promise<PaymentProcessorResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('givelify-payment', {
        body: {
          amount,
          currency,
          churchId,
          donorInfo,
          paymentMethod
        }
      });

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Givelify payment failed'
      };
    }
  }

  // Daimo Pay Integration
  static async processDaimoPayment(
    amount: number,
    token: string,
    churchAddress: string,
    donorAddress: string
  ): Promise<PaymentProcessorResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('daimo-payment', {
        body: {
          amount,
          token,
          churchAddress,
          donorAddress
        }
      });

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Daimo payment failed'
      };
    }
  }

  // Generic processor method
  static async processPayment(
    processorId: string,
    amount: number,
    currency: string,
    churchId: string,
    donorInfo: any,
    paymentMethod: string
  ): Promise<PaymentProcessorResponse> {
    const processor = this.getProcessorById(processorId);
    if (!processor) {
      return {
        success: false,
        error: 'Invalid payment processor'
      };
    }

    switch (processor.type) {
      case 'tithe_ly':
        return this.processTitheLyPayment(amount, currency, churchId, donorInfo, paymentMethod);
      case 'pushpay':
        return this.processPushpayPayment(amount, currency, churchId, donorInfo, paymentMethod);
      case 'givelify':
        return this.processGivelifyPayment(amount, currency, churchId, donorInfo, paymentMethod);
      case 'daimo':
        return this.processDaimoPayment(amount, currency, churchId, donorInfo.address);
      default:
        return {
          success: false,
          error: 'Payment processor not implemented'
        };
    }
  }

  // Setup guidance for churches
  static getSetupInstructions(processorId: string): string[] {
    const processor = this.getProcessorById(processorId);
    if (!processor) return [];

    switch (processor.type) {
      case 'tithe_ly':
        return [
          '1. Sign up at https://tithe.ly',
          '2. Complete church verification',
          '3. Generate API keys in dashboard',
          '4. Configure webhook endpoints',
          '5. Test with small donations'
        ];
      case 'pushpay':
        return [
          '1. Contact Pushpay sales team',
          '2. Complete church onboarding',
          '3. Receive API credentials',
          '4. Configure church profile',
          '5. Set up mobile app integration'
        ];
      case 'givelify':
        return [
          '1. Register at https://givelify.com',
          '2. Verify church organization',
          '3. Access API documentation',
          '4. Implement mobile-first design',
          '5. Configure giving campaigns'
        ];
      case 'daimo':
        return [
          '1. Download Daimo mobile app',
          '2. Set up USDC wallet',
          '3. Generate church receiving address',
          '4. Create QR codes for donations',
          '5. Test USDC transfers'
        ];
      case 'superfluid':
        return [
          '1. Deploy on Base chain',
          '2. Create Superfluid-compatible tokens',
          '3. Set up stream receivers',
          '4. Configure continuous payment flows',
          '5. Test money streaming'
        ];
      default:
        return ['No setup instructions available'];
    }
  }
}