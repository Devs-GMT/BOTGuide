---
title: "Common errors and fixes"
section: "Troubleshooting"
source_url: ""
source: community-notes
last_synced: 2026-10-24
---
# Common errors and fixes

This is a community note. Items marked as general EVM knowledge are not specific to BOT Chain.

### Wrong network {#wrong-network}

Symptoms: the transaction asks for a different currency, the contract address looks wrong, or the explorer shows nothing. Fix: check that the wallet is on chain ID 677 (mainnet) or 968 (testnet) before you sign.

### Not enough BOT for gas {#out-of-gas}

BOT is the native token and pays gas. On testnet claim test tokens from the faucet: each address can claim up to 10 tBOT every 24 hours, according to the official docs. On mainnet BOT is available through the official DEX.

### Nonce problems {#nonce}

General EVM knowledge. A stuck pending transaction blocks the ones after it. In MetaMask you can clear the activity tab data under advanced settings, or send a replacement transaction with the same nonce and a higher fee.

### Reverted transaction {#reverted}

General EVM knowledge. Open the transaction on the explorer and read the revert reason. In Hardhat or Foundry, run the call locally first to see the error message.

### eth_getLogs returns an error on mainnet {#getlogs}

The official docs say `eth_getLogs` is disabled on the public mainnet endpoints. Use a third-party endpoint, or use WebSockets so new logs are pushed to you.
