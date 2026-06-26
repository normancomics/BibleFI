// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  DeployFullProtocol
 * @notice Foundry broadcast script — deploys the complete BibleFi protocol
 *         in the correct dependency order on Base mainnet.
 *
 * Deployment order (each depends on the previous)
 * ─────────────────────────────────────────────────
 *   1.  WisdomOracle          — seeds all 10 Scripture references at deploy
 *   2.  $BIBLEFI Pure Super Token
 *   3.  $WISDOM  Pure Super Token
 *   4.  BibleFiSuperfluid     — tithe streaming; needs Host + CFA + tokens
 *   5.  BWTYACore             — yield pools; needs tokens + oracle + superfluid
 *
 * Usage
 * ─────
 *   # Dry-run
 *   forge script script/DeployFullProtocol.s.sol:DeployFullProtocol \
 *     --rpc-url $BASE_RPC_URL -vvvv
 *
 *   # Broadcast + verify
 *   forge script script/DeployFullProtocol.s.sol:DeployFullProtocol \
 *     --rpc-url $BASE_RPC_URL \
 *     --private-key $DEPLOYER_PK \
 *     --broadcast \
 *     --verify \
 *     --etherscan-api-key $BASESCAN_API_KEY \
 *     -vvvv
 */

import { Script, console2 } from "forge-std/Script.sol";
import {
    BibleFiPureSuperToken,
    IBibleFiPureSuperToken
} from "../src/BibleFiPureSuperToken.sol";
import { BibleFiSuperfluid }  from "../src/BibleFiSuperfluid.sol";
import { BWTYACore }           from "../src/BWTYACore.sol";
import { WisdomOracle }        from "../src/WisdomOracle.sol";
import {
    ISuperTokenFactory,
    ISuperfluid
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import {
    ISuperToken
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";

contract DeployFullProtocol is Script {

    // ─── Base mainnet addresses ───────────────────────────────────────────────
    address constant SUPER_TOKEN_FACTORY = 0x73743A7B7af23CAc5A3BFBD11B0CF0A3D11E7CA3;
    address constant SUPERFLUID_HOST     = 0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74;
    address constant CFAv1               = 0x19ba78B9cDB05A877718841c574325fdB53601bB;
    address constant TREASURY            = 0x7bEda57074AA917FF0993fb329E16C2c188baF08;

    uint256 constant INITIAL_SUPPLY = 1_000_000_000 * 1e18;

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PK");
        address deployer    = vm.addr(deployerKey);

        console2.log("=== BibleFi Full Protocol Deploy ===");
        console2.log("Deployer: ", deployer);
        console2.log("Treasury: ", TREASURY);
        console2.log("");

        vm.startBroadcast(deployerKey);

        // 1. WisdomOracle (seeds all Scripture refs in constructor)
        WisdomOracle oracle = new WisdomOracle();
        console2.log("1. WisdomOracle:      ", address(oracle));

        // 2. $BIBLEFI Pure Super Token
        BibleFiPureSuperToken biblefi = new BibleFiPureSuperToken();
        IBibleFiPureSuperToken(address(biblefi)).initialize(
            ISuperTokenFactory(SUPER_TOKEN_FACTORY),
            "BibleFi Governance", "BIBLEFI", TREASURY, INITIAL_SUPPLY
        );
        console2.log("2. $BIBLEFI:          ", address(biblefi));

        // 3. $WISDOM Pure Super Token
        BibleFiPureSuperToken wisdom = new BibleFiPureSuperToken();
        IBibleFiPureSuperToken(address(wisdom)).initialize(
            ISuperTokenFactory(SUPER_TOKEN_FACTORY),
            "BibleFi Wisdom", "WISDOM", TREASURY, INITIAL_SUPPLY
        );
        console2.log("3. $WISDOM:           ", address(wisdom));

        // 4. BibleFiSuperfluid (tithe streaming router)
        BibleFiSuperfluid superfluidRouter = new BibleFiSuperfluid(
            ISuperfluid(SUPERFLUID_HOST),
            IConstantFlowAgreementV1(CFAv1)
        );
        console2.log("4. BibleFiSuperfluid: ", address(superfluidRouter));

        // 5. BWTYACore (four parable pools with 10% tithe enforcement)
        BWTYACore bwtya = new BWTYACore(
            ISuperToken(address(biblefi)),
            ISuperToken(address(wisdom)),
            oracle,
            address(superfluidRouter)
        );
        console2.log("5. BWTYACore:         ", address(bwtya));

        vm.stopBroadcast();

        console2.log("");
        console2.log("=== ALL CONTRACTS DEPLOYED ===");
        console2.log("WisdomOracle:      ", address(oracle));
        console2.log("$BIBLEFI:          ", address(biblefi));
        console2.log("$WISDOM:           ", address(wisdom));
        console2.log("BibleFiSuperfluid: ", address(superfluidRouter));
        console2.log("BWTYACore:         ", address(bwtya));
        console2.log("Treasury:          ", TREASURY);
        console2.log("");
        console2.log("=== NEXT STEPS ===");
        console2.log("1. Paste all 5 addresses into src/config/deployment.ts");
        console2.log("2. Paste BIBLEFI + WISDOM into public/.well-known/farcaster.json");
        console2.log("3. Re-sign accountAssociation.signature with treasury wallet");
        console2.log("4. Paste addresses into src/farcaster/config.ts");
        console2.log("5. Transfer ownership of oracle + bwtya to treasury multisig");
        console2.log("6. Seed LP on Aerodrome + Uniswap V3/V4");
        console2.log("7. Open first tithe stream from treasury to a vetted Church");
        console2.log("8. Verify all contracts on BaseScan");
    }
}
