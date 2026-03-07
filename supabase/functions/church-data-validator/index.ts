import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { withAgentSandbox, sandboxedRead, sandboxedUpdate, sandboxedInsert, logOperation, type AgentContext } from '../_shared/agent-sandbox.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationResult {
  church_id: string;
  church_name: string;
  issues: string[];
  severity: 'info' | 'warning' | 'critical';
  action_taken: string | null;
}

// Security patterns to flag
const SUSPICIOUS_PATTERNS = {
  wallet_address: [
    /^0x0{40}$/i, // null address
    /^0xdead/i,   // dead address
    /^0x000000000000000000000000000000000000dead$/i,
  ],
  email: [
    /tempmail/i, /guerrillamail/i, /mailinator/i, /throwaway/i,
    /yopmail/i, /sharklasers/i, /dispostable/i,
  ],
  name: [
    /^test/i, /^fake/i, /^asdf/i, /^xxx/i, /sql|inject|script|<|>/i,
    /drop\s+table/i, /union\s+select/i, /--/,
  ],
  website: [
    /phishing/i, /scam/i, /hack/i, /malware/i,
  ],
};

function detectSecurityIssues(church: any): string[] {
  const issues: string[] = [];

  // Check name for injection attempts
  if (church.name) {
    for (const pattern of SUSPICIOUS_PATTERNS.name) {
      if (pattern.test(church.name)) {
        issues.push(`SECURITY: Suspicious church name pattern detected: "${church.name}"`);
        break;
      }
    }
  }

  // Check wallet address
  if (church.crypto_address) {
    for (const pattern of SUSPICIOUS_PATTERNS.wallet_address) {
      if (pattern.test(church.crypto_address)) {
        issues.push(`SECURITY: Suspicious wallet address: ${church.crypto_address}`);
        break;
      }
    }
    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(church.crypto_address)) {
      issues.push(`SECURITY: Invalid wallet address format`);
    }
  }

  // Check email for disposable domains
  if (church.email) {
    for (const pattern of SUSPICIOUS_PATTERNS.email) {
      if (pattern.test(church.email)) {
        issues.push(`SECURITY: Disposable/suspicious email domain detected`);
        break;
      }
    }
  }

  // Check website
  if (church.website) {
    for (const pattern of SUSPICIOUS_PATTERNS.website) {
      if (pattern.test(church.website)) {
        issues.push(`SECURITY: Suspicious website URL detected`);
        break;
      }
    }
  }

  return issues;
}

function validateDataQuality(church: any): string[] {
  const issues: string[] = [];

  // Required fields check
  if (!church.name?.trim()) issues.push('DATA: Missing church name');
  if (!church.city?.trim()) issues.push('DATA: Missing city');
  if (!church.country?.trim()) issues.push('DATA: Missing country');

  // Stale data check (no update in 90 days)
  if (church.updated_at) {
    const lastUpdate = new Date(church.updated_at);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 90) {
      issues.push(`DATA: Stale record - last updated ${Math.round(daysSinceUpdate)} days ago`);
    }
  }

  // Crypto acceptance but no wallet
  if (church.accepts_crypto && !church.crypto_address) {
    issues.push('DATA: Marked as accepting crypto but no wallet address provided');
  }

  // Website reachability hint (we just flag unreachable-looking URLs)
  if (church.website && !church.website.startsWith('http')) {
    issues.push('DATA: Website URL missing protocol (http/https)');
  }

  // Denomination validation
  if (church.denomination && church.denomination.length < 3) {
    issues.push('DATA: Denomination name too short, likely invalid');
  }

  // Duplicate name detection hint
  if (church.name && church.name.length < 4) {
    issues.push('DATA: Church name suspiciously short');
  }

  return issues;
}

