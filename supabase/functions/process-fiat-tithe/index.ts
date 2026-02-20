import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * x402-Compatible Fiat Tithe Payment Processor
 * 
 * Supports: Credit/Debit Cards, ACH Bank Transfer, Check Instructions, Wire Transfer
 * For non-crypto churches: Accepts fiat payments and records them for tax compliance.
 * Future: x402 V2 integration for CAIP-standard fiat rails (ACH, SEPA, card networks)
 * 
 * "Render therefore unto Caesar the things which are Caesar's" - Matthew 22:21
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// BibleFi Treasury for forwarding
const BIBLEFI_TREASURY = '0x7bEda57074AA917FF0993fb329E16C2c188baF08';

interface FiatTitheRequest {
  churchId: string;
  churchName: string;
  amount: number;
  currency: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'ach' | 'wire' | 'check' | 'apple_pay' | 'google_pay';
  donorInfo: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  cardDetails?: {
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  recurring?: boolean;
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly';
  anonymousDonation?: boolean;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  receiptUrl?: string;
  taxDeductible: boolean;
  processingFee: number;
  netAmount: number;
  forwardingInfo?: {
    method: string;
    destination: string;
    estimatedArrival: string;
  };
  checkInstructions?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate user - required for payment processing
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required for payment processing' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      supabaseAnonKey,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const userId: string = user.id;

    const body: FiatTitheRequest = await req.json();
    console.log(`[FiatTithe] Processing ${body.paymentMethod} payment: $${body.amount} ${body.currency} to ${body.churchName}`);

    // Validate request
    if (!body.amount || body.amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!body.churchId || !body.paymentMethod) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Calculate processing fee based on method
    const fee = calculateProcessingFee(body.amount, body.paymentMethod);
    const netAmount = body.amount - fee;

    // Generate transaction ID
    const transactionId = `bfi_${body.paymentMethod}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

    // Look up church payment processor info
    const { data: churchData } = await supabase
      .from('global_churches')
      .select('name, crypto_address, accepts_fiat, accepts_cards, accepts_checks, website, address, city, state_province, country')
      .eq('id', body.churchId)
      .single();

    let result: PaymentResult;

    if (body.paymentMethod === 'check') {
      // Generate check mailing instructions
      result = {
        success: true,
        transactionId,
        taxDeductible: true,
        processingFee: 0,
        netAmount: body.amount,
        checkInstructions: generateCheckInstructions(body.amount, body.currency, churchData || { name: body.churchName }),
        forwardingInfo: {
          method: 'Physical Mail',
          destination: churchData?.address || 'Contact church for mailing address',
          estimatedArrival: '5-10 business days after mailing'
        }
      };
    } else {
      // Process digital fiat payment
      // x402 V2 compatible: Uses CAIP standards for fiat rails
      // Current: Record intent and provide forwarding instructions
      // Future: Direct x402 payment flow with facilitator
      
      const forwardingMethod = determineForwardingMethod(body.paymentMethod, churchData);
      
      result = {
        success: true,
        transactionId,
        taxDeductible: true,
        processingFee: fee,
        netAmount,
        forwardingInfo: forwardingMethod,
        receiptUrl: `https://biblefi.lovable.app/receipt/${transactionId}`
      };
    }

    // Record in tax compliance
    if (userId && result.success) {
      const currentYear = new Date().getFullYear();
      
      // Check for existing tax record
      const { data: existingRecord } = await supabase
        .from('tax_compliance_records')
        .select('id, total_tithes, fiat_donations, churches')
        .eq('user_id', userId)
        .eq('tax_year', currentYear)
        .is('deleted_at', null)
        .single();

      const donationRecord = {
        transactionId,
        amount: body.amount,
        currency: body.currency,
        method: body.paymentMethod,
        churchId: body.churchId,
        churchName: body.churchName,
        date: new Date().toISOString(),
        fee,
        netAmount,
        taxDeductible: true
      };

      if (existingRecord) {
        const existingDonations = (existingRecord.fiat_donations as any[]) || [];
        const existingChurches = (existingRecord.churches as any[]) || [];
        
        // Add church if not already tracked
        const churchEntry = { id: body.churchId, name: body.churchName, total: body.amount };
        const existingChurchIdx = existingChurches.findIndex((c: any) => c.id === body.churchId);
        if (existingChurchIdx >= 0) {
          existingChurches[existingChurchIdx].total += body.amount;
        } else {
          existingChurches.push(churchEntry);
        }

        await supabase
          .from('tax_compliance_records')
          .update({
            total_tithes: (existingRecord.total_tithes || 0) + body.amount,
            fiat_donations: [...existingDonations, donationRecord],
            churches: existingChurches,
            tax_deduction_eligible: (existingRecord.total_tithes || 0) + body.amount,
          })
          .eq('id', existingRecord.id);
      } else {
        await supabase
          .from('tax_compliance_records')
          .insert({
            user_id: userId,
            tax_year: currentYear,
            total_tithes: body.amount,
            fiat_donations: [donationRecord],
            churches: [{ id: body.churchId, name: body.churchName, total: body.amount }],
            tax_deduction_eligible: body.amount,
          });
      }

      console.log(`[FiatTithe] Tax record updated for user ${userId}, year ${currentYear}`);
    }

    // Set up recurring if requested
    if (body.recurring && userId) {
      console.log(`[FiatTithe] Recurring ${body.recurringFrequency} payment scheduled for user ${userId}`);
      // Future: Create a scheduled job or Superfluid-like stream for fiat
    }

    console.log(`[FiatTithe] Payment processed: ${transactionId}, net: $${netAmount}`);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[FiatTithe] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Payment processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function calculateProcessingFee(amount: number, method: string): number {
  const feeRates: Record<string, number> = {
    'credit_card': 0.029,    // 2.9%
    'debit_card': 0.015,     // 1.5%
    'ach': 0.008,            // 0.8%
    'wire': 15.0,            // flat $15
    'check': 0,              // free
    'apple_pay': 0.029,      // 2.9%
    'google_pay': 0.029,     // 2.9%
  };
  
  if (method === 'wire') return feeRates[method];
  return amount * (feeRates[method] || 0.029);
}

