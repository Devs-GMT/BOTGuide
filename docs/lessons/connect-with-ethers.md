---
title: "Connect with ethers.js"
section: "Developers"
source_url: ""
source: community-notes
last_synced: 2026-10-24
---
# Connect with ethers.js

The official docs say all Ethereum SDKs, including ethers.js and web3.js, work with BOT Chain. This is a community note with ethers v6 patterns.

### Read-only provider {#provider}

```js
import { JsonRpcProvider } from "ethers";

const provider = new JsonRpcProvider("https://rpc.botchain.ai", 677);
console.log(await provider.getBlockNumber());
```

Passing the chain ID (677 for mainnet, 968 for testnet) stops ethers from probing the network.

### Sign with a wallet {#wallet}

```js
import { JsonRpcProvider, Wallet } from "ethers";

const provider = new JsonRpcProvider("https://rpc.bohr.life", 968);
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
```

### Browser wallet {#browser}

```js
import { BrowserProvider } from "ethers";

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
```

Keep private keys and API keys on a server or in environment variables, never in front-end code.
