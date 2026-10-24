require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// The deployer key lives in contracts/.env (never committed): PRIVATE_KEY=0x...
const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      // "paris" avoids the PUSH0 opcode, so the bytecode runs on EVM chains that have not enabled Shanghai.
      evmVersion: "paris",
    },
  },
  networks: {
    botTestnet: { url: "https://rpc.bohr.life", chainId: 968, accounts },
    botMainnet: { url: "https://rpc.botchain.ai", chainId: 677, accounts },
  },
};
