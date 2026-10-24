---
title: "Deploy with Foundry"
section: "Deploy"
source_url: ""
source: community-notes
last_synced: 2026-10-24
---
# Deploy with Foundry

Foundry only needs the RPC URL of the network. This is a community note; the network values come from the official docs.

### Deploy a contract {#forge-create}

```bash
forge create src/Counter.sol:Counter \
  --rpc-url https://rpc.bohr.life \
  --private-key $PRIVATE_KEY
```

That deploys to BOT Chain Testnet (chain ID 968). For mainnet (chain ID 677) use `--rpc-url https://rpc.botchain.ai`.

### Read chain data {#cast}

```bash
cast block-number --rpc-url https://rpc.botchain.ai
cast chain-id --rpc-url https://rpc.botchain.ai
```

`cast chain-id` should print 677 on mainnet and 968 on testnet. Do not leave a real private key in your shell history.
