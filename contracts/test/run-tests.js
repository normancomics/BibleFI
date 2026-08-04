#!/usr/bin/env node
/**
 * BWSP / BWTYA contract test harness.
 *
 * Compiles the contracts with solc, deploys BWSPWisdomRegistry to an in-memory
 * EVM, and exercises the scoring path end-to-end. Deliberately dependency-light
 * and self-contained: the repo has no Hardhat/Foundry setup, and OpenZeppelin
 * is not a root dependency because contracts are deployed outside the npm
 * workflow (see BASE_DEPLOYMENT_GUIDE.md).
 *
 *   cd contracts/test && npm install && npm test
 */
'use strict';

const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { VM } = require('@ethereumjs/vm');
const { Address, Account, hexToBytes, bytesToHex } = require('@ethereumjs/util');
const { ethers } = require('ethers');

const CONTRACTS = path.resolve(__dirname, '..');
const REPO = path.resolve(CONTRACTS, '..');

let passed = 0;
let failed = 0;

function check(label, cond, detail = '') {
  if (cond) {
    passed++;
    console.log(`  ✓ ${label}${detail ? '  ' + detail : ''}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}${detail ? '  ' + detail : ''}`);
  }
}

// ---------------------------------------------------------------- compilation

function resolveImport(p) {
  const candidates = [
    path.join(REPO, p),
    path.join(CONTRACTS, p),
    path.join(__dirname, 'node_modules', p),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return { contents: fs.readFileSync(c, 'utf8') };
  }
  return { error: `not found: ${p}` };
}

function compile(target, contractName) {
  const input = {
    language: 'Solidity',
    sources: { [target]: { content: fs.readFileSync(path.join(REPO, target), 'utf8') } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
    },
  };
  const out = JSON.parse(solc.compile(JSON.stringify(input), { import: resolveImport }));
  const errors = (out.errors || []).filter((e) => e.severity === 'error');
  if (errors.length) {
    errors.forEach((e) => console.error(e.formattedMessage));
    throw new Error(`compilation failed: ${target}`);
  }
  const warnings = (out.errors || []).filter((e) => e.severity !== 'error');
  const c = out.contracts[target][contractName];
  return { abi: c.abi, bytecode: c.evm.bytecode.object, warnings };
}

// ------------------------------------------------------------------ evm setup

const CALLER = new Address(hexToBytes('0x' + '11'.repeat(20)));

async function deploy({ abi, bytecode }) {
  const vm = await VM.create();
  await vm.stateManager.putAccount(CALLER, Account.fromAccountData({ balance: 10n ** 20n }));

  const res = await vm.evm.runCall({
    caller: CALLER,
    origin: CALLER,
    gasLimit: 30_000_000n,
    data: hexToBytes('0x' + bytecode),
  });
  if (res.execResult.exceptionError) {
    throw new Error('deployment reverted: ' + res.execResult.exceptionError.error);
  }

  const iface = new ethers.Interface(abi);
  const to = res.createdAddress;

  return async function call(fn, args) {
    const r = await vm.evm.runCall({
      caller: CALLER,
      origin: CALLER,
      to,
      gasLimit: 30_000_000n,
      data: hexToBytes(iface.encodeFunctionData(fn, args)),
    });
    if (r.execResult.exceptionError) {
      let reason = r.execResult.exceptionError.error;
      try {
        reason = iface.parseError(bytesToHex(r.execResult.returnValue))?.name ?? reason;
      } catch { /* not a decodable custom error */ }
      return { revert: reason };
    }
    return { ok: iface.decodeFunctionResult(fn, bytesToHex(r.execResult.returnValue)) };
  };
}

const inputs = (o) => [{
  apyBps: o.apy,
  tvlUsd: o.tvl,
  stewardship: o.st,
  alignment: o.al,
  transparency: o.tr,
  allocations: o.alloc,
  riskScores: o.risk,
}];

// ---------------------------------------------------------------------- tests

