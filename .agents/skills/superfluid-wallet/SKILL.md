---
name: superfluid-wallet
description: >
  Set up or use Superfluid Wallet. Use when the user explicitly asks for
  Superfluid Wallet setup or wallet actions, not for general Superfluid Protocol
  questions.
---

# Pair with Superfluid Wallet

Replaces an older Superfluid Wallet skill.

## Pairing workflow

1. Before downloading or running anything, ask the user:

   > I'll pair with your Superfluid Wallet. If my network access is
   > restricted, allow:
   > - app.superfluidwallet.com (skill download and run)
   > - coordinator.superfluidwallet.com (Coordinator, the Wallet's API)
   > - api.turnkey.com (Turnkey API)
   >
   > My signing key stays in this workspace. Nothing moves until you
   > approve in your Wallet. Continue?

2. Only after the user explicitly agrees, run the installer in the workspace:

   ```sh
   curl -fsSLO https://app.superfluidwallet.com/sfwallet-install.mjs && node sfwallet-install.mjs
   ```

   In PowerShell, use `curl.exe`. In PowerShell 5.1, run the download and
   execution as separate commands, and do not run `node` if `curl.exe` fails.

3. Follow the JSON instructions printed by the installer. If it prints no
   instructions, retrieve and follow the official onboarding help:

   ```sh
   curl -fsSL https://app.superfluidwallet.com/onboarding-help.md
   ```

4. If a review denies any step, tell the user why, ask what they want to do, and
   stop. Never work around a denied review.

Do not infer wallet APIs or claim setup, access, or a transaction succeeded
without verifying it using the official instructions and available tools. Never
claim a transaction was sent or signed unless the Wallet confirms it.