function determineSeverity(issues: string[]): 'info' | 'warning' | 'critical' {
  if (issues.some(i => i.startsWith('SECURITY:'))) return 'critical';
  if (issues.some(i => i.startsWith('DATA: Stale') || i.startsWith('DATA: Marked'))) return 'warning';
  return 'info';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'validate'; // 'validate' | 'status' | 'seed'
    const batchSize = body.batchSize || 50;
    const offset = body.offset || 0;

    if (mode === 'status') {
      const { count: totalChurches } = await supabase
        .from('global_churches')
        .select('*', { count: 'exact', head: true });

      const { count: verifiedChurches } = await supabase
        .from('global_churches')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true);

      const { count: cryptoChurches } = await supabase
        .from('global_churches')
        .select('*', { count: 'exact', head: true })
        .eq('accepts_crypto', true);

      return new Response(JSON.stringify({
        success: true,
        agent: 'church-data-validator',
        status: {
          total_churches: totalChurches || 0,
          verified_churches: verifiedChurches || 0,
          crypto_enabled: cryptoChurches || 0,
          last_run: new Date().toISOString(),
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (mode === 'seed') {
      // Seed new churches from OpenStreetMap via Nominatim
      const regions = [
        { country: 'US', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'] },
        { country: 'GB', cities: ['London', 'Manchester', 'Birmingham'] },
        { country: 'NG', cities: ['Lagos', 'Abuja'] },
        { country: 'KE', cities: ['Nairobi'] },
        { country: 'BR', cities: ['São Paulo', 'Rio de Janeiro'] },
      ];

      const region = regions[Math.floor(Math.random() * regions.length)];
      const city = region.cities[Math.floor(Math.random() * region.cities.length)];

      let seeded = 0;
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?q=church+in+${encodeURIComponent(city)}+${region.country}&format=json&limit=10&addressdetails=1`,
          { headers: { 'User-Agent': 'BibleFi/1.0 (contact@bible.fi)' } }
        );

        if (resp.ok) {
          const results = await resp.json();
          for (const r of results) {
            if (!r.display_name) continue;
            const name = r.display_name.split(',')[0].trim();
            if (name.length < 4) continue;

            // Check for duplicate
            const { data: existing } = await supabase
              .from('global_churches')
              .select('id')
              .ilike('name', name)
              .eq('city', city)
              .limit(1);

            if (existing && existing.length > 0) continue;

            await supabase.from('global_churches').insert({
              name,
              city,
              country: region.country,
              state_province: r.address?.state || null,
              address: r.display_name,
              denomination: null,
              verified: false,
              accepts_crypto: false,
              accepts_fiat: true,
            });
            seeded++;
          }
        }
      } catch (err) {
        console.error(`Seed error for ${city}:`, err);
      }

      return new Response(JSON.stringify({
        success: true,
        agent: 'church-data-validator',
        mode: 'seed',
        region: `${city}, ${region.country}`,
        churches_seeded: seeded,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Validate mode: check existing records
    const { data: churches, error } = await supabase
      .from('global_churches')
      .select('*')
      .range(offset, offset + batchSize - 1)
      .order('updated_at', { ascending: true }); // oldest first

    if (error) throw error;

    const validationResults: ValidationResult[] = [];
    let criticalCount = 0;
    let warningCount = 0;
    let actionsCount = 0;

    for (const church of churches || []) {
      const securityIssues = detectSecurityIssues(church);
      const dataIssues = validateDataQuality(church);
      const allIssues = [...securityIssues, ...dataIssues];

      if (allIssues.length === 0) continue;

      const severity = determineSeverity(allIssues);
      let actionTaken: string | null = null;

      // Auto-actions for critical issues
      if (severity === 'critical') {
        criticalCount++;
        // Flag as unverified if security issue found
        await supabase
          .from('global_churches')
          .update({ verified: false, updated_at: new Date().toISOString() })
          .eq('id', church.id);
        actionTaken = 'Unverified due to security concern';
        actionsCount++;
      } else if (severity === 'warning') {
        warningCount++;
      }

      validationResults.push({
        church_id: church.id,
        church_name: church.name,
        issues: allIssues,
        severity,
        action_taken: actionTaken,
      });
    }

    console.log(`⛪ Church Data Validator: Checked ${churches?.length || 0} churches, ${criticalCount} critical, ${warningCount} warnings, ${actionsCount} actions taken`);

    return new Response(JSON.stringify({
      success: true,
      agent: 'church-data-validator',
      checked: churches?.length || 0,
      issues_found: validationResults.length,
      critical: criticalCount,
      warnings: warningCount,
      actions_taken: actionsCount,
      results: validationResults.slice(0, 10),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Church Data Validator error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
