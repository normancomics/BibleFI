// Optimized Base Chain RPC endpoints from chainlist
export const BASE_RPC_ENDPOINTS = [
  // Primary - fastest endpoints
  'https://base.rpc.subquery.network/public', // 0.063s latency
  'https://base.gateway.tenderly.co', // 0.064s latency
  'https://base.drpc.org', // 0.084s latency
  
  // Secondary - reliable endpoints
  'https://base-mainnet.public.blastapi.io', // 0.100s
  'https://mainnet.base.org', // 0.111s - official
  'https://developer-access-mainnet.base.org', // 0.111s - official
  'https://base-mainnet.gateway.tatum.io', // 0.114s
  'https://base.lava.build', // 0.115s
  
  // Tertiary - backup endpoints
  'https://base.llamarpc.com', // 0.139s
  'https://base-public.nodies.app', // 0.185s
  'https://0xrpc.io/base', // 0.196s
  'https://base.meowrpc.com', // 0.198s
  'https://api.zan.top/base-mainnet', // 0.302s
];

export const WEBSOCKET_ENDPOINTS = [
  'wss://base-rpc.publicnode.com',
  'wss://base.gateway.tenderly.co',
  'wss://0xrpc.io/base',
];

// RPC endpoint health checker
export class RPCHealthChecker {
  private static instance: RPCHealthChecker;
  private healthyEndpoints: string[] = [...BASE_RPC_ENDPOINTS];
  private lastCheck = 0;
  private checkInterval = 5 * 60 * 1000; // 5 minutes

  static getInstance(): RPCHealthChecker {
    if (!this.instance) {
      this.instance = new RPCHealthChecker();
    }
    return this.instance;
  }

  async getHealthyEndpoint(): Promise<string> {
    const now = Date.now();
    
    // Refresh health check if needed
    if (now - this.lastCheck > this.checkInterval) {
      await this.checkEndpointHealth();
      this.lastCheck = now;
    }

    return this.healthyEndpoints[0] || BASE_RPC_ENDPOINTS[0];
  }

  private async checkEndpointHealth(): Promise<void> {
    const healthPromises = BASE_RPC_ENDPOINTS.map(async (endpoint) => {
      try {
        const start = Date.now();
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1,
          }),
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        
        if (response.ok) {
          const latency = Date.now() - start;
          return { endpoint, latency, healthy: true };
        }
        return { endpoint, latency: Infinity, healthy: false };
      } catch {
        return { endpoint, latency: Infinity, healthy: false };
      }
    });

    const results = await Promise.all(healthPromises);
    
    // Sort by health and latency
    this.healthyEndpoints = results
      .filter(r => r.healthy)
      .sort((a, b) => a.latency - b.latency)
      .map(r => r.endpoint);

    console.log('RPC Health Check Results:', {
      healthy: this.healthyEndpoints.length,
      total: BASE_RPC_ENDPOINTS.length,
      fastest: this.healthyEndpoints[0],
    });
  }
}

export const rpcHealthChecker = RPCHealthChecker.getInstance();