---
title: "04 · Complete Business Processes"
section: "RWA"
source_url: https://dev-docs.botchain.ai/docs/RWA/core-processes
source: official
last_synced: 2026-10-24
---
# 04 · Complete Business Processes

The previous chapters introduced the core objects, system structure, and participant roles. This chapter connects them into the complete lifecycle of an RWA asset, from issuance through exit.

## 4.1 Lifecycle overview {#41-lifecycle-overview}

| Process | Primary responsible party | On-chain result |
| --- | --- | --- |
| Asset issuance | Platform + asset issuer | New asset Suite |
| Investor onboarding | Investor + qualification institution + issuer | `isVerified == true` |
| Mint | Token Agent | Investor balance increases |
| Transfer | Token holder | Balance moves between eligible wallets |
| Burn | Token Agent | Investor balance and total supply decrease |

## 4.2 Step 1: Issue the asset {#42-step-1-issue-the-asset}

The issuer first defines the asset, qualifications, rules, and roles, then creates the Suite through the platform admission entry point.

Define these items before issuance:

| Category | Content |
| --- | --- |
| Asset | Name, symbol, `decimals`, real-world rights |
| Eligibility | Claim Topics investors must hold |
| Issuers | ClaimIssuers authorized for those Topics |
| Rules | Country, holding, supply, lockup, and other limits |
| Roles | Owner, Token Agent, IR Agent |
| Environment | Testnet or BOT Mainnet |

Publish after issuance:

-   Token and Suite proxy addresses;
-   Chain ID, RPC, and explorer;
-   eligibility requirements and transaction rules;
-   contract version and source-verification status;
-   whether the Token is paused;
-   asset effective time.

A new Token is paused by default. Minting and burning are available while paused, while ordinary investor transfers fail. Complete launch checks before the Token Agent calls `unpause()`.

## 4.3 Step 2: Onboard the investor {#43-step-2-onboard-the-investor}

Investor onboarding is a three-party process rather than a single call:

### Who performs each step {#who-performs-each-step}

| Step | Initiator | On-chain | Gas payer | Completion signal |
| --- | --- | --- | --- | --- |
| Submit and review materials | Investor, qualification institution | No | None | Review conclusion |
| Create ONCHAINID | Investor | Yes | Investor | Wallet linked to identity |
| Generate Claim signature | Qualification institution | No | None | Signature and Claim fields |
| Write Claim | Investor | Yes | Investor | `ClaimAdded` |
| Register with target asset | IR Agent | Yes | Asset issuer | `IdentityRegistered` |
| Query final eligibility | Any application | Read-only | No transaction gas | `isVerified == true` |

### Why the ClaimSigner does not call addClaim directly {#why-the-claimsigner-does-not-call-addclaim-directly}

The ClaimSigner proves the eligibility conclusion. The investor controls their own ONCHAINID.

The normal pattern is:

```text
ClaimSigner signs off-chain
        ↓
Investor receives the signature
        ↓
Investor calls ONCHAINID.addClaim
```

The qualification institution does not pay on-chain gas for every investor or control the investor's identity.

### How an application determines onboarding completion {#how-an-application-determines-onboarding-completion}

Confirm in order:

1.  `IdFactory.getIdentity(wallet)` returns a valid identity;
2.  the ONCHAINID contains a Claim for the target Topic;
3.  `IdentityRegistry.contains(wallet) == true`;
4.  `IdentityRegistry.isVerified(wallet) == true`.

The IdentityRegistry bound to the target Token is the final authority.

## 4.4 Step 3: Mint {#44-step-3-mint}

After onboarding and satisfaction of off-chain business conditions, the Token Agent mints units.

The application should:

1.  confirm that subscription or issuance conditions have been satisfied;
2.  query recipient eligibility again;
3.  convert the amount using `decimals`;
4.  let the Token Agent submit the transaction;
5.  wait for the receipt and `Transfer` event;
6.  update the business order's final state.

A broadcast transaction does not mean the units have arrived.

## 4.5 Step 4: Investor transfer {#45-step-4-investor-transfer}

After transfers are enabled, a holder can transfer to another eligible investor.

Recommended pre-submission sequence:

```text
Validate Chain ID and Token address
→ Read decimals
→ Check paused and freeze state
→ Query recipient isVerified
→ Optionally call canTransfer
→ Holder signs and sends
→ Wait for receipt
```

`canTransfer` is a precheck. On-chain state may change before confirmation, so the actual transaction determines the final result.

Allowance-based transfers follow the standard ERC-20 flow:

## 4.6 Step 5: Redemption and burn {#46-step-5-redemption-and-burn}

Burning normally corresponds to redemption or cancellation of units:

On-chain burn and off-chain settlement are distinct states. Record them separately; a successful `burn` does not prove that real-world funds have arrived.

## 4.7 Interpreting Transfer events {#47-interpreting-transfer-events}

| `from` | `to` | Meaning |
| --- | --- | --- |
| Zero address | Investor | Mint |
| Investor | Zero address | Burn |
| Non-zero address | Non-zero address | Ordinary transfer or forced transfer |

To distinguish an ordinary transfer from an Agent forced transfer, also inspect the called method and administrative events.

## 4.8 Common failures {#48-common-failures}

| Symptom | Common cause | Response |
| --- | --- | --- |
| `isVerified == false` | Missing registration, missing/expired Claim, unrecognized Issuer | Identify the failed onboarding step instead of retrying mint |
| `Identity is not verified.` | Mint recipient is ineligible | Complete eligibility flow |
| `Compliance not followed` | Asset rule triggered | Query rules and contact the issuer |
| `Pausable: paused` | Token transfers are not enabled | Stop submission and show pause state |
| Wallet frozen | Issuer froze the address | Contact the issuer |
| Insufficient balance | Incorrect amount conversion or insufficient available balance | Re-read `decimals` and frozen amount |
| Permission error | Caller is not the required Agent/Owner | Route to the correct role |
| Transaction remains pending | RPC, gas, or network issue | Query by transaction hash and avoid duplicating the business instruction |

## 4.9 What to read next {#49-what-to-read-next}

For implementation, use the next chapter as a reference by caller and purpose:

[Continue: 05 · Contract Interfaces and Events](https://dev-docs.botchain.ai/docs/RWA/core-methods-and-events/)
