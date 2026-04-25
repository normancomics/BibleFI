// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/BibleFiUSD.sol";
import "../contracts/BibleFiSuperfluid.sol";

/**
 * @title DeployBibleFiProduction
 * @notice Foundry deployment script for BibleFiUSD and BibleFiSuperfluid on Base Mainnet
 *
 * Usage:
 *   forge script script/DeployBibleFiProduction.s.sol \
 *     --rpc-url https://mainnet.base.org \
 *     --broadcast \
 *     --verify \
 *     --slow
 *
 * Required environment variables (set in .env or shell):
 *   DEPLOYER_PRIVATE_KEY  - Private key of the deployer wallet
 *   OWNER_ADDRESS         - Final owner address (e.g. Gnosis Safe)
 *   CHARITY_WALLET        - Gnosis Safe / charity multisig receiving 10% tithe
 *   MORPHO_VAULT          - Morpho vault address on Base Mainnet
 *   SF_HOST               - Superfluid host on Base Mainnet
 *   SF_CFA                - Superfluid Constant Flow Agreement on Base Mainnet
 *   SF_USDCX              - USDCx SuperToken on Base Mainnet
 */
contract DeployBibleFiProduction is Script {
    // ── Base Mainnet defaults (override via env vars) ──────────────────────

    /// @dev USDC on Base Mainnet (canonical address)
    address constant USDC_BASE = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    /// @dev Morpho USDC vault on Base Mainnet
    address constant MORPHO_VAULT_DEFAULT = 0x616a4E1db48e22028f6bbf20444Cd3b8e3273738;

    /// @dev Superfluid host on Base Mainnet
    address constant SF_HOST_DEFAULT = 0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74;

    /// @dev Superfluid Constant Flow Agreement on Base Mainnet
    address constant SF_CFA_DEFAULT = 0x19ba78B9cDB05A877718841c574325fdB53601bb;

    /// @dev USDCx SuperToken on Base Mainnet — verify exact address before deployment
    address constant SF_USDCX_DEFAULT = 0xD04383398dD2426297da660F9CCD3Ab1B8c2c720;

    // ───────────────────────────────────────────────────────────────────────

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        address owner = vm.envOr("OWNER_ADDRESS", deployer);
        address charity = vm.envAddress("CHARITY_WALLET");
        address morphoVault = vm.envOr("MORPHO_VAULT", MORPHO_VAULT_DEFAULT);
        address sfHost = vm.envOr("SF_HOST", SF_HOST_DEFAULT);
        address sfCfa = vm.envOr("SF_CFA", SF_CFA_DEFAULT);
        address sfUsdcx = vm.envOr("SF_USDCX", SF_USDCX_DEFAULT);

        vm.startBroadcast(deployerKey);

        // 1. Deploy BibleFiUSD
        BibleFiUSD bibleFiUSD = new BibleFiUSD(morphoVault, charity, owner);
        console2.log("BibleFiUSD deployed at:", address(bibleFiUSD));

        // 2. Deploy BibleFiSuperfluid
        BibleFiSuperfluid bibleFiSuperfluid = new BibleFiSuperfluid(sfHost, sfCfa, owner);
        console2.log("BibleFiSuperfluid deployed at:", address(bibleFiSuperfluid));

        // 3. Approve USDCx for use in tithe streams (called as owner = deployer initially)
        //    If owner != deployer, this call must be made separately by the owner multisig.
        if (owner == deployer) {
            bibleFiSuperfluid.setTokenApproval(sfUsdcx, true);
            console2.log("USDCx approved for tithe streams:", sfUsdcx);
        } else {
            console2.log(
                "NOTICE: USDCx approval skipped - must be approved by owner multisig:",
                owner
            );
        }

        vm.stopBroadcast();

        // ── Post-deploy summary ─────────────────────────────────────────────
        console2.log("=== BibleFi Production Deployment Summary ===");
        console2.log("Network        : Base Mainnet");
        console2.log("Deployer       :", deployer);
        console2.log("Owner          :", owner);
        console2.log("Charity Wallet :", charity);
        console2.log("BibleFiUSD     :", address(bibleFiUSD));
        console2.log("BibleFiSuperfluid:", address(bibleFiSuperfluid));
        console2.log("Morpho Vault   :", morphoVault);
        console2.log("Superfluid Host:", sfHost);
        console2.log("USDCx Token    :", sfUsdcx);
        console2.log("Scripture      : Malachi 3:10 - Bring the full tithe into the storehouse");
        console2.log("=============================================");
    }
}
