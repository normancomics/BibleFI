import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ethers } from 'https://esm.sh/ethers@6.13.4';
import { requireAuth, errorResponse, checkRateLimit, getClientIP, rateLimitResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const BASE_RPC = 'https://mainnet.base.org';
const X402_PRICE_USDC = 1; // $1 per gated execution

// EIP-712 domain must match BWTYACore: name="BibleFiBWTYA", version="1"
const DOMAIN_NAME = 'BibleFiBWTYA';
const DOMAIN_VERSION = '1';

const PERMIT_TYPES = {
  StrategyPermit: [
    { name: 'user', type: 'address' },
    { name: 'poolName', type: 'string' },
    { name: 'amount', type: 'uint256' },
    { name: 'reasoning', type: 'string' },
    { name: 'attestationHash', type: 'bytes32' },
    { name: 'deadline', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
};

interface ExecuteRequest {
  userWallet: string;
  poolName: string;
  strategyId: string;
  amount: string; // wei
  reasoning: string;
  x402PaymentHash: string; // tx hash of USDC payment to gateway
  bwtyaContract: string;   // address of deployed BWTYACore (chainId 8453)
}

async function verifyX402Payment(
  txHash: string,
  expectedFrom: string,
  expectedTreasury: string,
): Promise<{ valid: boolean; amountUsdc: number; reason?: string }> {
  try {
    const provider = new ethers.JsonRpcProvider(BASE_RPC);
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) {
      return { valid: false, amountUsdc: 0, reason: 'Receipt not confirmed' };
    }

    // ERC20 Transfer(address,address,uint256) topic
    const transferTopic = ethers.id('Transfer(address,address,uint256)');
    const usdcLog = receipt.logs.find(
      (l) =>
        l.address.toLowerCase() === BASE_USDC.toLowerCase() &&
        l.topics[0] === transferTopic,
    );
    if (!usdcLog) return { valid: false, amountUsdc: 0, reason: 'No USDC transfer in receipt' };

    const from = ethers.getAddress('0x' + usdcLog.topics[1].slice(26));
    const to = ethers.getAddress('0x' + usdcLog.topics[2].slice(26));
    const value = BigInt(usdcLog.data);
    const amountUsdc = Number(value) / 1e6;

    if (from.toLowerCase() !== expectedFrom.toLowerCase()) {
      return { valid: false, amountUsdc, reason: 'Payer mismatch' };
    }
    if (to.toLowerCase() !== expectedTreasury.toLowerCase()) {
      return { valid: false, amountUsdc, reason: 'Recipient mismatch' };
    }
    if (amountUsdc < X402_PRICE_USDC) {
      return { valid: false, amountUsdc, reason: `Underpaid: ${amountUsdc} < ${X402_PRICE_USDC}` };
    }
    return { valid: true, amountUsdc };
  } catch (e) {
    return { valid: false, amountUsdc: 0, reason: (e as Error).message };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const ip = getClientIP(req);
    const rl = checkRateLimit(`x402-bwtya:${ip}`, 20, 60_000);
    if (!rl.allowed) return rateLimitResponse(rl.resetAt, corsHeaders);

    const { user } = await requireAuth(req);

    const body = (await req.json()) as ExecuteRequest;
    const { userWallet, poolName, strategyId, amount, reasoning, x402PaymentHash, bwtyaContract } = body;

    if (!ethers.isAddress(userWallet)) return errorResponse('Invalid userWallet', 400, corsHeaders);
    if (!ethers.isAddress(bwtyaContract)) return errorResponse('Invalid bwtyaContract', 400, corsHeaders);
    if (!poolName || !strategyId) return errorResponse('Missing pool/strategy', 400, corsHeaders);
    if (!amount || BigInt(amount) <= 0n) return errorResponse('Invalid amount', 400, corsHeaders);
    if (!reasoning || reasoning.length < 20) {
      return errorResponse('Reasoning must be ≥20 chars (Biblical justification)', 400, corsHeaders);
    }
    if (!x402PaymentHash?.startsWith('0x')) return errorResponse('Missing x402 payment hash', 400, corsHeaders);

    const signerKey = Deno.env.get('X402_GATEWAY_SIGNER_KEY');
    if (!signerKey) return errorResponse('Gateway signer not configured', 500, corsHeaders);
    const signer = new ethers.Wallet(signerKey);
    const gatewayAddress = await signer.getAddress();

    // 1. Verify x402 USDC payment to gateway treasury (here = signer address)
    const x402 = await verifyX402Payment(x402PaymentHash, userWallet, gatewayAddress);
    if (!x402.valid) {
      return errorResponse(`x402 payment invalid: ${x402.reason}`, 402, corsHeaders);
    }

    // 2. Look up active theological attestation
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data: attest, error: attestErr } = await supabase
      .from('theological_attestations')
      .select('id, attestation_hash, attestation_class, valid_until, revoked')
      .eq('pool_name', poolName)
      .eq('strategy_id', strategyId)
      .eq('attestation_class', 'A_theological')
      .eq('revoked', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (attestErr) return errorResponse(`Attestation lookup failed: ${attestErr.message}`, 500, corsHeaders);
    if (!attest) {
      return errorResponse(
        'No Class A theological attestation for this pool/strategy. ' +
          'Proverbs 11:14 — "in the multitude of counsellors there is safety."',
        403,
        corsHeaders,
      );
    }
    if (attest.valid_until && new Date(attest.valid_until) < new Date()) {
      return errorResponse('Attestation expired', 403, corsHeaders);
    }

    // 3. Build EIP-712 permit
    const deadlineSec = Math.floor(Date.now() / 1000) + 15 * 60;
    const nonce = ethers.hexlify(ethers.randomBytes(32));
    const attestationHashBytes32 = attest.attestation_hash.startsWith('0x')
      ? attest.attestation_hash
      : ethers.id(attest.attestation_hash);

    const domain = {
      name: DOMAIN_NAME,
      version: DOMAIN_VERSION,
      chainId: 8453,
      verifyingContract: bwtyaContract,
    };
    const message = {
      user: userWallet,
      poolName,
      amount: BigInt(amount),
      reasoning,
      attestationHash: attestationHashBytes32,
      deadline: BigInt(deadlineSec),
      nonce,
    };
    const signature = await signer.signTypedData(domain, PERMIT_TYPES, message);

    // 4. Persist execution log
    const { error: insertErr } = await supabase.from('x402_executions').insert({
      user_id: user.id,
      user_wallet: userWallet,
      pool_name: poolName,
      strategy_id: strategyId,
      amount_wei: amount,
      reasoning,
      x402_payment_hash: x402PaymentHash,
      x402_amount_usdc: x402.amountUsdc,
      attestation_id: attest.id,
      attestation_hash: attestationHashBytes32,
      gateway_signature: signature,
      permit_deadline: new Date(deadlineSec * 1000).toISOString(),
      status: 'signed',
    });
    if (insertErr) {
      console.error('x402_executions insert failed', insertErr);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        permit: {
          user: userWallet,
          poolName,
          amount,
          reasoning,
          attestationHash: attestationHashBytes32,
          deadline: deadlineSec,
          nonce,
        },
        signature,
        gateway: gatewayAddress,
        attestation: {
          id: attest.id,
          class: attest.attestation_class,
          hash: attestationHashBytes32,
        },
        scripture: 'Proverbs 11:14',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    const msg = (e as Error).message ?? 'Unknown error';
    const status = msg === 'Authentication required' ? 401 : 500;
    return errorResponse(msg, status, corsHeaders);
  }
});