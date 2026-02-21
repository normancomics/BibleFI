import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkRateLimit, getClientIP, errorResponse, rateLimitResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Base Chain token addresses
// Note: For Uniswap API, ETH must use WETH address since it's a DEX (ERC-20 only)
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
const SUPPORTED_TOKENS: Record<string, { address: string; decimals: number; name: string; apiAddress?: string }> = {
  ETH: { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18, name: 'Ethereum', apiAddress: WETH_ADDRESS },
  WETH: { address: WETH_ADDRESS, decimals: 18, name: 'Wrapped Ether' },
  USDC: { address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', decimals: 6, name: 'USD Coin' },
  USDT: { address: '0xfde4c96c8593536e31f229ea441f725e18cc5773', decimals: 6, name: 'Tether USD' },
  DAI: { address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', decimals: 18, name: 'Dai' },
};

const BASE_CHAIN_ID = 8453;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    const rateCheck = checkRateLimit(`uniswap-quote:${clientIP}`, 20, 60000);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.resetAt, corsHeaders);
    }

    const UNISWAP_API_KEY = Deno.env.get('UNISWAP_API_KEY');
    if (!UNISWAP_API_KEY) {
      return errorResponse('Uniswap API not configured', 500, corsHeaders);
    }

    if (req.method !== 'POST') {
      return errorResponse('Method not allowed', 405, corsHeaders);
    }

    const body = await req.json();
    const { fromToken, toToken, amount, slippage, swapperAddress } = body;

    // Validate inputs
    if (!fromToken || !toToken || !amount) {
      return errorResponse('Missing required fields: fromToken, toToken, amount', 400, corsHeaders);
    }

    const fromTokenInfo = SUPPORTED_TOKENS[fromToken.toUpperCase()];
    const toTokenInfo = SUPPORTED_TOKENS[toToken.toUpperCase()];

    if (!fromTokenInfo || !toTokenInfo) {
      return errorResponse(`Unsupported token. Supported: ${Object.keys(SUPPORTED_TOKENS).join(', ')}`, 400, corsHeaders);
    }

    // Convert human-readable amount to token units
    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      return errorResponse('Invalid amount', 400, corsHeaders);
    }

    const amountInUnits = BigInt(Math.floor(amountFloat * (10 ** fromTokenInfo.decimals))).toString();

    // Call Uniswap Trading API (v1)
    // swapper is required by the API - use provided address or a zero address for quote-only
    const effectiveSwapper = swapperAddress || '0x0000000000000000000000000000000000000001';
    
    const quoteBody: Record<string, unknown> = {
      tokenInChainId: BASE_CHAIN_ID,
      tokenOutChainId: BASE_CHAIN_ID,
      tokenIn: fromTokenInfo.apiAddress || fromTokenInfo.address,
      tokenOut: toTokenInfo.apiAddress || toTokenInfo.address,
      amount: amountInUnits,
      type: 'EXACT_INPUT',
      protocols: ['V3', 'V2'],
      swapper: effectiveSwapper,
      ...(slippage ? { slippageTolerance: slippage.toString() } : {}),
    };

    console.log(`[uniswap-quote] Fetching quote: ${fromToken} -> ${toToken}, amount: ${amount}, body:`, JSON.stringify(quoteBody));

    const quoteResponse = await fetch(
      'https://trade-api.gateway.uniswap.org/v1/quote',
      {
        method: 'POST',
        headers: {
          'x-api-key': UNISWAP_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteBody),
      }
    );

    if (!quoteResponse.ok) {
      const errorText = await quoteResponse.text();
      console.error(`[uniswap-quote] API error: ${quoteResponse.status} - ${errorText}`);
      
      // Return a fallback estimated quote if API fails
      const fallbackQuote = generateFallbackQuote(fromToken, toToken, amountFloat, fromTokenInfo, toTokenInfo);
      return new Response(JSON.stringify({
        ...fallbackQuote,
        source: 'estimate',
        warning: 'Using estimated pricing. Live quotes temporarily unavailable.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const quoteData = await quoteResponse.json();

    // Parse the output amount from quote.output.amount
    const outputAmountRaw = quoteData.quote?.output?.amount || quoteData.quote?.amountOut || '0';
    const outputAmount = parseFloat(outputAmountRaw) / (10 ** toTokenInfo.decimals);

    // Calculate price impact
    const priceImpact = quoteData.quote?.priceImpact ?? 0;

    // Gas estimate in ETH
    const gasUseEstimate = quoteData.quote?.gasUseEstimate || '0';
    const gasPrice = quoteData.quote?.gasPrice || '0';
    const gasFeeWei = parseFloat(quoteData.quote?.gasFee || '0');
    const gasEstimateETH = gasFeeWei / 1e18;

    const result = {
      fromToken: fromToken.toUpperCase(),
      toToken: toToken.toUpperCase(),
      fromAmount: amount,
      toAmount: outputAmount.toFixed(toTokenInfo.decimals <= 6 ? 6 : 8),
      priceImpact: (typeof priceImpact === 'number' ? priceImpact : parseFloat(priceImpact || '0')).toFixed(4),
      gasEstimate: gasEstimateETH.toFixed(8),
      gasFeeUSD: quoteData.quote?.gasFeeUSD || '0',
      route: quoteData.routing || `${fromToken} → ${toToken}`,
      dex: 'Uniswap V3',
      chainId: BASE_CHAIN_ID,
      source: 'uniswap',
      quoteId: quoteData.quote?.quoteId,
      slippage: quoteData.quote?.slippage,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[uniswap-quote] Error:', error);
    return errorResponse('Failed to fetch quote', 500, corsHeaders);
  }
});

/**
 * Generate a fallback quote using approximate market rates
 */
function generateFallbackQuote(
  fromToken: string,
  toToken: string,
  amount: number,
  fromInfo: { decimals: number },
  toInfo: { decimals: number }
) {
  // Approximate USD prices for Base Chain tokens
  const approxPrices: Record<string, number> = {
    ETH: 2500,
    WETH: 2500,
    USDC: 1.0,
    USDT: 1.0,
    DAI: 1.0,
  };

  const fromPrice = approxPrices[fromToken.toUpperCase()] || 1;
  const toPrice = approxPrices[toToken.toUpperCase()] || 1;
  const estimatedOutput = (amount * fromPrice) / toPrice;
  const fee = 0.003; // 0.3% swap fee estimate

  return {
    fromToken: fromToken.toUpperCase(),
    toToken: toToken.toUpperCase(),
    fromAmount: amount.toString(),
    toAmount: (estimatedOutput * (1 - fee)).toFixed(toInfo.decimals <= 6 ? 6 : 8),
    priceImpact: '0.10',
    gasEstimate: '0.000500',
    route: `${fromToken} → ${toToken}`,
    dex: 'Uniswap V3 (Estimated)',
    chainId: BASE_CHAIN_ID,
  };
}
