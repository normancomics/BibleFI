
export interface FiatPaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'bank' | 'digital_wallet' | 'wire' | 'check';
  currencies: string[];
  processingFee: number; // percentage
  processingTime: string;
  icon: string;
  description: string;
}

export interface PaymentProcessorConfig {
  name: string;
  apiEndpoint?: string;
  supportedMethods: string[];
  supportedCurrencies: string[];
}

export class FiatPaymentService {
  private static readonly PAYMENT_METHODS: FiatPaymentMethod[] = [
    {
      id: 'credit_card',
      name: 'Credit Card',
      type: 'card',
      currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      processingFee: 2.9,
      processingTime: 'Instant',
      icon: 'CreditCard',
      description: 'Pay with Visa, Mastercard, or American Express'
    },
    {
      id: 'debit_card',
      name: 'Debit Card',
      type: 'card',
      currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      processingFee: 1.5,
      processingTime: 'Instant',
      icon: 'CreditCard',
      description: 'Direct payment from your bank account'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer (ACH)',
      type: 'bank',
      currencies: ['USD'],
      processingFee: 0.8,
      processingTime: '1-3 business days',
      icon: 'Building2',
      description: 'Direct transfer from your bank account'
    },
    {
      id: 'wire_transfer',
      name: 'Wire Transfer',
      type: 'wire',
      currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF'],
      processingFee: 15.0, // flat fee
      processingTime: '1-2 business days',
      icon: 'Building2',
      description: 'International wire transfer for larger donations'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      type: 'digital_wallet',
      currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      processingFee: 3.49,
      processingTime: 'Instant',
      icon: 'Wallet',
      description: 'Pay with your PayPal account'
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      type: 'digital_wallet',
      currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      processingFee: 2.9,
      processingTime: 'Instant',
      icon: 'Smartphone',
      description: 'Pay with Touch ID or Face ID'
    },
    {
      id: 'google_pay',
      name: 'Google Pay',
      type: 'digital_wallet',
      currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      processingFee: 2.9,
      processingTime: 'Instant',
      icon: 'Smartphone',
      description: 'Pay with your Google account'
    },
    {
      id: 'venmo',
      name: 'Venmo',
      type: 'digital_wallet',
      currencies: ['USD'],
      processingFee: 1.9,
      processingTime: 'Instant',
      icon: 'Wallet',
      description: 'Pay with your Venmo account'
    },
    {
      id: 'zelle',
      name: 'Zelle',
      type: 'digital_wallet',
      currencies: ['USD'],
      processingFee: 0.0,
      processingTime: 'Instant',
      icon: 'Wallet',
      description: 'Bank-to-bank transfer via Zelle'
    },
    {
      id: 'check',
      name: 'Physical Check',
      type: 'check',
      currencies: ['USD', 'EUR', 'GBP', 'CAD'],
      processingFee: 0.0,
      processingTime: '5-10 business days',
      icon: 'FileText',
      description: 'Mail a physical check to the church'
    }
  ];

  private static readonly SUPPORTED_CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' }
  ];

  static getPaymentMethods(): FiatPaymentMethod[] {
    return this.PAYMENT_METHODS;
  }

  static getSupportedCurrencies() {
    return this.SUPPORTED_CURRENCIES;
  }

  static getPaymentMethodsByCurrency(currency: string): FiatPaymentMethod[] {
    return this.PAYMENT_METHODS.filter(method => 
      method.currencies.includes(currency)
    );
  }

  static calculateFee(amount: number, paymentMethodId: string, currency: string): number {
    const method = this.PAYMENT_METHODS.find(m => m.id === paymentMethodId);
    if (!method) return 0;

    // For wire transfers, it's a flat fee
    if (method.id === 'wire_transfer') {
      return method.processingFee;
    }

    // For percentage-based fees
    return (amount * method.processingFee) / 100;
  }

  static async processPayment(
    amount: number,
    currency: string,
    paymentMethodId: string,
    churchId: string,
    donorInfo: any
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    console.log('Processing fiat payment:', { amount, currency, paymentMethodId, churchId });
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock payment processing logic
    if (Math.random() > 0.1) { // 90% success rate
      return {
        success: true,
        transactionId: `fiat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      return {
        success: false,
        error: 'Payment failed. Please try again or use a different payment method.'
      };
    }
  }

  static generateCheckInstructions(amount: number, currency: string, churchInfo: any): string {
    const currencySymbol = this.SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol || '$';
    
    return `
To donate ${currencySymbol}${amount} via check:

1. Make check payable to: "${churchInfo.name}"
2. Write "Tithe/Donation" in the memo line
3. Amount: ${currencySymbol}${amount}
4. Mail to:
   ${churchInfo.name}
   ${churchInfo.address || 'Please contact church for address'}
   ${churchInfo.city}, ${churchInfo.state}

Please allow 5-10 business days for processing.
    `.trim();
  }
}
