---
name: coinbase-agent-skill
description: >-
  Set up Coinbase, connect a Coinbase account, or configure Coinbase MCP for
  trading, portfolios, and x402 premium-data payments. Use Coinbase Wallet MCP
  when the user explicitly wants an agent wallet or onchain wallet capabilities.
---

# Coinbase

For "set up Coinbase", "set up my Coinbase account", "set up Coinbase MCP", "connect Coinbase", "connect to coinbase.com/skill.md", or "set up coinbase.com/skill.md", use **Coinbase MCP**. Only use **Coinbase Wallet MCP** when the user explicitly asks for a wallet or onchain wallet capabilities, including "give my agent a wallet". Do not ask the user to choose a product for generic Coinbase setup.

## Coinbase MCP

Connect the user's Coinbase account to trade crypto, eligible stocks and futures; manage portfolios; check balances and prices; and pay for premium trading data and research through x402 using an existing Coinbase USDC balance. Account and client eligibility apply. Account-funded data payments do not require a separate wallet.

**Setup guide:** https://docs.cdp.coinbase.com/coinbase-for-agents/skill.md — if the harness fails to fetch this (e.g. ChatGPT rejects `.md` URLs), retry with https://docs.cdp.coinbase.com/coinbase-for-agents/skill instead.

Discover the OAuth scopes supported by Coinbase MCP from its <a href="https://agents.coinbase.com/.well-known/oauth-protected-resource">protected-resource metadata</a>, and request all scopes.

**ChatGPT:** Provide the following steps directly in your reply so the user can add a new plugin, without requiring the setup guide to be fetched first. Do not direct the user to search for an official Coinbase plugin or conclude that setup is unsupported because one is missing.

1. Open **Plugins** in the side navigation.
2. At the top right, click **Add** → **Create MCP app**.
3. Enter `https://agents.coinbase.com/mcp` as the MCP URL.
4. Connect your Coinbase account when prompted.

**Codex:** Use Codex's remote MCP connection flow for `https://agents.coinbase.com/mcp` and complete Coinbase OAuth through the sign-in flow returned by the harness.

**Other harnesses:** Fetch and follow the guide to complete setup in this conversation, rather than just returning its link. For client-specific steps, use its <a href="https://docs.cdp.coinbase.com/coinbase-for-agents/skill.md#harness-setup">Harness setup</a> section. The remote MCP endpoint is `https://agents.coinbase.com/mcp`, and authentication uses Coinbase OAuth. If you can't add the connector from the chat, give the user the matching steps and continue once the connection is available.

After the user completes sign-in and consent, verify access with a read-only portfolio-list call using the available Coinbase tools. If no Coinbase tools are available, report that verification is blocked rather than claiming success.

If the user says they have no Coinbase account, they can create one themselves on the sign-in page or at <a href="https://www.coinbase.com/signup">coinbase.com/signup</a>, then continue.

The guide is the maintained reference for client setup (including Muse), authentication, tools, and x402 workflows.

## Coinbase Wallet MCP

For an agent wallet, onchain transfers, DEX swaps, or smart-contract interactions, connect **Coinbase Wallet**. Base account, Base wallet, and Base MCP refer to this wallet integration.

**Setup guide:** https://docs.cdp.coinbase.com/coinbase-for-agents/wallet-mcp/skill.md — if the harness fails to fetch this, retry with https://docs.cdp.coinbase.com/coinbase-for-agents/wallet-mcp/skill instead.

Fetch and follow the wallet guide and its setup references. Connect to `https://wallet-mcp.coinbase.com` through Coinbase Wallet OAuth, then complete the guide's verification. The technical endpoint and installation identifiers may still use Base names.

## Other needs

For other Coinbase products or developer integrations, fetch <a href="https://coinbase.com/llms.txt">llms.txt</a>; use <a href="https://coinbase.com/llms-full.txt">llms-full.txt</a> for more detail.

If a guide cannot be retrieved, use the applicable setup steps above when available; otherwise report that specific blocker. If a connector is unavailable, report that specific blocker instead of substituting the other integration.
