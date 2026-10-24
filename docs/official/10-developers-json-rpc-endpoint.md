---
title: "JSON-RPC-Endpoint"
section: "Developers"
source_url: https://dev-docs.botchain.ai/docs/Developers/json-rpc-endpoint
source: official
last_synced: 2026-10-24
---
# JSON-RPC-Endpoint

JSON-RPC endpoints refers to the network location where a program could transfer its RPC requests to access server data. Once you connect a decentralized application to an RPC endpoint, you can access the functionalities of different operations, which could enable real-time usage of blockchain data. BOT Chain provides several RPC endpoints for connecting into both its Mainnet and Testnet. In this section, we list the JSON-RPC endpoints that can be used for connecting to BOT Chain.

### One-click adding BOT network {#one-click-adding-bot-network}

Visit the [ChainList](https://chainlist.org/chain/677) and connect to your wallet. It will add alive RPC endpoints.

### RPC Endpoints for BOT Chain {#rpc-endpoints-for-bot-chain}

`eth_getLogs` is disabled on below Mainnet endpoints. Please use 3(rd) party endpoints from **here**. If you need to pull logs frequently, we recommend using WebSockets to push new logs to you when they are available.

#### BOT Mainnet (ChainID 677) {#bot-mainnet-chainid-677}

-   [https://rpc.botchain.ai](https://rpc.botchain.ai)

#### BOT Chain Testnet (ChainID 968) {#bot-chain-testnet-chainid-968}

-   [https://rpc.bohr.life](https://rpc.bohr.life)

#### Starting HTTP JSON-RPC {#starting-http-json-rpc}

You can start the HTTP JSON-RPC with the –http flag

```plain
## mainnet
https://rpc.botchain.ai

## testnet
https://rpc.bohr.life
```

### JSON-RPC API List {#json-rpc-api-list}

BOT Chain is EVM-compatible and strives to be as compatible as possible with the Go-Ethereum API. However, BOT Chain also has unique features, such as faster finality and the storage of blob data on the execution layer, which require their own specialized APIs.

#### Geth(Go-Ethereum) API {#gethgo-ethereum-api}

BOT Chain is nearly fully compatible with the Geth APIs. Any exceptions or incompatibilities are explicitly listed. If you're looking for detailed usage of a specific API, you will most likely find the answer in the following link:

[Geth JSON-RPC API documentation](https://geth.ethereum.org/docs/interacting-with-geth/rpc).

#### Finality {#finality}

Ethereum's PoS consensus protocol, known as "Gasper," is built on LMD-GHOST (a fork choice rule) and Casper FFG (a finality gadget). Similarly, BOT Chain's consensus protocol, called "Parlia," is constructed on top of a difficulty-based fork choice mechanism with FFG, as described in [BEP-126](https://github.com/bnb-chain/BEPs/blob/master/BEPs/BEP126.md). To further enhance BOT Chain's throughput, validators are allowed to produce multiple consecutive blocks, as explained in [BEP-341](https://github.com/bnb-chain/BEPs/blob/master/BEPs/BEP-341.md). These differences result in BOT Chain having a unique finality process compared to Ethereum.

#### Blob {#blob}

BOT Chain implements EIP-4844, which supports Shard Blob Transactions. For more details, please refer to the [Blob API](https://dev-docs.botchain.ai/docs/Developers/blob-api) documentation.

#### Other BOT Chain API {#other-bot-chain-api}

BOT Chain implements some other APIs
