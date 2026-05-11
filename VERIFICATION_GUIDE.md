# MCP & Sovereign Agent Verification Guide

## Quick Start

Run the verification script to check all MCP and agent infrastructure:

```bash
node verify-mcp-infrastructure.js
```

**Expected Output**: ✅ ALL SYSTEMS OPERATIONAL (96/96 checks passed)

---

## What Gets Verified

### 1. MCP Biblical Server
- 4 MCP tools (search_biblical_financial_wisdom, get_tithing_guidance, get_business_partnership_guidance, get_tax_guidance)
- Interface definitions and type safety
- Singleton pattern implementation

### 2. BWSP Sovereign Agent
- 5-step MCP loop implementation:
  1. Retrieve Biblical Scriptures
  2. Retrieve DeFi Knowledge
  3. Fetch Live Market Data
  4. Assemble BWSP Context
  5. Synthesize Biblical Wisdom
- Wisdom math integration (resonance, confidence, decay)
- Error handling and fallbacks

### 3. Spandex Swap Agent
- Multi-provider integration (Fabric, Odos, KyberSwap, LI.FI)
- BWTYA scoring and ranking pipeline
- BWSP wisdom synthesis
- Client-side sandbox execution

### 4. Agent Infrastructure
- Agent Sandbox (8 functions: createAgentSandbox, checkPermission, logOperation, sandboxedRead/Insert/Update, completeAgentRun, withAgentSandbox)
- Agent Auth (3 methods: cron secret, admin JWT, service role key)
- RPC gateway calls and audit logging

### 5. Edge Function Agents (14 agents)
- Biblical wisdom agents (biblical-advisor, biblical-wisdom-aggregator, biblical-wisdom-expander)
- BWSP/BWTYA agents (bwsp-sovereign-agent, spandex-swap-agent)
- DeFi agents (defi-opportunity-scanner, defi-market-watchdog, market-wisdom-correlator)
- Church agents (church-seeder-agent, church-data-aggregator, church-data-validator)
- Scripture agents (scripture-financial-scanner, scripture-integrity-validator, wisdom-score-calculator)

### 6. BWTYA Sub-Agents (6 modules)
- scorer, ranker, strategyMapper
- mathEngine, simulator, rebalancer

### 7. BWSP Sub-Agents (5 modules)
- retriever, contextAssembler, synthesizer
- wisdomMath, engine

---

## Understanding the Results

### ✅ PASS
- Component is present and correctly implemented
- No issues found

### ⚠️ WARN
- Component present but may have non-critical issues
- Review recommended but not blocking

### ❌ FAIL
- Critical component missing or incorrectly implemented
- Must be fixed before production deployment

---

## Continuous Integration

### GitHub Actions

Add this to your CI workflow:

```yaml
- name: Verify MCP Infrastructure
  run: node verify-mcp-infrastructure.js
```

### Pre-deployment Check

Always run before deploying:

```bash
npm run build && node verify-mcp-infrastructure.js
```

---

## Troubleshooting

### Script Returns "File not found"
- Ensure you're running from the repository root
- Check that all agent files are committed

### Exit Code 1
- Critical checks failed
- Review the FAILED CHECKS section in output
- Fix issues before deploying

### Missing Exports Warning
- Check if module exports match expected patterns
- Update verification script if exports were intentionally renamed

---

## Adding New Agents

When adding a new agent, update the verification script:

1. **Edge Function Agent**: Add to `expectedAgents` array in `verifyEdgeFunctionAgents()`
2. **BWTYA Module**: Add to `bwtyaModules` array in `verifyBWTYASubAgents()`
3. **BWSP Module**: Add to `bwspModules` array in `verifyBWSPSubAgents()`

Example:
```javascript
const expectedAgents = [
  // ... existing agents
  'your-new-agent-name',
];
```

---

## Security Notes

### Agent Sandbox
- All write operations MUST use sandbox
- Sandbox enforces per-agent permissions
- All operations are audit logged

### Agent Authentication
- Production agents MUST have authentication
- Use cron secret for scheduled agents
- Use admin JWT for manual triggers
- Service role key for internal calls

### Required Patterns
```typescript
// ✅ Good: Uses sandbox
await withAgentSandbox({ agentName: 'my-agent' }, async (ctx) => {
  await sandboxedInsert(ctx, 'table_name', data);
});

// ❌ Bad: Direct database access
await supabase.from('table_name').insert(data);
```

---

## Performance Benchmarks

Expected verification times:
- **Script Execution**: < 1 second
- **Full Verification**: < 5 seconds (including file I/O)
- **CI Integration**: < 10 seconds (with npm install)

---

## Related Documentation

- [MCP_VERIFICATION_REPORT.md](./MCP_VERIFICATION_REPORT.md) - Full verification report
- [supabase/functions/_shared/agent-sandbox.ts](./supabase/functions/_shared/agent-sandbox.ts) - Sandbox implementation
- [supabase/functions/_shared/agent-auth.ts](./supabase/functions/_shared/agent-auth.ts) - Auth implementation
- [src/services/mcpBiblicalServer.ts](./src/services/mcpBiblicalServer.ts) - MCP server
- [src/services/bwsp/sovereignAgent.ts](./src/services/bwsp/sovereignAgent.ts) - BWSP agent
- [src/services/spandex/agent.ts](./src/services/spandex/agent.ts) - Spandex agent

---

## Support

For issues with the verification script:
1. Check that you're on the latest version of the main branch
2. Ensure Node.js v18+ is installed
3. Run from repository root directory
4. Review error messages in FAILED CHECKS section

---

**Last Updated**: 2026-05-05
**Script Version**: 1.0
**Maintained By**: BibleFI Engineering Team
