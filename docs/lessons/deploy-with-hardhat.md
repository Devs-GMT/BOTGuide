---
title: "Deploy with Hardhat"
section: "Deploy"
source_url: ""
source: community-notes
last_synced: 2026-10-24
---
# Deploy with Hardhat

Hardhat works with BOT Chain through its JSON-RPC endpoints. This is a community note; the network values come from the official docs. The config and the deploy command below were tested on BOT Chain Testnet with Hardhat 2 and Solidity 0.8.20.

### Config {#config}

```js
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    botTestnet: {
      url: "https://rpc.bohr.life",
      chainId: 968,
      accounts: [process.env.PRIVATE_KEY],
    },
    botMainnet: {
      url: "https://rpc.botchain.ai",
      chainId: 677,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
```

Keep `PRIVATE_KEY` in a `.env` file and never commit it.

### Deploy {#deploy}

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network botTestnet
```

A deploy script is the usual `ethers` pattern: get the contract factory, call `deploy()`, then `await contract.waitForDeployment()`.

Deploy to testnet first, then repeat with `--network botMainnet`.
