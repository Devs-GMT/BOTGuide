---
title: "Deploy with Remix"
section: "Deploy"
source_url: ""
source: community-notes
last_synced: 2026-10-24
---
# Deploy with Remix

BOT Chain is EVM-compatible and the official docs list Remix as a tool that works out of the box. These steps are a community note based on the standard Remix flow. Always try testnet first.

### Steps {#steps}

1. Add BOT Chain Testnet to MetaMask (chain ID 968, RPC https://rpc.bohr.life) and get test tokens from the faucet.
2. Open https://remix.ethereum.org, write your contract and compile it.
3. Open **Deploy & Run Transactions**. Set **Environment** to *Injected Provider - MetaMask*.
4. Check that MetaMask shows BOT Chain Testnet. Remix shows the connected chain ID under the environment.
5. Press **Deploy** and confirm the transaction in MetaMask.
6. Open the transaction on the explorer (https://scan.bohr.life for testnet) to confirm it succeeded.

### Mainnet {#mainnet}

Repeat the same steps with MetaMask on BOT Chain mainnet (chain ID 677, explorer https://scan.botchain.ai). You need BOT for gas.
