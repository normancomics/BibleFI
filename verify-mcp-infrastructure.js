#!/usr/bin/env node
/**
 * Comprehensive MCP & Agent Infrastructure Verification Script
 *
 * Verifies file structure, exports, and patterns without executing code.
 * This allows verification in CI without running the full app.
 *
 * "Test everything; hold fast what is good." - 1 Thessalonians 5:21
 */

import { readFile, access } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';

const results = [];

function logResult(component, status, details, error = null) {
  results.push({ component, status, details, error });
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${emoji} ${component}: ${details}`);
  if (error) console.error(`   Error: ${error}`);
}

async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function readFileSafe(path) {
  try {
    return await readFile(path, 'utf-8');
  } catch {
    return null;
  }
}

// ============================================================================
// 1. MCP BIBLICAL SERVER VERIFICATION
// ============================================================================

async function verifyMCPBiblicalServer() {
  console.log('\n🔍 VERIFYING MCP BIBLICAL SERVER\n' + '='.repeat(50));

  const mcpPath = './src/services/mcpBiblicalServer.ts';

  if (!await fileExists(mcpPath)) {
    logResult('MCP Biblical Server File', 'FAIL', 'File not found');
    return;
  }
  logResult('MCP Biblical Server File', 'PASS', 'File exists');

  const content = await readFileSafe(mcpPath);
  if (!content) {
    logResult('MCP Biblical Server', 'FAIL', 'Could not read file');
    return;
  }

  // Check for key components
  const checks = [
    { name: 'MCPBiblicalTool Interface', pattern: /interface MCPBiblicalTool/ },
    { name: 'BiblicalQuery Interface', pattern: /interface BiblicalQuery/ },
    { name: 'BiblicalResponse Interface', pattern: /interface BiblicalResponse/ },
    { name: 'MCPBiblicalServer Class', pattern: /export class MCPBiblicalServer/ },
    { name: 'Singleton Pattern', pattern: /getInstance\(\)/ },
    { name: 'getAvailableTools Method', pattern: /getAvailableTools\(\)/ },
    { name: 'callTool Method', pattern: /callTool\(/ },
    { name: 'search_biblical_financial_wisdom Tool', pattern: /'search_biblical_financial_wisdom'/ },
    { name: 'get_tithing_guidance Tool', pattern: /'get_tithing_guidance'/ },
    { name: 'get_business_partnership_guidance Tool', pattern: /'get_business_partnership_guidance'/ },
    { name: 'get_tax_guidance Tool', pattern: /'get_tax_guidance'/ },
  ];

  for (const check of checks) {
    if (check.pattern.test(content)) {
      logResult(check.name, 'PASS', 'Present');
    } else {
      logResult(check.name, 'FAIL', 'Not found');
    }
  }
}

// ============================================================================
// 2. BWSP SOVEREIGN AGENT VERIFICATION
// ============================================================================

async function verifyBWSPSovereignAgent() {
  console.log('\n🔍 VERIFYING BWSP SOVEREIGN AGENT\n' + '='.repeat(50));

  const agentPath = './src/services/bwsp/sovereignAgent.ts';

  if (!await fileExists(agentPath)) {
    logResult('BWSP Sovereign Agent File', 'FAIL', 'File not found');
    return;
  }
  logResult('BWSP Sovereign Agent File', 'PASS', 'File exists');

  const content = await readFileSafe(agentPath);
  if (!content) {
    logResult('BWSP Sovereign Agent', 'FAIL', 'Could not read file');
    return;
  }

  // Check for 5-step MCP loop
  const checks = [
    { name: 'BWSPSovereignAgent Class', pattern: /export class BWSPSovereignAgent/ },
    { name: 'run Method', pattern: /async run\(query: BWSPQuery\)/ },
    { name: 'Step 1: Retrieve Biblical Scriptures', pattern: /Retrieve Biblical Scriptures/ },
    { name: 'Step 2: Retrieve DeFi Knowledge', pattern: /Retrieve DeFi Knowledge/ },
    { name: 'Step 3: Fetch Live Market Data', pattern: /Fetch Live Market Data/ },
    { name: 'Step 4: Assemble BWSP Context', pattern: /Assemble BWSP Context/ },
    { name: 'Step 5: Synthesize Biblical Wisdom', pattern: /Synthesize Biblical Wisdom/ },
    { name: 'AgentStep Interface', pattern: /AgentStep/ },
    { name: 'startStep Helper', pattern: /function startStep/ },
    { name: 'completeStep Helper', pattern: /function completeStep/ },
    { name: 'failStep Helper', pattern: /function failStep/ },
    { name: 'Wisdom Math Integration', pattern: /authorityWeightedResonance|compositeConfidence|scriptureResonanceScore/ },
  ];

  for (const check of checks) {
    if (check.pattern.test(content)) {
      logResult(check.name, 'PASS', 'Present');
    } else {
      logResult(check.name, 'FAIL', 'Not found');
    }
  }
}

// ============================================================================
// 3. SPANDEX SWAP AGENT VERIFICATION
// ============================================================================

async function verifySpandexSwapAgent() {
  console.log('\n🔍 VERIFYING SPANDEX SWAP AGENT\n' + '='.repeat(50));

  const agentPath = './src/services/spandex/agent.ts';

  if (!await fileExists(agentPath)) {
    logResult('Spandex Swap Agent File', 'FAIL', 'File not found');
    return;
  }
  logResult('Spandex Swap Agent File', 'PASS', 'File exists');

  const content = await readFileSafe(agentPath);
  if (!content) {
    logResult('Spandex Swap Agent', 'FAIL', 'Could not read file');
    return;
  }

  const checks = [
    { name: 'SpandexSwapAgent Class', pattern: /export class SpandexSwapAgent/ },
    { name: 'run Method', pattern: /async run\(input: SpandexSwapAdvisoryInput\)/ },
    { name: 'Spandex Integration', pattern: /getQuote|getQuotes/ },
    { name: 'BWTYA Scoring', pattern: /bwtyaScorer\.scoreAll/ },
    { name: 'BWTYA Ranking', pattern: /bwtyaRanker\.rank/ },
    { name: 'BWSP Integration', pattern: /bwspEngine\.query/ },
    { name: 'Client Sandbox', pattern: /withClientAgentSandbox/ },
    { name: 'Provider Quotes Processing', pattern: /fetchSpandexQuotes/ },
  ];

  for (const check of checks) {
    if (check.pattern.test(content)) {
      logResult(check.name, 'PASS', 'Present');
    } else {
      logResult(check.name, 'FAIL', 'Not found');
    }
  }
}

// ============================================================================
// 4. AGENT SANDBOX & AUTH VERIFICATION
// ============================================================================

async function verifyAgentInfrastructure() {
  console.log('\n🔍 VERIFYING AGENT INFRASTRUCTURE\n' + '='.repeat(50));

  const sandboxPath = './supabase/functions/_shared/agent-sandbox.ts';
  const authPath = './supabase/functions/_shared/agent-auth.ts';

  // Verify Sandbox
  if (!await fileExists(sandboxPath)) {
    logResult('Agent Sandbox File', 'FAIL', 'File not found');
  } else {
    logResult('Agent Sandbox File', 'PASS', 'File exists');

    const sandboxContent = await readFileSafe(sandboxPath);
    if (sandboxContent) {
      const sandboxChecks = [
        { name: 'createAgentSandbox Export', pattern: /export async function createAgentSandbox/ },
        { name: 'checkPermission Export', pattern: /export async function checkPermission/ },
        { name: 'logOperation Export', pattern: /export async function logOperation/ },
        { name: 'sandboxedRead Export', pattern: /export async function sandboxedRead/ },
        { name: 'sandboxedInsert Export', pattern: /export async function sandboxedInsert/ },
        { name: 'sandboxedUpdate Export', pattern: /export async function sandboxedUpdate/ },
        { name: 'completeAgentRun Export', pattern: /export async function completeAgentRun/ },
        { name: 'withAgentSandbox Export', pattern: /export async function withAgentSandbox/ },
        { name: 'AgentContext Interface', pattern: /export interface AgentContext/ },
        { name: 'RPC Gateway Calls', pattern: /supabase\.rpc\('start_agent_run'/ },
        { name: 'Permission Checks', pattern: /check_agent_permission/ },
        { name: 'Operation Logging', pattern: /log_agent_operation/ },
      ];

      for (const check of sandboxChecks) {
        if (check.pattern.test(sandboxContent)) {
          logResult(check.name, 'PASS', 'Present');
        } else {
          logResult(check.name, 'FAIL', 'Not found');
        }
      }
    }
  }

  // Verify Auth
  if (!await fileExists(authPath)) {
    logResult('Agent Auth File', 'FAIL', 'File not found');
  } else {
    logResult('Agent Auth File', 'PASS', 'File exists');

    const authContent = await readFileSafe(authPath);
    if (authContent) {
      const authChecks = [
        { name: 'requireAgentAuth Export', pattern: /export async function requireAgentAuth/ },
        { name: 'unauthorizedResponse Export', pattern: /export function unauthorizedResponse/ },
        { name: 'Cron Secret Auth', pattern: /x-cron-secret/ },
        { name: 'Admin JWT Auth', pattern: /has_role/ },
        { name: 'Service Role Key Auth', pattern: /SUPABASE_SERVICE_ROLE_KEY/ },
      ];

      for (const check of authChecks) {
        if (check.pattern.test(authContent)) {
          logResult(check.name, 'PASS', 'Present');
        } else {
          logResult(check.name, 'FAIL', 'Not found');
        }
      }
    }
  }
}

// ============================================================================
// 5. SUPABASE EDGE FUNCTION AGENTS VERIFICATION
// ============================================================================

async function verifyEdgeFunctionAgents() {
  console.log('\n🔍 VERIFYING SUPABASE EDGE FUNCTION AGENTS\n' + '='.repeat(50));

  const expectedAgents = [
    'biblical-advisor',
    'biblical-wisdom-aggregator',
    'biblical-wisdom-expander',
    'bwsp-sovereign-agent',
    'spandex-swap-agent',
    'defi-opportunity-scanner',
    'church-seeder-agent',
    'church-data-aggregator',
    'church-data-validator',
    'defi-market-watchdog',
    'market-wisdom-correlator',
    'wisdom-score-calculator',
    'scripture-financial-scanner',
    'scripture-integrity-validator',
  ];

  for (const agentName of expectedAgents) {
    const agentPath = `./supabase/functions/${agentName}/index.ts`;

    if (!await fileExists(agentPath)) {
      logResult(`Agent: ${agentName}`, 'WARN', 'File not found');
      continue;
    }

    const content = await readFileSafe(agentPath);
    if (!content) {
      logResult(`Agent: ${agentName}`, 'WARN', 'Could not read file');
      continue;
    }

    // Check for key patterns
    const hasServe = /serve\(|Deno\.serve\(/.test(content);
    const hasCors = /corsHeaders/.test(content);
    const hasAuth = /requireAgentAuth|x-cron-secret/.test(content);
    const hasSandbox = /withAgentSandbox/.test(content);

    let status = 'PASS';
    let details = 'Agent file exists';
    const issues = [];

    if (!hasServe) issues.push('missing serve handler');
    if (!hasCors) issues.push('missing CORS');

    if (issues.length > 0) {
      status = 'WARN';
      details += ` (${issues.join(', ')})`;
    }

    logResult(`Agent: ${agentName}`, status, details);

    // Log additional features
    if (hasSandbox) {
      logResult(`  └─ Sandbox: ${agentName}`, 'PASS', 'Uses agent sandbox');
    }
    if (hasAuth) {
      logResult(`  └─ Auth: ${agentName}`, 'PASS', 'Has authentication');
    }
  }
}

// ============================================================================
// 6. BWTYA SUB-AGENTS VERIFICATION
// ============================================================================

async function verifyBWTYASubAgents() {
  console.log('\n🔍 VERIFYING BWTYA SUB-AGENTS\n' + '='.repeat(50));

  const bwtyaModules = [
    { name: 'scorer', file: './src/services/bwtya/scorer.ts', exports: ['bwtyaScorer'] },
    { name: 'ranker', file: './src/services/bwtya/ranker.ts', exports: ['bwtyaRanker'] },
    { name: 'strategyMapper', file: './src/services/bwtya/strategyMapper.ts', exports: ['bwtyaStrategyMapper'] },
    { name: 'mathEngine', file: './src/services/bwtya/mathEngine.ts', exports: ['kellyFraction', 'paretoDominanceMask'] },
    { name: 'simulator', file: './src/services/bwtya/simulator.ts', exports: ['bwtyaSimulator', 'simulateOpportunity'] },
    { name: 'rebalancer', file: './src/services/bwtya/rebalancer.ts', exports: ['bwtyaRebalancer'] },
  ];

  for (const module of bwtyaModules) {
    if (!await fileExists(module.file)) {
      logResult(`BWTYA Module: ${module.name}`, 'FAIL', 'File not found');
      continue;
    }

    const content = await readFileSafe(module.file);
    if (!content) {
      logResult(`BWTYA Module: ${module.name}`, 'FAIL', 'Could not read file');
      continue;
    }

    let foundExports = 0;
    for (const exportName of module.exports) {
      if (content.includes(exportName)) {
        foundExports++;
      }
    }

    if (foundExports === module.exports.length) {
      logResult(`BWTYA Module: ${module.name}`, 'PASS', `All ${foundExports} exports present`);
    } else {
      logResult(`BWTYA Module: ${module.name}`, 'WARN', `${foundExports}/${module.exports.length} exports found`);
    }
  }
}

// ============================================================================
// 7. BWSP SUB-AGENTS VERIFICATION
// ============================================================================

async function verifyBWSPSubAgents() {
  console.log('\n🔍 VERIFYING BWSP SUB-AGENTS\n' + '='.repeat(50));

  const bwspModules = [
    { name: 'retriever', file: './src/services/bwsp/retriever.ts', exports: ['bwspRetriever'] },
    { name: 'contextAssembler', file: './src/services/bwsp/contextAssembler.ts', exports: ['bwspContextAssembler'] },
    { name: 'synthesizer', file: './src/services/bwsp/synthesizer.ts', exports: ['bwspSynthesizer'] },
    { name: 'wisdomMath', file: './src/services/bwsp/wisdomMath.ts', exports: ['scriptureResonanceScore', 'compositeConfidence'] },
    { name: 'engine', file: './src/services/bwsp/engine.ts', exports: ['bwspEngine'] },
  ];

  for (const module of bwspModules) {
    if (!await fileExists(module.file)) {
      logResult(`BWSP Module: ${module.name}`, 'FAIL', 'File not found');
      continue;
    }

    const content = await readFileSafe(module.file);
    if (!content) {
      logResult(`BWSP Module: ${module.name}`, 'FAIL', 'Could not read file');
      continue;
    }

    let foundExports = 0;
    for (const exportName of module.exports) {
      if (content.includes(exportName)) {
        foundExports++;
      }
    }

    if (foundExports === module.exports.length) {
      logResult(`BWSP Module: ${module.name}`, 'PASS', `All ${foundExports} exports present`);
    } else {
      logResult(`BWSP Module: ${module.name}`, 'WARN', `${foundExports}/${module.exports.length} exports found`);
    }
  }
}

// ============================================================================
// MAIN VERIFICATION RUNNER
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 BibleFI MCP & AGENT INFRASTRUCTURE VERIFICATION');
  console.log('='.repeat(80));
  console.log('\n"Test everything; hold fast what is good." - 1 Thessalonians 5:21\n');

  // Run all verification tests
  await verifyMCPBiblicalServer();
  await verifyBWSPSovereignAgent();
  await verifySpandexSwapAgent();
  await verifyAgentInfrastructure();
  await verifyEdgeFunctionAgents();
  await verifyBWTYASubAgents();
  await verifyBWSPSubAgents();

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARN').length;

  console.log(`\n✅ PASSED: ${passed}`);
  console.log(`❌ FAILED: ${failed}`);
  console.log(`⚠️  WARNINGS: ${warnings}`);
  console.log(`📊 TOTAL: ${results.length}`);

  // Group results by status
  if (failed > 0) {
    console.log('\n❌ FAILED CHECKS:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - ${r.component}: ${r.details}`);
      if (r.error) console.log(`     Error: ${r.error}`);
    });
  }

  if (warnings > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`   - ${r.component}: ${r.details}`);
    });
  }

  // Final verdict
  console.log('\n' + '='.repeat(80));
  if (failed === 0) {
    console.log('✅ MCP & AGENT INFRASTRUCTURE: ALL CRITICAL CHECKS PASSED');
    console.log('='.repeat(80) + '\n');
    return 0;
  } else {
    console.log('❌ MCP & AGENT INFRASTRUCTURE: CRITICAL ISSUES FOUND');
    console.log('='.repeat(80) + '\n');
    return 1;
  }
}

// Run
main().then(process.exit).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
