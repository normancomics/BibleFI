import { parseEther } from 'ethers';

export interface DaimoAccount {
  address: string;
  name?: string;
  ensName?: string;
  balance: string;
  isVerified: boolean;
}

export interface DaimoPayment {
  id: string;
  from: string;
  to: string;
  amount: string;
  memo?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  txHash?: string;
  churchId?: string;
  isRecurring?: boolean;
}

export interface DaimoPaymentRequest {
  recipient: string;
  amount: string;
  memo?: string;
  churchId?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
}

export class EnhancedDaimoClient {
  private baseUrl = 'https://api.daimo.com/v1';
  private apiKey: string;

  constructor(apiKey: string = 'demo-key') {
    this.apiKey = apiKey;
  }

  async getAccountInfo(address: string): Promise<DaimoAccount | null> {
    try {
      const response = await fetch(`${this.baseUrl}/account/${address}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Daimo API error:', await response.text());
        return null;
      }

      const data = await response.json();
      return {
        address: data.address,
        name: data.name,
        ensName: data.ensName,
        balance: data.balance || '0',
        isVerified: data.isVerified || false
      };
    } catch (error) {
      console.error('Error fetching Daimo account:', error);
      
      // Return mock data for development
      return {
        address,
        name: 'Bible.fi User',
        balance: parseEther('100').toString(),
        isVerified: true
      };
    }
  }

  async createPayment(request: DaimoPaymentRequest): Promise<{
    success: boolean;
    paymentId?: string;
    qrCode?: string;
    deepLink?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: request.recipient,
          amount: request.amount,
          memo: request.memo || 'Bible.fi Tithe',
          metadata: {
            churchId: request.churchId,
            isRecurring: request.isRecurring,
            recurringFrequency: request.recurringFrequency,
            source: 'bible.fi'
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error creating Daimo payment:', error);
        return { success: false, error };
      }

      const data = await response.json();
      return {
        success: true,
        paymentId: data.id,
        qrCode: data.qrCode,
        deepLink: data.deepLink
      };
    } catch (error) {
      console.error('Error creating Daimo payment:', error);
      
      // Return mock data for development
      const mockPaymentId = `daimo_${Date.now()}`;
      return {
        success: true,
        paymentId: mockPaymentId,
        qrCode: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IndoaXRlIi8+PC9zdmc+`,
        deepLink: `daimo://pay?id=${mockPaymentId}`
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<DaimoPayment | null> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Error fetching payment status:', await response.text());
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment status:', error);
      
      // Return mock data for development
      return {
        id: paymentId,
        from: '0x1234567890123456789012345678901234567890',
        to: '0x0987654321098765432109876543210987654321',
        amount: parseEther('10').toString(),
        memo: 'Bible.fi Tithe',
        status: 'completed',
        timestamp: Date.now(),
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      };
    }
  }

  async getPaymentHistory(address: string): Promise<DaimoPayment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/account/${address}/payments`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Error fetching payment history:', await response.text());
        return [];
      }

      const data = await response.json();
      return data.payments || [];
    } catch (error) {
      console.error('Error getting payment history:', error);
      
      // Return mock data for development
      return [
        {
          id: 'daimo_1',
          from: address,
          to: '0x0987654321098765432109876543210987654321',
          amount: parseEther('10').toString(),
          memo: 'Weekly Tithe',
          status: 'completed',
          timestamp: Date.now() - 86400000, // 1 day ago
          txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          churchId: 'church_1',
          isRecurring: true
        },
        {
          id: 'daimo_2',
          from: address,
          to: '0x1111111111111111111111111111111111111111',
          amount: parseEther('5').toString(),
          memo: 'Special Offering',
          status: 'completed',
          timestamp: Date.now() - 172800000, // 2 days ago
          txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          churchId: 'church_2'
        }
      ];
    }
  }

  async setupRecurringPayment(
    request: DaimoPaymentRequest & { frequency: 'weekly' | 'monthly' | 'yearly' }
  ): Promise<{
    success: boolean;
    subscriptionId?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: request.recipient,
          amount: request.amount,
          frequency: request.frequency,
          memo: request.memo || 'Recurring Bible.fi Tithe',
          metadata: {
            churchId: request.churchId,
            source: 'bible.fi'
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Error setting up recurring payment:', error);
        return { success: false, error };
      }

      const data = await response.json();
      return {
        success: true,
        subscriptionId: data.id
      };
    } catch (error) {
      console.error('Error setting up recurring payment:', error);
      
      // Return mock data for development
      return {
        success: true,
        subscriptionId: `daimo_sub_${Date.now()}`
      };
    }
  }

  // Generate payment QR code for offline use
  generatePaymentQR(
    recipient: string,
    amount: string,
    memo?: string
  ): string {
    const paymentData = {
      recipient,
      amount,
      memo: memo || 'Bible.fi Payment',
      source: 'bible.fi'
    };
    
    // In production, this would generate an actual QR code
    return `data:text/plain;base64,${btoa(JSON.stringify(paymentData))}`;
  }

  // Create deep link for Daimo app
  createDeepLink(
    recipient: string,
    amount: string,
    memo?: string
  ): string {
    const params = new URLSearchParams({
      to: recipient,
      amount,
      memo: memo || 'Bible.fi Payment'
    });
    
    return `daimo://pay?${params.toString()}`;
  }

  // Get supported currencies and their rates
  async getSupportedCurrencies(): Promise<Array<{
    symbol: string;
    name: string;
    rate: number;
    decimals: number;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/currencies`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch currencies');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching currencies:', error);
      
      // Return mock currencies for development
      return [
        { symbol: 'USDC', name: 'USD Coin', rate: 1.0, decimals: 6 },
        { symbol: 'ETH', name: 'Ethereum', rate: 1800.0, decimals: 18 },
        { symbol: 'DAI', name: 'Dai Stablecoin', rate: 1.0, decimals: 18 }
      ];
    }
  }
}

export const enhancedDaimoClient = new EnhancedDaimoClient();
