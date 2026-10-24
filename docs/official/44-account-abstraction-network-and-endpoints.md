---
title: "Network & Endpoints"
section: "Account Abstraction"
source_url: https://dev-docs.botchain.ai/docs/Account-Abstraction/network-and-endpoints
source: official
last_synced: 2026-10-24
---
# Network & Endpoints

## Network information {#network-information}

| Parameter | Mainnet | Testnet |
| --- | --- | --- |
| Network name | BOT Chain Mainnet | BOT Chain Testnet |
| Chain ID | `677` (`0x2a5`) | `968` (`0x3c8`) |
| Chain RPC | `https://rpc.botchain.ai` | `https://rpc.bohr.life` |
| Bundler RPC | `https://bundler.botchain.ai/rpc/` | `https://bundler.bohr.life/rpc/` |

## Contract information {#contract-information}

| Contract | Mainnet | Testnet | Explorer | Purpose |
| --- | --- | --- | --- | --- |
| EntryPoint v0.7 | `0x0000000071727De22E5E9d8BAf0edAc6f37da032` | `0x0000000071727De22E5E9d8BAf0edAc6f37da032` | [Mainnet](https://scan.botchain.ai/address/0x0000000071727De22E5E9d8BAf0edAc6f37da032) / [Testnet](https://scan.bohr.life/address/0x0000000071727De22E5E9d8BAf0edAc6f37da032) | Validates, executes, and settles UserOperations |
| SimpleAccountFactory | `0xBC88d6012b3bf8426C2851d3798cEB5257658332` | `0xBC88d6012b3bf8426C2851d3798cEB5257658332` | [Mainnet](https://scan.botchain.ai/address/0xBC88d6012b3bf8426C2851d3798cEB5257658332) / [Testnet](https://scan.bohr.life/address/0xBC88d6012b3bf8426C2851d3798cEB5257658332) | Deterministically creates SimpleAccounts |
| SimpleAccount implementation | `0xDE15Ab00C52FF37eCe01C384eB42C802721db823` | `0xDE15Ab00C52FF37eCe01C384eB42C802721db823` | [Mainnet](https://scan.botchain.ai/address/0xDE15Ab00C52FF37eCe01C384eB42C802721db823) / [Testnet](https://scan.bohr.life/address/0xDE15Ab00C52FF37eCe01C384eB42C802721db823) | Shared proxy implementation for SimpleAccount |
| Multicall3 | `0x9ada8A64657bE15a85C435906AF3f34b83D261cB` | `0x8247F49Ea29fd9251466006812f5D0aF2050AC44` | [Mainnet](https://scan.botchain.ai/address/0x9ada8A64657bE15a85C435906AF3f34b83D261cB) / [Testnet](https://scan.bohr.life/address/0x8247F49Ea29fd9251466006812f5D0aF2050AC44) | Used by the Bundler and batch-read tools |

The `SimpleAccount implementation` is a shared implementation address, not a user's smart-account address. Each SimpleAccount instance address is determined by its Owner and salt.
