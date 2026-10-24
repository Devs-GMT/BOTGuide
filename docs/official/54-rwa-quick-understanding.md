---
title: "01 · Project and Integration Overview"
section: "RWA"
source_url: https://dev-docs.botchain.ai/docs/RWA/quick-understanding
source: official
last_synced: 2026-10-24
---
# 01 · Project and Integration Overview

This manual is for developers who want to query, integrate, or issue RWA assets on BOT Chain. If this is your first encounter with RWA or ERC-3643, start here and read the chapters in order.

## 1.1 Understand Project RWA in one minute {#11-understand-project-rwa-in-one-minute}

Project RWA is regulated asset issuance and transfer infrastructure based on ERC-3643.

It retains ERC-20 balances, allowances, and transfers while adding two on-chain checks:

1.  whether the receiving wallet satisfies the investor eligibility requirements of the asset;
2.  whether a mint or transfer complies with the transaction rules configured for the asset.

Project RWA manages on-chain units, identities, qualifications, and transaction rules. The asset issuer and relevant professional institutions remain responsible for the authenticity of the underlying asset, legal documents, custody, valuation, and redemption.

## 1.2 ERC-3643 compared with a regular ERC-20 {#12-erc-3643-compared-with-a-regular-erc-20}

ERC-3643 is an identity-verified, compliance-checked ERC-20 issuance framework. It does not define yield or valuation.

| Capability | Regular ERC-20 | ERC-3643 |
| --- | --- | --- |
| Recipient | Usually any address | The recipient must pass the asset eligibility check |
| Transfer rules | Primarily balance and allowance checks | May also enforce country, limit, lockup, and other rules |
| Administrative actions | Usually mint and burn only | Supports pause, freeze, forced transfer, and wallet recovery |
| Identity | Not included | Expressed through ONCHAINID and Claims |
| Rule changes | Usually modify or replace the Token | Eligibility settings and compliance modules can be adjusted |

Applications can read the Token like an ERC-20, but a sufficient balance does not guarantee that a transfer can execute.

## 1.3 How an asset operates {#13-how-an-asset-operates}

Remember these five objects first:

-   `Token`: represents asset units;
-   `ONCHAINID`: represents the investor's on-chain identity;
-   `Claim`: represents an institution-signed eligibility conclusion;
-   `IdentityRegistry`: determines whether a wallet may hold a particular asset;
-   `ModularCompliance`: determines whether a transaction complies with the rules.

Chapter 02 explains each object.

## 1.4 What Project RWA provides {#14-what-project-rwa-provides}

### Available to every developer {#available-to-every-developer}

-   Query the asset name, symbol, total supply, and wallet balance;
-   Query whether a wallet is eligible to hold an asset;
-   Query the Claim Topics required by an asset and its recognized ClaimIssuers;
-   Read pause, freeze, and compliance configuration;
-   Monitor mint, burn, transfer, and identity-registration events;
-   Allow an eligible Token holder to initiate a transfer.

### Available to investors {#available-to-investors}

-   Create an ONCHAINID with their own wallet;
-   Write a Claim signed by a qualification institution to their ONCHAINID;
-   Query their identity, qualifications, and asset status;
-   Initiate holder operations such as `transfer` and `approve`.

### Available to authorized issuers {#available-to-authorized-issuers}

-   Issue a new ERC-3643 asset Suite;
-   Register or update investor identities;
-   Mint, burn, pause, freeze, and perform forced transfers;
-   Configure the asset's eligibility requirements and transaction rules.

Permissioned operations must be performed by the relevant Owner or Agent. A public application may construct transactions, but it must not hold the private keys for these roles.

## 1.5 What Project RWA does not provide {#15-what-project-rwa-does-not-provide}

On-chain contracts cannot independently prove that a real-world asset exists, and they do not replace:

-   legal title and issuance documents;
-   asset custody, audit, and valuation;
-   review of original KYC/AML materials;
-   fiat settlement and real-world asset redemption;
-   regulatory obligations in the issuer's jurisdiction.

A successful on-chain `mint` only confirms that units were issued. A successful on-chain `burn` only confirms that units were destroyed. Real-world delivery or fund settlement requires separate confirmation.

## 1.6 Three integration levels {#16-three-integration-levels}

### Level 1: Read-only data {#level-1-read-only-data}

Suitable for wallets, block explorers, asset dashboards, and reporting systems.

Minimum requirements:

```text
Chain ID
RPC
Token address
IdentityRegistry address
```

Completion criteria:

-   Read `name`, `symbol`, `decimals`, and `totalSupply`;
-   Query wallet balances;
-   Query `isVerified(wallet)`;
-   Correctly parse `Transfer` events.

### Level 2: Investor integration {#level-2-investor-integration}

Suitable for investor portals, subscription applications, and trading applications. In addition to read-only access, the application must coordinate:

```text
Create ONCHAINID
→ Off-chain eligibility review
→ Submit a signed Claim
→ Wait for issuer registration
→ Query final eligibility
→ Initiate a compliant transfer
```

The investor, qualification institution, and asset issuer complete these steps together. No single interface completes the entire process independently.

### Level 3: Asset issuance and management {#level-3-asset-issuance-and-management}

Suitable for projects that want to issue assets on Project RWA. Before issuance, determine:

-   asset name, symbol, decimals, and the represented real-world right;
-   the Claim Topics investors must satisfy;
-   the recognized ClaimIssuers;
-   country, limit, or lockup rules;
-   Owner, Token Agent, and IR Agent addresses;
-   test, mainnet, and launch acceptance plans.

After platform admission, the issuer receives an independent Token and supporting contracts.

## 1.7 Minimum integration boundary {#17-minimum-integration-boundary}

An asset-display application does not need to connect to Factory, Gateway governance, or upgrade contracts. Always use the minimum addresses and ABIs required for the target function.

## 1.8 Public environments {#18-public-environments}

| Environment | Chain ID | RPC | Purpose |
| --- | --- | --- | --- |
| Bohr Testnet | `968` | `https://rpc.bohr.life` | Development and integration |
| BOT Mainnet | `677` | `https://rpc.botchain.ai` | Mainnet capability demonstration |

Addresses, balances, identities, and Claims are completely independent across the two environments.

The public `PRWA` on BOT Mainnet is a technical capability-demo asset. Its Country Allowlist module has not completed a production audit, does not represent real-world asset rights, and must not directly carry real assets.

## 1.9 Reading order {#19-reading-order}

| Chapter | Question answered |
| --- | --- |
| 01 · Project and Integration Overview | What the project is and how deeply it can be integrated |
| 02 · Core Concepts | What Token, identity, Claim, eligibility, and rules mean |
| 03 · System Architecture and Roles | How contracts are layered, what is shared, and who is responsible |
| 04 · Complete Business Processes | How issuance, onboarding, minting, transfers, and burning occur |
| 05 · Contract Interfaces and Events | Which methods to call and events to monitor |
| 06 · Environment Configuration and Acceptance | Public addresses, runnable examples, and acceptance checklists |

## 1.10 Before development {#110-before-development}

1.  Confirm the target environment and Chain ID;
2.  Obtain the target asset proxy address from Chapter 06;
3.  Use ethers.js, web3.js, or another EVM client;
4.  Identify read-only operations and operations requiring a wallet signature;
5.  Read Token `decimals` dynamically;
6.  Keep plaintext KYC materials off-chain;
7.  Keep private keys out of the frontend, repository, and logs;
8.  Wait for the transaction receipt before updating final business state.

[Continue: 02 · Core Concepts](https://dev-docs.botchain.ai/docs/RWA/core-concepts/)
