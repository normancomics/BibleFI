// BWSP Hardhat Configuration for Base Chain Deployment
// This file is for reference - use with standard Hardhat setup

const hardhatConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    "base": {
      url: "https://mainnet.base.org",
      chainId: 8453,
      accounts: ["PRIVATE_KEY_HERE"], // Replace with actual private key
      gasPrice: 1000000000
    },
    "base-sepolia": {
      url: "https://sepolia.base.org",
      chainId: 84532,
      accounts: ["PRIVATE_KEY_HERE"],
      gasPrice: 1000000000
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  etherscan: {
    apiKey: {
      "base": "BASESCAN_API_KEY",
      "base-sepolia": "BASESCAN_API_KEY"
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  }
};

// Base Chain Superfluid Addresses
export const SUPERFLUID_ADDRESSES = {
  base: {
    host: "0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74",
    cfaV1: "0x19ba78B9cDB05A877718841c574325fdB53601bb",
    tokens: {
      USDCx: "0xD04383398dD2426297da660F9CCA3d439AF9ce1b",
      ETHx: "0x46fd5cfB4c12D87acD3a13e92BAa53240C661D93",
      DAIx: "0xD04383398dD2426297da660F9CCA3d439AF9ce1b"
    }
  },
  baseSepolia: {
    host: "0x109412E3C84f0539b43d39dB691B08c90f58dC7c",
    cfaV1: "0x6836F23d6171D74Ef62FcF776655aBcD2bcd62Ef",
    tokens: {
      fDAIx: "0x9ce2062b085A2268E8d769fFC040f6692f27faF2",
      fUSDCx: "0x8aE68021f6170E5a766bE613cEA0d75236ECCa9a"
    }
  }
};

// Deployment Script
export const deployBWSP = async (
  sfHost: string,
  cfaV1: string,
  tithingReceiver: string
) => {
  console.log("Deploying BWSPCore to Base chain...");
  console.log("Superfluid Host:", sfHost);
  console.log("CFA V1:", cfaV1);
  console.log("Tithing Receiver:", tithingReceiver);
  
  // Deployment would happen here with Hardhat
  // const BWSPCore = await ethers.getContractFactory("BWSPCore");
  // const bwsp = await BWSPCore.deploy(sfHost, cfaV1, tithingReceiver);
  // await bwsp.deployed();
  
  return {
    bwspCoreAddress: "0x...", // Deployed address
    zkVerifierAddress: "0x..." // Deployed address
  };
};

// Verification Script
export const verifyBWSP = async (
  contractAddress: string,
  constructorArgs: any[]
) => {
  console.log("Verifying contract on Basescan...");
  // npx hardhat verify --network base contractAddress ...constructorArgs
};

export default hardhatConfig;
