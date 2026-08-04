#!/usr/bin/env node
/**
 * BWTYAYieldVault tests.
 *
 * Deploys MockERC20 + BWSPWisdomRegistry + BWTYAYieldVault to an in-memory EVM
 * and drives deposit / claim / withdraw against a controllable block timestamp.
 *
 * Anchored on three defects found by running the vault rather than reading it:
 *
 *   1. Wisdom tier thresholds were 250/500/750 while BWSPWisdomRegistry rejects
 *      any score above 100, so no user could ever clear the Learner tier.
 *   2. wisdomTwapAccum was seeded with `score * block.timestamp` — score-seconds
 *      measured from the UNIX epoch — while _getWisdomTwap divides by the time
 *      since deposit. A fresh deposit therefore reported a TWAP inflated by
 *      four to five orders of magnitude, handing every non-zero score the top
 *      Steward tier immediately. The two bugs masked each other: the inflated
 *      TWAP was the only thing that could clear the unreachable thresholds.
 *   3. claimYield paid yield out of depositor principal. Nothing funded yield,
 *      so a claim silently left the vault unable to honour withdrawals.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { VM } = require('@ethereumjs/vm');
const { Address, Account, hexToBytes, bytesToHex } = require('@ethereumjs/util');
const { ethers } = require('ethers');

const REPO = path.resolve(__dirname, '..', '..');
const HERE = __dirname;

let passed = 0;
let failed = 0;
function check(label, cond, detail = '') {
  if (cond) { passed++; console.log(`  ✓ ${label}${detail ? '  ' + detail : ''}`); }
  else { failed++; console.log(`  ✗ ${label}${detail ? '  ' + detail : ''}`); }
}

function resolveImport(p) {
  for (const c of [path.join(REPO, p), path.join(REPO, 'contracts', p), path.join(HERE, 'node_modules', p), path.join(HERE, p)]) {
    if (fs.existsSync(c)) return { contents: fs.readFileSync(c, 'utf8') };
  }
  return { error: `not found: ${p}` };
}

function build(srcPath, name) {
  const input = {
    language: 'Solidity',
    sources: { [srcPath]: { content: fs.readFileSync(path.join(REPO, srcPath), 'utf8') } },
    settings: { optimizer: { enabled: true, runs: 200 }, outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } },
  };
  const out = JSON.parse(solc.compile(JSON.stringify(input), { import: resolveImport }));
  const errs = (out.errors || []).filter((e) => e.severity === 'error');
  if (errs.length) { errs.forEach((e) => console.error(e.formattedMessage)); throw new Error('compile failed: ' + srcPath); }
  const c = out.contracts[srcPath][name];
  return { abi: c.abi, bytecode: c.evm.bytecode.object };
}

const USER = new Address(hexToBytes('0x' + '11'.repeat(20)));
const TREASURY = new Address(hexToBytes('0x' + '22'.repeat(20)));
const FUNDER = new Address(hexToBytes('0x' + '33'.repeat(20)));

async function harness() {
  const vm = await VM.create();
  for (const a of [USER, FUNDER]) {
    await vm.stateManager.putAccount(a, Account.fromAccountData({ balance: 10n ** 20n }));
  }
  const clock = { now: 1_800_000_000n };

  const blockCtx = () => ({
    header: {
      timestamp: clock.now, number: 1n, coinbase: Address.zero(), difficulty: 0n,
      prevRandao: new Uint8Array(32), gasLimit: 30_000_000n, baseFeePerGas: 0n,
      cliqueSigner: () => Address.zero(), getBlobGasPrice: () => 0n,
    },
  });

  const raw = (to, data, caller) => vm.evm.runCall({
    caller, origin: caller, to, gasLimit: 30_000_000n, data: hexToBytes(data), block: blockCtx(),
  });

  async function deploy(art, args = []) {
    const iface = new ethers.Interface(art.abi);
    const ctor = args.length ? iface.encodeDeploy(args).slice(2) : '';
    const r = await raw(undefined, '0x' + art.bytecode + ctor, USER);
    if (r.execResult.exceptionError) throw new Error('deploy reverted: ' + r.execResult.exceptionError.error);
    return { addr: r.createdAddress, iface };
  }

  async function call(c, fn, args, caller = USER) {
    const r = await raw(c.addr, c.iface.encodeFunctionData(fn, args), caller);
    if (r.execResult.exceptionError) {
      let m = r.execResult.exceptionError.error;
      const rv = bytesToHex(r.execResult.returnValue);
      try { m = c.iface.parseError(rv)?.name ?? m; } catch { /* not a custom error */ }
      return { revert: m };
    }
    return { ok: c.iface.decodeFunctionResult(fn, bytesToHex(r.execResult.returnValue)) };
  }

  return { clock, deploy, call };
}