async function main() {
  console.log('Compiling contracts…');
  for (const [file, name] of [
    ['contracts/BWTYAMath.sol', 'BWTYAMath'],
    ['contracts/BWSPWisdomRegistry.sol', 'BWSPWisdomRegistry'],
    ['contracts/BWTYAYieldVault.sol', 'BWTYAYieldVault'],
  ]) {
    const { warnings } = compile(file, name);
    check(`compiles: ${file}`, true, warnings.length ? `(${warnings.length} warning(s))` : '(no warnings)');
  }

  const registry = compile('contracts/BWSPWisdomRegistry.sol', 'BWSPWisdomRegistry');
  const call = await deploy(registry);
  console.log('\nBWSPWisdomRegistry deployed to in-memory EVM.');

  // -- tvlDepthScore regression -------------------------------------------
  // This returned 0 for every input before the WAD-scaling fix, silently
  // zeroing 15 of the 100 BWTYA points.
  console.log('\ntvlDepthScore (regression: was hard-zero for all inputs)');
  const tvlExpect = [[1_000_000n, 1n], [10_000_000n, 4n], [50_000_000n, 10n], [100_000_000n, 15n]];
  for (const [tvl, want] of tvlExpect) {
    const r = await call('previewAdvisory', inputs({
      apy: 1200n, tvl, st: 25, al: 25, tr: 20, alloc: [100n], risk: [50n],
    }));
    const got = r.ok[0].tvlScore;
    check(`$${Number(tvl) / 1e6}M → ${want}`, got === want, `got ${got}`);
  }

  // -- fruitSustainabilityCurve -------------------------------------------
  // 22–25 % APY previously scored 0 and then jumped back to ~10 at 25.01 %.
  // 5.00 % also scored 5 points more than 5.01 %.
  console.log('\nfruitSustainabilityCurve (regression: dead zone + boundary cliff)');
  const fruitAt = async (apy) => (await call('previewAdvisory', inputs({
    apy, tvl: 50_000_000n, st: 25, al: 25, tr: 20, alloc: [100n], risk: [50n],
  }))).ok[0].fruitScore;

  check('peak 12 % scores the full 30', (await fruitAt(1200n)) === 30n);
  check('no cliff across 5 %', (await fruitAt(500n)) === (await fruitAt(501n)),
    `${await fruitAt(500n)} vs ${await fruitAt(501n)}`);
  for (const apy of [2200n, 2350n, 2500n]) {
    check(`${Number(apy) / 100} % is not a dead zone`, (await fruitAt(apy)) > 0n, `got ${await fruitAt(apy)}`);
  }
  let prev = 31n;
  let monotone = true;
  for (const apy of [1200n, 1500n, 1800n, 2000n, 2200n, 2500n, 3000n, 5000n, 10000n]) {
    const v = await fruitAt(apy);
    if (v > prev) monotone = false;
    prev = v;
  }
  check('monotonically non-increasing above the peak', monotone);

  // -- diversification ----------------------------------------------------
  console.log('\nEcclesiastes diversification (Ecc 11:2)');
  const conc = (await call('previewAdvisory', inputs({
    apy: 1200n, tvl: 100_000_000n, st: 25, al: 25, tr: 20, alloc: [100n], risk: [50n],
  }))).ok[0];
  const div = (await call('previewAdvisory', inputs({
    apy: 1200n, tvl: 100_000_000n, st: 25, al: 25, tr: 20,
    alloc: [25n, 25n, 25n, 25n], risk: [50n, 50n, 50n, 50n],
  }))).ok[0];
  check('full concentration scores 0', conc.ecclesScore === 0n, `got ${conc.ecclesScore}`);
  check('spreading across 4 positions scores higher', div.ecclesScore > conc.ecclesScore,
    `${div.ecclesScore} > ${conc.ecclesScore}`);

  // -- composite ----------------------------------------------------------
  console.log('\nComposite scoring');
  const best = (await call('previewAdvisory', inputs({
    apy: 1200n, tvl: 100_000_000n, st: 25, al: 25, tr: 20,
    alloc: [25n, 25n, 25n, 25n], risk: [20n, 30n, 40n, 50n],
  }))).ok[0];
  check('ideal protocol scores 100', best.bwtyaScore === 100n, `got ${best.bwtyaScore}`);
  check('conviction is 100 when every dimension maxes', best.convictionScore === 100n, `got ${best.convictionScore}`);
  check('max drawdown within the 0–45 band', best.maxDrawdownPct <= 45n, `got ${best.maxDrawdownPct}`);
  check('Kelly fraction capped at 35 %', best.kellyFractionWad <= 35n * 10n ** 16n,
    `got ${ethers.formatUnits(best.kellyFractionWad, 18)}`);

  // -- input validation ---------------------------------------------------
  console.log('\nInput validation guards');
  const cases = [
    ['AllocationsMustSumTo100', { apy: 1200n, tvl: 1n, st: 25, al: 25, tr: 20, alloc: [50n, 40n], risk: [10n, 10n] }],
    ['DimensionOutOfRange', { apy: 1200n, tvl: 1n, st: 26, al: 25, tr: 20, alloc: [100n], risk: [10n] }],
    ['DimensionOutOfRange', { apy: 1200n, tvl: 1n, st: 25, al: 26, tr: 20, alloc: [100n], risk: [10n] }],
    ['DimensionOutOfRange', { apy: 1200n, tvl: 1n, st: 25, al: 25, tr: 21, alloc: [100n], risk: [10n] }],
    ['DimensionOutOfRange', { apy: 1200n, tvl: 1n, st: 25, al: 25, tr: 20, alloc: [100n], risk: [101n] }],
    ['AllocationLengthMismatch', { apy: 1200n, tvl: 1n, st: 25, al: 25, tr: 20, alloc: [50n, 50n], risk: [10n] }],
  ];
  for (const [want, arg] of cases) {
    const r = await call('previewAdvisory', inputs(arg));
    check(`reverts ${want}`, r.revert === want, r.revert ? `got ${r.revert}` : 'did NOT revert');
  }

  // -- determinism --------------------------------------------------------
  console.log('\nDeterminism');
  const a = (await call('previewAdvisory', inputs({
    apy: 1737n, tvl: 42_000_000n, st: 18, al: 21, tr: 13, alloc: [40n, 35n, 25n], risk: [30n, 55n, 70n],
  }))).ok[0];
  const b = (await call('previewAdvisory', inputs({
    apy: 1737n, tvl: 42_000_000n, st: 18, al: 21, tr: 13, alloc: [40n, 35n, 25n], risk: [30n, 55n, 70n],
  }))).ok[0];
  check('previewAdvisory is deterministic', a.bwtyaScore === b.bwtyaScore && a.convictionScore === b.convictionScore);

  console.log(`\n${failed === 0 ? '✅' : '❌'} ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('\n❌ ' + e.stack);
  process.exit(1);
});
