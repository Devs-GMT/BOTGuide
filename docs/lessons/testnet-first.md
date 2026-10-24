---
title: "Testnet first, then mainnet"
section: "Workflow"
source_url: ""
source: community-notes
last_synced: 2026-10-24
---
# Testnet first, then mainnet

A community note on the safest order of work.

1. Add BOT Chain Testnet (chain ID 968, RPC https://rpc.bohr.life, explorer https://scan.bohr.life).
2. Get test tokens from the faucet.
3. Deploy and test your contract on testnet.
4. Switch to mainnet (chain ID 677, RPC https://rpc.botchain.ai, explorer https://scan.botchain.ai) only when everything works.
5. Before every signature, look at the network name and chain ID in your wallet.

Keep separate Hardhat network names (for example `botTestnet` and `botMainnet`) so a command cannot hit the wrong chain by accident. Testnet tokens have no real-world value.
