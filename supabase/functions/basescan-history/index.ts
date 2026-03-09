import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Known token addresses on Base for labeling
const TOKEN_MAP: Record<string, { symbol: string; decimals: number }> = {
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': { symbol: 'USDC', decimals: 6 },
  '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2': { symbol: 'USDT', decimals: 6 },
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': { symbol: 'DAI', decimals: 18 },
  '0x4200000000000000000000000000000000000006': { symbol: 'WETH', decimals: 18 },
};

// Uniswap V3 Router addresses on Base
const SWAP_ROUTERS = new Set([
  '0x2626664c2603336e57b271c5c0b26f421741e481', // Universal Router
  '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad', // Universal Router v2
  '0x198ef79f1f515f02dfe9e3115ed9fc07183f02fc', // SwapRouter02
]);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, page = 1, offset = 25 } = await req.json();

    if (!address) {
      return new Response(JSON.stringify({ error: 'Address required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('BASESCAN_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Basescan API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lowerAddr = address.toLowerCase();

    // Fetch normal transactions and ERC-20 token transfers in parallel
    const [normalRes, tokenRes] = await Promise.all([
      fetch(
        `https://api.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${offset}&sort=desc&apikey=${apiKey}`
      ),
      fetch(
        `https://api.basescan.org/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${offset}&sort=desc&apikey=${apiKey}`
      ),
    ]);

    const [normalData, tokenData] = await Promise.all([normalRes.json(), tokenRes.json()]);

    // Build a map of token transfers by txHash for enrichment
    const tokenTransfersByHash: Record<string, Array<{
      symbol: string;
      amount: string;
      from: string;
      to: string;
      contractAddress: string;
      decimals: number;
    }>> = {};

    if (tokenData.status === '1' && Array.isArray(tokenData.result)) {
      for (const tx of tokenData.result) {
        const hash = tx.hash.toLowerCase();
        if (!tokenTransfersByHash[hash]) tokenTransfersByHash[hash] = [];
        const decimals = parseInt(tx.tokenDecimal || '18');
        const rawValue = BigInt(tx.value || '0');
        const amount = Number(rawValue) / Math.pow(10, decimals);
        tokenTransfersByHash[hash].push({
          symbol: tx.tokenSymbol || 'UNKNOWN',
          amount: amount.toFixed(decimals <= 6 ? 2 : 4),
          from: tx.from.toLowerCase(),
          to: tx.to.toLowerCase(),
          contractAddress: tx.contractAddress.toLowerCase(),
          decimals,
        });
      }
    }

    // Process normal transactions, identify swaps
    const transactions = [];

    if (normalData.status === '1' && Array.isArray(normalData.result)) {
      for (const tx of normalData.result) {
        const hash = tx.hash.toLowerCase();
        const isSwapRouter = SWAP_ROUTERS.has(tx.to?.toLowerCase() || '');
        const transfers = tokenTransfersByHash[hash] || [];
        const ethValue = Number(BigInt(tx.value || '0')) / 1e18;
        const isError = tx.isError === '1';
        const timestamp = new Date(parseInt(tx.timeStamp) * 1000).toISOString();

        if (isSwapRouter && transfers.length >= 1) {
          // This is a swap transaction
          const outgoing = transfers.find(t => t.from === lowerAddr);
          const incoming = transfers.find(t => t.to === lowerAddr);

          let fromToken = 'ETH';
          let fromAmount = ethValue > 0 ? ethValue.toFixed(4) : '0';
          let toToken = 'UNKNOWN';
          let toAmount = '0';

          if (outgoing) {
            fromToken = outgoing.symbol;
            fromAmount = outgoing.amount;
          }
          if (incoming) {
            toToken = incoming.symbol;
            toAmount = incoming.amount;
          } else if (ethValue > 0 && outgoing) {
            // Swapped token for ETH — ETH received via native transfer
            toToken = 'ETH';
            toAmount = ethValue.toFixed(4);
          }

          if (!outgoing && ethValue > 0 && incoming) {
            // Swapped ETH for token
            fromToken = 'ETH';
            fromAmount = ethValue.toFixed(4);
          }

          transactions.push({
            id: tx.hash,
            type: 'swap',
            fromToken,
            toToken,
            fromAmount,
            toAmount,
            timestamp,
            status: isError ? 'failed' : 'completed',
            txHash: tx.hash,
            gasUsed: tx.gasUsed,
            gasPrice: tx.gasPrice,
          });
        } else if (ethValue > 0) {
          // Simple ETH transfer
          const isSend = tx.from.toLowerCase() === lowerAddr;
          transactions.push({
            id: tx.hash,
            type: isSend ? 'send' : 'receive',
            fromToken: 'ETH',
            toToken: 'ETH',
            fromAmount: ethValue.toFixed(4),
            toAmount: ethValue.toFixed(4),
            timestamp,
            status: isError ? 'failed' : 'completed',
            txHash: tx.hash,
            counterparty: isSend ? tx.to : tx.from,
            gasUsed: tx.gasUsed,
            gasPrice: tx.gasPrice,
          });
        } else if (transfers.length > 0) {
          // Token transfer (not swap)
          const transfer = transfers[0];
          const isSend = transfer.from === lowerAddr;
          transactions.push({
            id: tx.hash,
            type: isSend ? 'send' : 'receive',
            fromToken: transfer.symbol,
            toToken: transfer.symbol,
            fromAmount: transfer.amount,
            toAmount: transfer.amount,
            timestamp,
            status: isError ? 'failed' : 'completed',
            txHash: tx.hash,
            counterparty: isSend ? transfer.to : transfer.from,
            gasUsed: tx.gasUsed,
            gasPrice: tx.gasPrice,
          });
        }
      }
    }

    return new Response(JSON.stringify({ transactions, count: transactions.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Basescan history error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
