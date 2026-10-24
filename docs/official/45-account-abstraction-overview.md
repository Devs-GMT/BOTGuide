---
title: "Overview"
section: "Account Abstraction"
source_url: https://dev-docs.botchain.ai/docs/Account-Abstraction/overview
source: official
last_synced: 2026-10-24
---
# Overview

BOT Chain provides two complementary account abstraction capabilities: ERC-4337 uses smart accounts and a Bundler to provide the UserOperation path, while EIP-7702 allows an existing EOA to delegate its account implementation while retaining its original address. ERC-4337 is currently the primary path for production integrations.

## Network and support status {#network-and-support-status}

| Network | Chain ID | ERC-4337 version and status | EIP-7702 version and status |
| --- | --- | --- | --- |
| BOT Chain Mainnet | `677` | EntryPoint / UserOperation v0.7; **Supported** | Type 4; **Partial**, only node recognition has been confirmed |
| BOT Chain Testnet | `968` | EntryPoint / UserOperation v0.7; **Supported** | Type 4; **Partial**, only node recognition has been confirmed |

## ERC-4337 compared with EIP-7702 {#erc-4337-compared-with-eip-7702}

| Comparison | ERC-4337 | EIP-7702 |
| --- | --- | --- |
| Problem addressed | Provides a path for submitting, validating, and settling smart-account operations and Gas | Gives existing EOAs delegatable smart-account capabilities |
| Account identity | Typically uses a separate smart-account address | Retains the original EOA address |
| Integration entry point | A UserOperation is submitted to EntryPoint through a Bundler | A type 4 transaction is submitted through the chain RPC |
| Current BOT Chain position | Recommended production integration path | Preview capability; not currently recommended for production |

## How they work together {#how-they-work-together}

The two approaches are not alternatives. EIP-7702 determines how an existing EOA obtains account code, while ERC-4337 determines how account operations are submitted, validated, and settled. When combined, a delegated EOA can act as the `sender` of a UserOperation and be submitted to EntryPoint by a Bundler that supports EIP-7702.

BOT Chain Mainnet and Testnet currently only confirm that nodes recognize type 4 transactions. EIP-7702 remains disabled on the public Bundler. Therefore, support for type 4 transactions does not imply support for EIP-7702 UserOperations, and the combined path is not currently available for public production integrations.