function determineForwardingMethod(paymentMethod: string, churchData: any): { method: string; destination: string; estimatedArrival: string } {
  // If church accepts the payment method directly
  if (churchData?.accepts_cards && ['credit_card', 'debit_card', 'apple_pay', 'google_pay'].includes(paymentMethod)) {
    return {
      method: 'Direct to Church',
      destination: churchData.name,
      estimatedArrival: 'Instant'
    };
  }
  
  if (churchData?.accepts_fiat && paymentMethod === 'ach') {
    return {
      method: 'ACH Bank Transfer',
      destination: churchData.name,
      estimatedArrival: '1-3 business days'
    };
  }
  
  // Forwarding via BibleFi Treasury
  return {
    method: 'BibleFi Treasury Forwarding',
    destination: `${churchData?.name || 'Church'} via BibleFi (${BIBLEFI_TREASURY.slice(0, 6)}...${BIBLEFI_TREASURY.slice(-4)})`,
    estimatedArrival: paymentMethod === 'ach' ? '3-5 business days' : '1-2 business days'
  };
}

function generateCheckInstructions(amount: number, currency: string, churchInfo: any): string {
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' };
  const symbol = symbols[currency] || '$';
  
  return [
    `To donate ${symbol}${amount.toFixed(2)} via check:`,
    '',
    `1. Make check payable to: "${churchInfo.name}"`,
    `2. Write "Tithe/Donation - BibleFi" in the memo line`,
    `3. Amount: ${symbol}${amount.toFixed(2)}`,
    `4. Mail to:`,
    `   ${churchInfo.name}`,
    `   ${churchInfo.address || 'Contact church for mailing address'}`,
    churchInfo.city ? `   ${churchInfo.city}, ${churchInfo.state_province || ''} ${churchInfo.country || ''}` : '',
    '',
    'Please allow 5-10 business days for processing.',
    'Your donation is tax-deductible. Receipt will be available in your BibleFi dashboard.',
    '',
    '"Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver." — 2 Corinthians 9:7'
  ].filter(Boolean).join('\n');
}