async function main() {
  const { clock, deploy, call } = await harness();

  const token = await deploy(build('contracts/test/mocks/MockERC20.sol', 'MockERC20'));
  const registry = await deploy(build('contracts/BWSPWisdomRegistry.sol', 'BWSPWisdomRegistry'));
  const vault = await deploy(build('contracts/BWTYAYieldVault.sol', 'BWTYAYieldVault'),
    [token.addr.toString(), TREASURY.toString(), registry.addr.toString(), 800]);

  const ONE = 10n ** 18n;
  await call(token, 'mint', [USER.toString(), 1000n * ONE]);
  await call(token, 'approve', [vault.addr.toString(), 1000n * ONE]);

  // -- the scale mismatch that made the tiers unreachable -------------------
  console.log('Wisdom score scale');
  const over = await call(registry, 'updateWisdomScore', [USER.toString(), 101n]);
  check('registry rejects a score above 100', over.revert === 'InvalidScore', `got ${over.revert}`);
  const steward = (await call(vault, 'WISDOM_STEWARD', [])).ok[0];
  check('Steward threshold is reachable on that scale', steward <= 100n, `WISDOM_STEWARD=${steward}`);

  // -- tier mapping ---------------------------------------------------------
  // Before the TWAP fix every non-zero score reported Steward, so a low score
  // landing in a low tier is the discriminating check.
  console.log('\nWisdom boost tiers (regression: all non-zero scores read as Steward)');
  const tierFor = async (score) => {
    const { clock: c2, deploy: d2, call: k2 } = await harness();
    const tk = await d2(build('contracts/test/mocks/MockERC20.sol', 'MockERC20'));
    const rg = await d2(build('contracts/BWSPWisdomRegistry.sol', 'BWSPWisdomRegistry'));
    const vt = await d2(build('contracts/BWTYAYieldVault.sol', 'BWTYAYieldVault'),
      [tk.addr.toString(), TREASURY.toString(), rg.addr.toString(), 800]);
    await k2(tk, 'mint', [USER.toString(), 1000n * ONE]);
    await k2(tk, 'approve', [vt.addr.toString(), 1000n * ONE]);
    await k2(rg, 'updateWisdomScore', [USER.toString(), score]);
    await k2(vt, 'deposit', [100n * ONE, 0n]);
    c2.now += 86400n * 30n;
    const pv = (await k2(vt, 'previewYield', [USER.toString()])).ok[0];
    return pv.netYield > 0n ? Number((pv.wisdomBonus * 10000n) / pv.netYield) / 100 : 0;
  };

  const expectations = [[0n, 0], [10n, 0], [30n, 5], [60n, 15], [100n, 30]];
  for (const [score, wantPct] of expectations) {
    const got = await tierFor(score);
    check(`score ${score} → +${wantPct}%`, Math.abs(got - wantPct) < 0.05, `got +${got}%`);
  }

  // -- solvency -------------------------------------------------------------
  console.log('\nYield solvency (regression: claims were paid out of principal)');
  await call(registry, 'updateWisdomScore', [USER.toString(), 100n]);
  await call(vault, 'deposit', [100n * ONE, 0n]);
  clock.now += 86400n * 30n;

  const backing0 = (await call(vault, 'availableYieldBacking', [])).ok[0];
  check('unfunded vault reports zero yield backing', backing0 === 0n, `got ${backing0}`);

  const balBefore = (await call(token, 'balanceOf', [vault.addr.toString()])).ok[0];
  const unfunded = await call(vault, 'claimYield', []);
  check('unfunded claim reverts rather than draining principal',
    unfunded.revert === 'InsufficientYieldBacking', `got ${unfunded.revert ?? 'SUCCEEDED'}`);
  const balAfter = (await call(token, 'balanceOf', [vault.addr.toString()])).ok[0];
  check('principal untouched by the failed claim', balAfter === balBefore, `${balBefore} → ${balAfter}`);

  // fund, then claim succeeds
  await call(token, 'mint', [FUNDER.toString(), 100n * ONE]);
  await call(token, 'approve', [vault.addr.toString(), 100n * ONE], FUNDER);
  const funded = await call(vault, 'fundYield', [50n * ONE], FUNDER);
  check('fundYield accepts backing', !funded.revert, funded.revert ?? '');
  const backing1 = (await call(vault, 'availableYieldBacking', [])).ok[0];
  check('backing reflects the funded amount', backing1 === 50n * ONE, `got ${backing1}`);

  const ok = await call(vault, 'claimYield', []);
  check('claim succeeds once backed', !ok.revert, ok.revert ?? '');

  const treasuryBal = (await call(token, 'balanceOf', [TREASURY.toString()])).ok[0];
  check('tithe reached the treasury (Proverbs 3:9, tithe-first)', treasuryBal > 0n, `got ${treasuryBal}`);

  // principal must still be fully withdrawable after the claim
  const w = await call(vault, 'withdraw', []);
  check('withdraw succeeds after a claim', !w.revert, w.revert ?? '');

  console.log(`\n${failed === 0 ? '✅' : '❌'} ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error('\n❌ ' + e.stack); process.exit(1); });
