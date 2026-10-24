---
title: "Add BOT Chain to MetaMask"
section: "Wallet setup"
source_url: ""
source: community-notes
last_synced: 2026-10-24
---
# Add BOT Chain to MetaMask

Network values come from the official developer docs. The steps are a community note.

### One click {#one-click}

Open ChainList for chain 677 (https://chainlist.org/chain/677), connect your wallet and approve the network. The official docs also describe this route.

### By hand {#by-hand}

In MetaMask open the network menu, choose **Add a custom network**, and fill in:

1. Network name: BOT Chain
2. RPC URL: https://rpc.botchain.ai
3. Chain ID: 677
4. Currency symbol: BOT
5. Block explorer: https://scan.botchain.ai

For testnet use RPC https://rpc.bohr.life, chain ID 968, currency symbol BOT and explorer https://scan.bohr.life.

### Check it worked {#check}

After switching, the network name in MetaMask should read BOT Chain and the chain ID should be 677 (mainnet) or 968 (testnet). If a transaction asks for gas in another currency, you are on the wrong network.
