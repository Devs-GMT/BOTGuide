---
title: "RWA Development Manual"
section: "Overview"
source_url: https://dev-docs.botchain.ai/docs/RWA/project-rwa-developer-docs
source: official
last_synced: 2026-10-24
---
# RWA Development Manual

> This project is a real-world asset (RWA) issuance and transfer system based on the **ERC-3643 (T-REX)** standard. In one sentence: **it turns a real-world asset into on-chain tokens and allows only eligible investors to hold and transfer them.**

This documentation is for developers who are new to the project. After reading the six chapters in order, you should be able to explain which contracts make up the system, how an asset is issued, how an investor becomes eligible to hold it, which methods mint and burn tokens, and how to query the results on-chain.

* * *

## 1\. At a glance {#1-at-a-glance}

| Question | Answer |
| --- | --- |
| What is this? | A qualification-gated token issuance system based on ERC-3643 |
| How does it differ from a regular token? | A regular ERC-20 can be transferred whenever a balance is available; this system also requires an eligible recipient and a compliant transaction |
| Token compatibility | Fully ERC-20 compatible; wallets and exchanges can read balances and monitor `Transfer` events as usual |
| How many contracts represent one asset? | Six core contracts form a Suite and are deployed together by a factory |
| Who determines whether a person is eligible? | `IdentityRegistry` |
| Who determines whether a transaction is compliant? | `ModularCompliance` |
| Where is eligibility evidence stored? | In Claims on the investor's own `ONCHAINID` contract |
| Are identity-document images stored on-chain? | No. The chain stores only the conclusion that a given qualification has been approved |
| Environments | Bohr Testnet (Chain ID `968`) and BOT Mainnet capability demo (Chain ID `677`), each with an independent `PRWA` Suite |

The key statement used throughout this documentation is:

> **Token maintains the ledger, IdentityRegistry determines whether a person is eligible, and ModularCompliance determines whether a transaction is compliant.**

* * *

## 2\. Main system flow {#2-main-system-flow}

The path from asset launch to investor ownership has four steps:

Key action and verifiable result for each step:

| Step | Main call | Verifiable result |
| --- | --- | --- |
| Issue the asset | `TREXGateway.deployTREXSuite` | Obtain the Token address and the five supporting contract addresses |
| Onboard an investor | `ONCHAINIDGateway.deployIdentityForWallet` → `Identity.addClaim` → `IdentityRegistry.registerIdentity` | `IdentityRegistry.isVerified(wallet)` returns `true` |
| Mint or burn | `Token.mint` / `Token.burn` | A `Transfer` event is emitted and `balanceOf` changes |
| Transfer | `Token.transfer` | The transfer succeeds when every check passes; a failed check reverts the whole transaction |

* * *

## 3\. Documentation map {#3-documentation-map}

| Chapter | Content | When to read it |
| --- | --- | --- |
| [01 · Project and integration overview](https://dev-docs.botchain.ai/docs/RWA/quick-understanding/) | Project scope, ERC-3643 differences, integration levels, and public environments | Read first to establish the overall model |
| [02 · Core concepts](https://dev-docs.botchain.ai/docs/RWA/core-concepts/) | What ONCHAINID, Claim, Topic, trusted issuer, identity registry, and compliance rules mean | Use when a term is unclear |
| [03 · System architecture and roles](https://dev-docs.botchain.ai/docs/RWA/system-architecture/) | System layers, contract responsibilities, participant roles, and stable proxy addresses | Read to understand how the system is organized |
| [04 · Complete business processes](https://dev-docs.botchain.ai/docs/RWA/core-processes/) | Complete flows and checks for issuance, onboarding, minting, burning, and transfers | Read before operating the system |
| [05 · Contract interfaces and events](https://dev-docs.botchain.ai/docs/RWA/core-methods-and-events/) | Contract methods, events, call examples, and minimum ABIs | Use as a development reference |
| [06 · Environment configuration and acceptance](https://dev-docs.botchain.ai/docs/RWA/testnet-practice/) | Testnet and BOT Mainnet configurations, public samples, and acceptance checks | Use when integrating or validating the system |

Recommended reading order:

For the shortest path, read this page, then 04 · Complete business processes, then 06 · Environment configuration and acceptance.

* * *

## 4\. Environment quick reference {#4-environment-quick-reference}

### Test environment {#test-environment}

| Item | Value |
| --- | --- |
| Network | Bohr Testnet |
| Chain ID | `968` |
| RPC | `https://rpc.bohr.life` |
| Block explorer | `https://scan.bohr.life` |
| Asset name | `Project Real World Asset` |
| Asset symbol | `PRWA` |
| Decimals | `6` |
| Token address | `0x922835859623d6F3b99a2742D585E093bBA0a740` |
| IdentityRegistry address | `0x17e33C394Ab783D6786011d01681D8Ad540C5F53` |
| ONCHAINID Gateway | `0x3B0FE2CD501534cbcbD1F97ec823Da535fc0224f` |

### BOT Mainnet capability demo {#bot-mainnet-capability-demo}

| Item | Value |
| --- | --- |
| Network | BOT Chain Mainnet |
| Chain ID | `677` |
| RPC | `https://rpc.botchain.ai` |
| Block explorer | `https://scan.botchain.ai` |
| Token address | `0x9115A020821fDFdf265Eea8788a500d17557c370` |
| IdentityRegistry address | `0x7752dd107CDec2dF5feD585BCC70457c5312021a` |
| ONCHAINID Gateway | `0xa6B4E53128915E0f980DD455De9F70B6Dc61E1ee` |

See [06 · Environment configuration and acceptance](https://dev-docs.botchain.ai/docs/RWA/testnet-practice/) and the [RWA Address Table](https://dev-docs.botchain.ai/docs/RWA/deployment-addresses/) for the complete configuration.

* * *

## 5\. References {#5-references}

-   Official ERC-3643 website: [https://www.erc3643.org/](https://www.erc3643.org/)
-   Tokeny on-chain finance documentation: [https://docs.tokeny.com/docs/what-is-onchain-finance](https://docs.tokeny.com/docs/what-is-onchain-finance)
-   ONCHAINID identity standard, based on ERC-734 and ERC-735: [https://www.onchainid.com/](https://www.onchainid.com/)
