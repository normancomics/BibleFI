// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console2 } from "forge-std/Script.sol";
import { BWSPWisdomRegistry } from "../contracts/BWSPWisdomRegistry.sol";
import { BWTYAYieldVault } from "../contracts/BWTYAYieldVault.sol";

/**
 * @title DeployBWTYAVault
 * @notice One-command Base Sepolia deployment of the BWTYA yield vault.
 *
 * "Honour the LORD with thy substance, and with the firstfruits of all thine
 *  increase" — Proverbs 3:9 (KJV). The vault enforces the mandatory 10%
 *  tithe-on-yield on-chain before any steward may claim.
 *
 * Usage:
 *   export DEPLOYER_PRIVATE_KEY=0x...          # funded Base Sepolia wallet
 *   export DEPOSIT_TOKEN=0x036CbD53842c5426634e7929541eC2318f3dCF7e  # USDC (Base Sepolia)
 *   export TREASURY=0x...                      # church/DAO treasury receiving the tithe
 *   export BASE_APY_BPS=800                    # 8% base APY
 *   forge script script/DeployBWTYAVault.s.sol \
 *     --rpc-url https://sepolia.base.org --broadcast --verify
 */
contract DeployBWTYAVault is Script {
    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address depositToken = vm.envAddress("DEPOSIT_TOKEN");
        address treasury = vm.envAddress("TREASURY");
        uint256 baseApyBps = vm.envOr("BASE_APY_BPS", uint256(800));

        // Reuse an existing wisdom registry when one is already live.
        address existingRegistry = vm.envOr("WISDOM_REGISTRY", address(0));

        vm.startBroadcast(pk);

        address registry = existingRegistry;
        if (registry == address(0)) {
            registry = address(new BWSPWisdomRegistry());
            console2.log("BWSPWisdomRegistry:", registry);
        }

        BWTYAYieldVault vault = new BWTYAYieldVault(depositToken, treasury, registry, baseApyBps);

        vm.stopBroadcast();

        console2.log("BWTYAYieldVault:   ", address(vault));
        console2.log("Deposit token:     ", depositToken);
        console2.log("Treasury:          ", treasury);
        console2.log("Base APY (bps):    ", baseApyBps);
        console2.log("");
        console2.log("Add to .env:");
        console2.log("VITE_BWTYA_VAULT_CHAIN=base-sepolia");
        console2.log("VITE_BWTYA_VAULT_BASE_SEPOLIA=", address(vault));
    }
}
