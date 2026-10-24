---
title: "Blob API"
section: "Developers"
source_url: https://dev-docs.botchain.ai/docs/Developers/blob-api
source: official
last_synced: 2026-10-24
---
# Blob API

## eth\_getBlobSidecarByTxHash {#eth\_getblobsidecarbytxhash}

### Parameters {#parameters}

**Hash** String (REQUIRED)

-   HEX String - the hash of the transaction

**full\_blob\_flag** Boolean (OPTIONAL)

-   Default is true. If true it returns the full blob info, if false only return first 32 bytes of blobs.

```bash
curl -X POST "http://localhost:8545/" -H "Content-Type: application/json"  --data '{"jsonrpc":"2.0","method":"eth_getBlobSidecarByTxHash","params":["0x377d3615d2e76f4dcc0c9a1674d2f5487cba7644192e7a4a5af9fe5f08b60a63"],"id":1}'
curl -X POST "http://localhost:8545/" -H "Content-Type: application/json"  --data '{"jsonrpc":"2.0","method":"eth_getBlobSidecarByTxHash","params":["0x377d3615d2e76f4dcc0c9a1674d2f5487cba7644192e7a4a5af9fe5f08b60a63", false],"id":1}'
```

## eth\_getBlobSidecars {#eth\_getblobsidecars}

### Parameters {#parameters-1}

**BlockNumber** QUANTITY|TAG

-   HEX String - an integer block number
-   HEX String - the hash of the block
-   String "earliest" for the earliest/genesis block
-   String "latest" - for the latest mined block
-   String "safe" - for the latest justified head block
-   String "finalized" - for the latest finalized block

**full\_blob\_flag** Boolean (OPTIONAL)

-   Default is true. If true it returns the full blob info, if false only return first 32 bytes of blobs.

```bash
curl -X POST "http://localhost:8545/" -H "Content-Type: application/json"  --data '{"jsonrpc":"2.0","method":"eth_getBlobSidecars","params":["latest"],"id":1}'
curl -X POST "http://localhost:8545/" -H "Content-Type: application/json"  --data '{"jsonrpc":"2.0","method":"eth_getBlobSidecars","params":["0xc5043f", false],"id":1}'
```
