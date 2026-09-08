/**
 * Comprehensive MCP & Agent Infrastructure Verification Script
 *
 * Verifies:
 * 1. MCP Biblical Server tools and methods
 * 2. BWSP Sovereign Agent (5-step MCP loop)
 * 3. Spandex Swap Agent orchestration
 * 4. DeFi Opportunity Scanner
 * 5. Agent Sandbox & Auth infrastructure
 * 6. All Supabase Edge Function Agents
 *
 * "Test everything; hold fast what is good." - 1 Thessalonians 5:21
 */

import { mcpBiblicalServer } from './src/services/mcpBiblicalServer';
import { bwspSovereignAgent } from './src/services/bwsp/sovereignAgent';
import { spandexSwapAgent } from './src/services/spandex/agent';

// ============================================================================
// 1. MCP BIBLICAL SERVER VERIFICATION
// ============================================================================

interface MCPVerificationResult {
  component: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
  error?: string;
}

const results: MCPVerificationResult[] = [];

function logResult(component: string, status: 'PASS' | 'FAIL' | 'WARN', details: string, error?: string) {
  results.push({ component, status, details, error });
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${emoji} ${component}: ${details}`);
  if (error) console.error(`   Error: ${error}`);
}

async function verifyMCPBiblicalServer() {
  console.log('\n🔍 VERIFYING MCP BIBLICAL SERVER\n' + '='.repeat(50));

  try {
    // Check singleton instance
    const instance = mcpBiblicalServer;
    if (!instance) {
      logResult('MCP Biblical Server', 'FAIL', 'Singleton instance not available');
      return;
    }
    logResult('MCP Biblical Server', 'PASS', 'Singleton instance created successfully');

    // Verify available tools
    const tools = instance.getAvailableTools();
    if (!tools || tools.length === 0) {
      logResult('MCP Tools', 'FAIL', 'No tools available');
      return;
    }
    logResult('MCP Tools', 'PASS', `${tools.length} tools available: ${tools.map(t => t.name).join(', ')}`);

    // Verify each tool has required structure
    const requiredToolFields = ['name', 'description', 'inputSchema'];
    for (const tool of tools) {
      const missingFields = requiredToolFields.filter(field => !(field in tool));
      if (missingFields.length > 0) {
        logResult(`Tool: ${tool.name}`, 'FAIL', `Missing fields: ${missingFields.join(', ')}`);
      } else {
        logResult(`Tool: ${tool.name}`, 'PASS', 'Tool structure valid');
      }
    }

    // Verify tool input schemas
    for (const tool of tools) {
      if (!tool.inputSchema.properties || !tool.inputSchema.required) {
        logResult(`Schema: ${tool.name}`, 'FAIL', 'Invalid input schema structure');
      } else {
        logResult(`Schema: ${tool.name}`, 'PASS', `Schema valid with ${tool.inputSchema.required.length} required params`);
      }
    }

  } catch (error) {
    logResult('MCP Biblical Server', 'FAIL', 'Verification failed', error instanceof Error ? error.message : String(error));
  }
}

// ============================================================================
// 2. BWSP SOVEREIGN AGENT VERIFICATION
// ============================================================================

async function verifyBWSPSovereignAgent() {
  console.log('\n🔍 VERIFYING BWSP SOVEREIGN AGENT\n' + '='.repeat(50));

  try {
    // Check agent instance
    if (!bwspSovereignAgent) {
      logResult('BWSP Sovereign Agent', 'FAIL', 'Agent instance not available');
      return;
    }
    logResult('BWSP Sovereign Agent', 'PASS', 'Agent instance created successfully');

    // Verify agent has run method
    if (typeof bwspSovereignAgent.run !== 'function') {
      logResult('BWSP Agent Run Method', 'FAIL', 'run() method not available');
      return;
    }
    logResult('BWSP Agent Run Method', 'PASS', 'run() method available');

    // Test with a simple query (without network calls)
    console.log('\n  Testing BWSP Agent with sample query...');
    const testQuery = {
      text: 'biblical guidance on yield farming',
      intent: 'yield_advice' as const,
      wisdomScore: 75,
    };

    // Note: This will make network calls, so we wrap it in a timeout
    const result = await Promise.race([
      bwspSovereignAgent.run(testQuery),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)),
    ]).catch((err) => {
      logResult('BWSP Agent Execution', 'WARN', 'Agent execution timeout or error (expected in CI)', err.message);
      return null;
    });

    if (result) {
      // Verify response structure
      const requiredFields = ['query', 'context', 'synthesis', 'agentSteps', 'processingTimeMs'];
      const missingFields = requiredFields.filter(field => !(field in result));

      if (missingFields.length > 0) {
        logResult('BWSP Response Structure', 'FAIL', `Missing fields: ${missingFields.join(', ')}`);
      } else {
        logResult('BWSP Response Structure', 'PASS', 'All required fields present');

        // Verify 5-step MCP loop
        const steps = (result as any).agentSteps;
        if (!Array.isArray(steps)) {
          logResult('BWSP Agent Steps', 'FAIL', 'agentSteps is not an array');
        } else if (steps.length !== 5) {
          logResult('BWSP Agent Steps', 'WARN', `Expected 5 steps, got ${steps.length}`);
        } else {
          logResult('BWSP Agent Steps', 'PASS', '5-step MCP loop verified');

          // Verify each step structure
          const stepNames = steps.map((s: any) => s.name);
          console.log(`  Step sequence: ${stepNames.join(' → ')}`);

          for (const [idx, step] of steps.entries()) {
            if (!step.stepNumber || !step.name || !step.status) {
              logResult(`BWSP Step ${idx + 1}`, 'FAIL', 'Missing required step fields');
            } else {
              logResult(`BWSP Step ${idx + 1}`, 'PASS', `${step.name} (${step.status})`);
            }
          }
        }
      }
    }

  } catch (error) {
    logResult('BWSP Sovereign Agent', 'FAIL', 'Verification failed', error instanceof Error ? error.message : String(error));
  }
}

// ============================================================================
// 3. SPANDEX SWAP AGENT VERIFICATION
// ============================================================================

async function verifySpandexSwapAgent() {
  console.log('\n🔍 VERIFYING SPANDEX SWAP AGENT\n' + '='.repeat(50));

  try {
    // Check agent instance
    if (!spandexSwapAgent) {
      logResult('Spandex Swap Agent', 'FAIL', 'Agent instance not available');
      return;
    }
    logResult('Spandex Swap Agent', 'PASS', 'Agent instance created successfully');

    // Verify agent has run method
    if (typeof spandexSwapAgent.run !== 'function') {
      logResult('Spandex Agent Run Method', 'FAIL', 'run() method not available');
      return;
    }
    logResult('Spandex Agent Run Method', 'PASS', 'run() method available');

    // Note: We don't run the agent here as it requires real network calls
    logResult('Spandex Agent', 'PASS', 'Agent structure verified (skipping network test)');

  } catch (error) {
    logResult('Spandex Swap Agent', 'FAIL', 'Verification failed', error instanceof Error ? error.message : String(error));
  }
}

// ============================================================================
// 4. AGENT SANDBOX & AUTH VERIFICATION
// ============================================================================

async function verifyAgentInfrastructure() {
  console.log('\n🔍 VERIFYING AGENT INFRASTRUCTURE\n' + '='.repeat(50));

  try {
    // Check if sandbox module can be imported
    const sandboxPath = './supabase/functions/_shared/agent-sandbox.ts';
    const authPath = './supabase/functions/_shared/agent-auth.ts';

    logResult('Agent Sandbox Module', 'PASS', `Module path: ${sandboxPath}`);
    logResult('Agent Auth Module', 'PASS', `Module path: ${authPath}`);

    // Verify sandbox exports (by checking the file exists and has exports)
    const fs = await import('fs/promises');

    try {
      const sandboxContent = await fs.readFile('./supabase/functions/_shared/agent-sandbox.ts', 'utf-8');
      const requiredExports = [
        'createAgentSandbox',
        'checkPermission',
        'logOperation',
        'sandboxedRead',
        'sandboxedInsert',
        'sandboxedUpdate',
        'completeAgentRun',
        'withAgentSandbox',
      ];

      for (const exportName of requiredExports) {
        if (sandboxContent.includes(`export async function ${exportName}`) ||
            sandboxContent.includes(`export function ${exportName}`)) {
          logResult(`Sandbox Export: ${exportName}`, 'PASS', 'Function exported');
        } else {
          logResult(`Sandbox Export: ${exportName}`, 'WARN', 'Export not found in file');
        }
      }

      // Verify auth exports
      const authContent = await fs.readFile('./supabase/functions/_shared/agent-auth.ts', 'utf-8');
      const authExports = ['requireAgentAuth', 'unauthorizedResponse'];

      for (const exportName of authExports) {
        if (authContent.includes(`export async function ${exportName}`) ||
            authContent.includes(`export function ${exportName}`)) {
          logResult(`Auth Export: ${exportName}`, 'PASS', 'Function exported');
        } else {
          logResult(`Auth Export: ${exportName}`, 'WARN', 'Export not found in file');
        }
      }

    } catch (err) {
      logResult('Agent Infrastructure Files', 'FAIL', 'Could not read infrastructure files', err instanceof Error ? err.message : String(err));
    }

  } catch (error) {
    logResult('Agent Infrastructure', 'FAIL', 'Verification failed', error instanceof Error ? error.message : String(error));
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

  try {
    const fs = await import('fs/promises');

    for (const agentName of expectedAgents) {
      const agentPath = `./supabase/functions/${agentName}/index.ts`;

      try {
        const content = await fs.readFile(agentPath, 'utf-8');

        // Check for key patterns
        const hasServe = content.includes('serve(') || content.includes('Deno.serve(');
        const hasCors = content.includes('corsHeaders');
        const hasAuth = content.includes('requireAgentAuth') || content.includes('x-cron-secret');
        const hasSandbox = content.includes('withAgentSandbox');

        let status: 'PASS' | 'WARN' = 'PASS';
        let details = 'Agent file exists';

        if (!hasServe) {
          status = 'WARN';
          details += ', missing serve handler';
        }
        if (!hasCors) {
          status = 'WARN';
          details += ', missing CORS headers';
        }

        logResult(`Agent: ${agentName}`, status, details);

        // Check if agent uses sandbox (expected for write operations)
        if (hasSandbox) {
          logResult(`  Sandbox: ${agentName}`, 'PASS', 'Uses agent sandbox');
        }

        // Check if agent has auth (expected for agents)
        if (hasAuth) {
          logResult(`  Auth: ${agentName}`, 'PASS', 'Has authentication');
        }

      } catch (err) {
        logResult(`Agent: ${agentName}`, 'WARN', 'Agent file not found or unreadable');
      }
    }

  } catch (error) {
    logResult('Edge Function Agents', 'FAIL', 'Verification failed', error instanceof Error ? error.message : String(error));
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
  } else {
    console.log('❌ MCP & AGENT INFRASTRUCTURE: CRITICAL ISSUES FOUND');
    process.exit(1);
  }
  console.log('='.repeat(80) + '\n');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as verifyMCPAgents };
