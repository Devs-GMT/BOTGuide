---
title: "Contract Addresses"
section: "DEX"
source_url: https://dev-docs.botchain.ai/docs/DEX/contract-addresses
source: official
last_synced: 2026-10-24
---
# Contract Addresses

All BDEX smart contracts are deployed on BOT Chain Mainnet (Chain ID: 677) and Testnet (Chain ID: 968).

## Mainnet {#mainnet}

### Shared Infrastructure — Mainnet {#shared-infrastructure--mainnet}

| Contract | Address | Description |
| --- | --- | --- |
| WBOT | [0xD5452816194a3784dBa983426cCe7c122F4abd30](https://scan.botchain.ai/address/0xD5452816194a3784dBa983426cCe7c122F4abd30) | Wrapped BOT (ERC-20 representation of native BOT) |
| Multicall3 | [0x47FA21f684bBAD707A53a0f9BE59F1422F46C265](https://scan.botchain.ai/address/0x47FA21f684bBAD707A53a0f9BE59F1422F46C265) | Batch contract calls |
| Permit2 | [0x8366170f09a04f715a13549D616a06aED16Db7c3](https://scan.botchain.ai/address/0x8366170f09a04f715a13549D616a06aED16Db7c3) | Signature-based token approvals |
| Universal Router | [0xaE6ae8630f7A888dEc0B9195C85F7515d5887655](https://scan.botchain.ai/address/0xaE6ae8630f7A888dEc0B9195C85F7515d5887655) | Unified swap entry for V2 & V3 |

### BDEX V2 — Mainnet {#bdex-v2--mainnet}

| Contract | Address | Description |
| --- | --- | --- |
| V2 Factory | [0x117115f3B72C8d1989178089A67D0C26f8EE0AA3](https://scan.botchain.ai/address/0x117115f3B72C8d1989178089A67D0C26f8EE0AA3) | Creates and manages all V2 trading pairs |
| V2 Router02 | [0x1414eD29FdFD322c3c0a830330ed982E2D629e76](https://scan.botchain.ai/address/0x1414eD29FdFD322c3c0a830330ed982E2D629e76) | Routes swaps and manages liquidity operations |
| pairInitCodeHash | `0xa075aa7c03cb5559a4c6202459721232c21e18148152410f6beec063e8499e6c` | CREATE2 init code hash for V2 pairs |

### BDEX V3 — Mainnet {#bdex-v3--mainnet}

| Contract | Address | Description |
| --- | --- | --- |
| V3 Factory | [0x1C51c173323ec11BB4e3C4fD2314c225Dc4b5419](https://scan.botchain.ai/address/0x1C51c173323ec11BB4e3C4fD2314c225Dc4b5419) | Creates and manages all V3 pools |
| SwapRouter | [0x07032d47A1b9f8460cBeE9dC17c1d3E438693929](https://scan.botchain.ai/address/0x07032d47A1b9f8460cBeE9dC17c1d3E438693929) | Executes V3 swaps (single & multi-hop) |
| QuoterV2 | [0x034A705b36067cff99ABf5C662Be881cBd8d0176](https://scan.botchain.ai/address/0x034A705b36067cff99ABf5C662Be881cBd8d0176) | Off-chain quote simulation |
| NonfungiblePositionManager | [0xDAc3FcFF004d8a8675b94E44941A1a2e3b240090](https://scan.botchain.ai/address/0xDAc3FcFF004d8a8675b94E44941A1a2e3b240090) | Manages LP positions as ERC-721 NFTs |

### Common Tokens (Mainnet) {#common-tokens-mainnet}

| Token | Symbol | Decimals | Address |
| --- | --- | --- | --- |
| Wrapped BOT | WBOT | 18 | [0xD5452816194a3784dBa983426cCe7c122F4abd30](https://scan.botchain.ai/address/0xD5452816194a3784dBa983426cCe7c122F4abd30) |
| Tether USD | USDT | 6 | [0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C](https://scan.botchain.ai/address/0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C) |

## Testnet {#testnet}

### Shared Infrastructure — Testnet {#shared-infrastructure--testnet}

| Contract | Address | Description |
| --- | --- | --- |
| WBOT | [0xD5452816194a3784dBa983426cCe7c122F4abd30](https://scan.bohr.life/address/0xD5452816194a3784dBa983426cCe7c122F4abd30) | Wrapped BOT (ERC-20 representation of native BOT) |
| Multicall3 | [0x47FA21f684bBAD707A53a0f9BE59F1422F46C265](https://scan.bohr.life/address/0x47FA21f684bBAD707A53a0f9BE59F1422F46C265) | Batch contract calls |
| Permit2 | [0xaE85b2bc7578F8Ca9217900a2D548151F96447de](https://scan.bohr.life/address/0xaE85b2bc7578F8Ca9217900a2D548151F96447de) | Signature-based token approvals |
| Universal Router | [0x73Be0A1d8011B335A7aBeF6c45544E8ca4448AB5](https://scan.bohr.life/address/0x73Be0A1d8011B335A7aBeF6c45544E8ca4448AB5) | Unified swap entry for V2 & V3 |

### BDEX V2 — Testnet {#bdex-v2--testnet}

| Contract | Address | Description |
| --- | --- | --- |
| V2 Factory | [0x65b8e98ceA190d8c28B3e4716402027f634d15a3](https://scan.bohr.life/address/0x65b8e98ceA190d8c28B3e4716402027f634d15a3) | Creates and manages all V2 trading pairs |
| V2 Router02 | [0xD6425a02f0845B8D99e349C34D2E7A576E177345](https://scan.bohr.life/address/0xD6425a02f0845B8D99e349C34D2E7A576E177345) | Routes swaps and manages liquidity operations |
| pairInitCodeHash | `0x9d2cc5d1f5560e2a4119c794e0fa625b8c50af562e72436c234ec1addb77de47` | CREATE2 init code hash for V2 pairs |

### BDEX V3 — Testnet {#bdex-v3--testnet}

| Contract | Address | Description |
| --- | --- | --- |
| V3 Factory | [0x1C51c173323ec11BB4e3C4fD2314c225Dc4b5419](https://scan.bohr.life/address/0x1C51c173323ec11BB4e3C4fD2314c225Dc4b5419) | Creates and manages all V3 pools |
| SwapRouter | [0x07032d47A1b9f8460cBeE9dC17c1d3E438693929](https://scan.bohr.life/address/0x07032d47A1b9f8460cBeE9dC17c1d3E438693929) | Executes V3 swaps (single & multi-hop) |
| QuoterV2 | [0x034A705b36067cff99ABf5C662Be881cBd8d0176](https://scan.bohr.life/address/0x034A705b36067cff99ABf5C662Be881cBd8d0176) | Off-chain quote simulation |
| NonfungiblePositionManager | [0xDAc3FcFF004d8a8675b94E44941A1a2e3b240090](https://scan.bohr.life/address/0xDAc3FcFF004d8a8675b94E44941A1a2e3b240090) | Manages LP positions as ERC-721 NFTs |

### Common Tokens (Testnet) {#common-tokens-testnet}

| Token | Symbol | Decimals | Address |
| --- | --- | --- | --- |
| Wrapped BOT | WBOT | 18 | [0xD5452816194a3784dBa983426cCe7c122F4abd30](https://scan.bohr.life/address/0xD5452816194a3784dBa983426cCe7c122F4abd30) |
| Tether USD | USDT | 6 | [0x75edC9335175Fc0552D51D48439F229c10420fe3](https://scan.bohr.life/address/0x75edC9335175Fc0552D51D48439F229c10420fe3) |
