---
title: "ERC-3643 Protocol Introduction"
section: "RWA"
source_url: https://dev-docs.botchain.ai/docs/RWA/erc-3643-protocol-research
source: official
last_synced: 2026-10-24
---
# ERC-3643 Protocol Introduction

## Contents {#contents}

1.  [At a glance](#1-at-a-glance)
2.  [Five core concepts](#2-five-core-concepts)
3.  [Overall contract architecture](#3-overall-contract-architecture)
4.  [Contract responsibilities and on-chain state](#4-contract-responsibilities-and-on-chain-state)
5.  [Contract interactions](#5-contract-interactions)
6.  [Permissions and multisig](#6-permissions-and-multisig)
7.  [Research and demo conclusions](#7-research-and-demo-conclusions)
8.  [Security boundaries](#8-security-boundaries)
9.  [Glossary](#9-glossary)

* * *

## 1\. At a glance {#1-at-a-glance}

ERC-3643 is **an ERC-20 issuance framework with identity verification and compliance checks**. It defines who may hold a token, whether a transfer may proceed, how authorized parties freeze, force-transfer, or recover assets, and how implementations are upgraded consistently.

| Dimension | Regular ERC-20 | ERC-3643 |
| --- | --- | --- |
| Who can receive | Any address | Verified identities only |
| Transfers | Cannot reject based on business rules | Compliance modules may reject |
| Freeze, force transfer, wallet recovery | Unavailable | Available |
| Rule changes | Usually require another contract | Change configuration or modules |

* * *

## 2\. Five core concepts {#2-five-core-concepts}

| Concept | Meaning |
| --- | --- |
| **ONCHAINID** | On-chain user identity separate from a wallet; one identity may link several wallets |
| **Claim** | A signed qualification assertion attached to an identity |
| **Claim Issuer** | Institution contract authorized to issue or revoke Claims |
| **Identity Registry** | Determines whether an address belongs to an eligible investor—the person check |
| **Compliance module** | Determines whether a transaction follows the rules—the transaction check |

Both gates must pass. A KYC-approved investor can still be rejected by a holding limit or another compliance rule.

* * *

## 3\. Overall contract architecture {#3-overall-contract-architecture}

### 3.1 Four layers {#31-four-layers}

| Layer | Instance count | Purpose |
| --- | --- | --- |
| Platform | Usually one per chain | Issuance access, identity creation, shared upgrades |
| Suite | Six contracts per asset | Balances, identity, compliance, governance |
| ONCHAINID | One per user | Keys and Claims |
| Compliance module | Deployed by rule and reusable | Executable transaction rules |

The contracts are separated so each responsibility can evolve independently: Token manages the ledger; IR, IRS, CTR, and TIR manage identity qualifications; MC manages transaction rules. **Proxy addresses remain stable:** the proxy stores state and the implementation supplies logic.

### 3.2 Three upgrade mechanisms {#32-three-upgrade-mechanisms}

| Object | Mechanism | Upgrade entry point | Scope |
| --- | --- | --- | --- |
| Six TREX contracts | IA pointer proxy | TREX IA | Assets still referencing that IA |
| ONCHAINID | ONCHAINID IA | `updateImplementation` | Identities referencing that IA |
| Compliance module | ERC1967 + UUPS | Module owner `upgradeTo` | Assets bound to that module |

* * *

## 4\. Contract responsibilities and on-chain state {#4-contract-responsibilities-and-on-chain-state}

The chain stores **business state and rule configuration**, not identity-document images. Names, identity numbers, and other sensitive data stay in the off-chain KYC system. The chain records conclusions such as qualification types, holdings, and transfer eligibility.

### 4.1 Chain-wide platform contracts {#41-chain-wide-platform-contracts}

| Contract | Purpose | Main on-chain state | Important limit |
| --- | --- | --- | --- |
| `TREXImplementationAuthority` | Selects the implementation version used by RWA assets | Current version and six implementation addresses per version | All six implementations must be registered together |
| `IAFactory` | Creates an independent upgrade authority for an asset | Assets that received an independent authority | Only the global authority administrator can create one |
| `TREXFactory` | Deploys and initializes a complete RWA Suite | Used salts, authority, identity factory, authorized deployers | Initial configuration: at most 5 Topics, issuers, and agents; 30 module operations |
| `TREXGateway` | Controls issuers, public issuance, fees, and discounts | Public setting, fee token/amount/recipient, issuer list, discounts, admins | At most 5 Suites per batch |
| `IdFactory` | Creates on-chain identity profiles and wallet mappings | Wallet-to-identity and identity-to-wallet mappings | At most 101 wallets per identity |
| ONCHAINID `ImplementationAuthority` | Selects the identity implementation version | Current implementation and upgrade authority | A change affects all referencing identities |
| `ONCHAINID Gateway` | Lets users create identities with platform-authorized signatures | Authorized signers and revoked signatures | Usually outside the demo's main flow |

### 4.2 Six core contracts per RWA asset {#42-six-core-contracts-per-rwa-asset}

| Contract | Purpose | Main on-chain state | Important limit |
| --- | --- | --- | --- |
| `Token` | Ledger plus transfer, mint, burn, pause, freeze, force transfer, and wallet recovery | Balances, allowances, supply, metadata, pause state, wallet and partial freezes, attached IR/MC, owners and agents | `decimals` from 0 to 18 |
| `IdentityRegistry` | Checks recipient eligibility before transfer or mint | References to CTR, TIR, IRS and registry administrators | More requirements and issuers increase gas cost |
| `IdentityRegistryStorage` | Stores wallet identity and country; may be shared | Wallet → identity + country and registries using the storage | At most 300 IdentityRegistries; one record per wallet |
| `ClaimTopicsRegistry` | Defines qualifications required to hold the asset | Required Topics and administrators | At most 15 unique Topics |
| `TrustedIssuersRegistry` | Defines accepted issuers and their allowed Topics | Issuers and qualification types | At most 50 issuers and 15 Topics each |
| `ModularCompliance` | Applies amount, country, lock-up, and other transaction rules | Bound Token, attached modules, administrators | One Token and at most 25 modules |

### 4.3 User identities and rule modules {#43-user-identities-and-rule-modules}

| Contract | Purpose | Main on-chain state |
| --- | --- | --- |
| `ONCHAINID` / `Identity` | One reusable on-chain identity per person; wallets are replaceable tools | Management, action, and Claim keys; received Claims |
| `ClaimIssuer` | KYC/AML institution contract that issues and revokes attestations | Identity keys plus revoked signatures |
| `ModuleProxy` | Stable entry point for one business rule | Current implementation plus per-asset parameters |

Source locations: platform contracts are under `contracts/factory/` and `proxy/authority/`; asset contracts are under `token/`, `registry/`, and `compliance/modular/`; identity capabilities come from `@onchain-id/solidity`.

* * *

## 5\. Contract interactions {#5-contract-interactions}

### 5.1 Dependencies {#51-dependencies}

### 5.3 Issuance {#53-issuance}

The Gateway salt is generally the hexadecimal owner address plus Token name. When fees are enabled, approve the fee token first.

### 5.4 Investor onboarding: identity, KYC signature, and on-chain Claim {#54-investor-onboarding-identity-kyc-signature-and-on-chain-claim}

Onboarding consists of four stages: identity-contract creation, qualification signing, Claim submission, and asset-side registration. Keep these distinctions clear:

1.  **Creating an ONCHAINID is an on-chain transaction** that deploys an investor identity contract.
2.  **The ClaimSigner KYC signature is off-chain** and creates no transaction or gas cost.
3.  **`addClaim` is an on-chain transaction** that stores the ClaimSigner signature and KYC conclusion in the investor's ONCHAINID.

#### 5.4.1 Production flow: self-service identity creation through ONCHAINID Gateway {#541-production-flow-self-service-identity-creation-through-onchainid-gateway}

`IdFactory.createIdentity` is `onlyOwner`, so investors cannot call the factory directly. For production, deploy the official `Gateway.sol`, transfer IdFactory ownership to it, and let investors call `Gateway.deployIdentityForWallet(investor)`. The Gateway calls `IdFactory.createIdentity` as owner, while the investor remains the transaction sender and pays gas.

#### 5.4.2 Caller and gas payer by step {#542-caller-and-gas-payer-by-step}

| Step | Action | Initiator | On-chain | Gas payer | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | KYC review | Investor and review system | No | None | Plaintext personal information remains off-chain |
| 2 | Create ONCHAINID | Investor calls `Gateway.deployIdentityForWallet` | Yes | Investor | Gateway calls `IdFactory.createIdentity` |
| 3 | Sign KYC | ClaimSigner signs `hash(identity, topic, data)` | No | None | EOA/HSM/MPC signature, not a transaction |
| 4 | Submit KYC Claim | Investor calls `Identity.addClaim` | Yes | Investor | Contract calls `ClaimIssuer.isClaimValid` |
| 5 | Register for the asset | IR Agent calls `IdentityRegistry.registerIdentity` | Yes | IR Agent | Records wallet, identity, and country in a Suite |
| 6 | Verify result | Anyone calls `IdentityRegistry.isVerified` | No, view | None | Must return true before mint or transfer reception |

#### 5.4.3 Is the ClaimSigner KYC signature on-chain? {#543-is-the-claimsigner-kyc-signature-on-chain}

The signature itself is off-chain:

```text
digest = keccak256(abi.encode(identity, topic, data))
signature = ClaimSigner.signMessage(digest)
```

The next `addClaim` transaction stores these arguments:

```solidity
Identity.addClaim(
    topic,
    1,
    claimIssuer,
    signature,
    data,
    uri
)
```

The investor submits `addClaim`, while the identity contract calls `ClaimIssuer.isClaimValid(...)` to validate that the issuer is trusted, the signature comes from a registered Claim key, the signature has not been revoked, and the Topic is required. **Trust comes from the ClaimSigner signature**, not the `addClaim` sender.

### 5.5 Transfer, mint, and burn matrix {#55-transfer-mint-and-burn-matrix}

| Operation | Caller | Paused check | Freeze check | Identity check | Compliance check | Auto-unfreeze |
| --- | --- | --- | --- | --- | --- | --- |
| Transfer / delegated transfer | Holder / approved spender | **Yes** | Both sides | Recipient | **Yes** | No |
| Mint | Agent | No | No | Recipient | **Yes** | No |
| Burn | Agent | No | No | No | No | **Yes** |
| Forced transfer | Agent | No | No | Recipient | **No**, still calls `transferred` | **Yes** |
| Wallet recovery | Agent | No | No | Uses forced transfer | No | **Yes** |

Gate 1 validates only the recipient. Pausing does not block administrative operations. Forced transfer skips `canTransfer`, and partial freezes do not block an Agent.

### 5.7 Upgrade interactions {#57-upgrade-interactions}

| Object | Call chain | Impact |
| --- | --- | --- |
| TREX contracts | IA owner → `addTREXVersion` → `useTREXVersion` | Proxies referencing the reference IA |
| Detach one asset | Same address owns all six → `changeImplementationAuthority` | Target asset only |
| ONCHAINID | OID IA owner → `updateImplementation` | All referencing identities |
| Compliance module | Module owner → `upgradeTo` | MCs bound to that module |

* * *

## 6\. Permissions and multisig {#6-permissions-and-multisig}

### 6.1 Four permission models {#61-four-permission-models}

| Model | Authorization | Purpose | Safe compatibility |
| --- | --- | --- | --- |
| Owner | `msg.sender == owner` | Governance, component replacement, upgrades, rules | **Supported**, no EOA restriction |
| Agent | Agent list | Frequent mint, freeze, registration operations | Technically supported; multisig is inefficient for every high-frequency action |
| onlyToken / onlyComplianceCall | Bound contract address | Automatic callbacks and parameter forwarding | Not a human account |
| ONCHAINID Key | Purpose-based `keccak256(address)` | Key management, external calls, Claims | Safe can manage action keys; **cannot sign Claims natively** |

There is no native Timelock. `transferOwnership` may assign ownership to a Safe. `renounceOwnership` permanently removes the owner and must be guarded against in production.

### 6.2 Permission matrix {#62-permission-matrix}

| Contract | Role | Critical capability | Safe recommendation |
| --- | --- | --- | --- |
| TREX IA / ONCHAINID IA | Owner | Global upgrades | Highest-security Safe + Timelock |
| TREXFactory | Owner | Deploy Suites and recover contracts still owned by Factory | Usually owned by Gateway |
| TREXGateway | Owner / Agent | Access, fees, Factory ownership, deployers | Owner → Safe; Agent → service account |
| Token | Owner / Agent | Replace IR/MC, manage agents, mint, burn, freeze, force transfer, recovery | Owner → Safe; separate Agent duties |
| IR | Owner / Agent | Replace CTR/TIR/IRS and manage investor registrations | Owner → Safe; Agent → KYC account |
| IRS | Owner / Agent | Bind IR and write identity master data | Establish ownership model first |
| CTR / TIR / MC | Owner | Topics, issuers, modules, parameters | Compliance Safe + Timelock |
| Upgradeable Module | Module owner | UUPS upgrade | Safe + Timelock |
| IdFactory | Owner | Create identities | Platform Safe |
| Identity | Management/action/Claim keys | Manage keys, execute calls, manage Claims | Safe may hold management/action keys |
| ClaimIssuer | Management + Claim keys | Revoke and issue | Management → Safe; **issuance → EOA/HSM/MPC** |

### 6.3 Safe conclusions {#63-safe-conclusions}

**Safe works directly for:** Suite and platform owners, module upgrade owners, ONCHAINID management/action keys, and per-asset IA replacement when the same Safe owns all six contracts.

**Safe cannot natively sign Claims:** validation uses `ecrecover`, which recovers an EOA. Use Safe for issuer administration and an independent signer for Purpose 3.

**High-frequency actions should use constrained service accounts:** investor registration, routine mint/burn, deployer maintenance, rapid pause/freeze, force transfer, and recovery. Apply off-chain approval and alerting, with dual approval or dedicated multisig for exceptional risk.

### 6.4 Recommended layers and three pitfalls {#64-recommended-layers-and-three-pitfalls}

1.  **IRS ownership is not transferred with the other five contracts.** It remains with Factory, usually owned by Gateway, until `recoverContractOwnership` is called.
2.  **Changing IA for one asset requires all six `owner()` values to equal the same `msg.sender`.** Separate Safes cannot approve it independently.
3.  **Safe and Timelock provide different controls.** Global upgrades, IR/MC replacement, and Topic/issuer/module changes require an external execution delay.

* * *

## 7\. Research and demo conclusions {#7-research-and-demo-conclusions}

| Conclusion | Code fact |
| --- | --- |
| Topics have no fixed numbers | No hard-coded `1=KYC`; demo uses `keccak256("KYC_APPROVED")`, so maintain a chain-level Topic registry |
| Identity is not a Beacon | ONCHAINID uses ImplementationAuthority from npm 2.2.1 |
| Production compliance modules are missing | Only unaudited `DemoCountryAllowlistModule` and `TestModule`; legacy features are not deployable modules |
| Transfer entry point | Investors call Token directly; `IdentityProxy.execute` is unnecessary |
| Country code | `uint16`, ISO 3166-1 numeric, such as 156 and 702; demo module checks recipient only |
| Module parameters | Isolated by MC address, so one module may serve multiple assets |
| Identity reuse | Shared issuers avoid repeated KYC; shared IRS adds reuse with a larger governance surface |
| Dependency version | `package.json` uses `^2.0.0`, installed version is 2.2.1; pin the production version |

Recommended custom-module priority beyond the demo: country access, per-holder cap, total supply cap, holder count → lock-up, investor class, amount limits → conditional transfers and venue restrictions.

KYC/AML issuers and module parameters directly drive on-chain configuration. Custody, audit, and fiat rails mainly affect approvals. **Never put plaintext PII in Claim `data`.**

* * *

## 8\. Security boundaries {#8-security-boundaries}

-   Compromise of Owner, Agent, IA, or ClaimIssuer can directly change assets or eligibility. Separate long-lived Owner and Agent signers.
-   Forced transfer and burn may automatically unfreeze units; pause does not block administrative operations.
-   Removing a trusted issuer or clearing Topics changes eligibility for many users at once.
-   A global IA upgrade has broad impact and requires multisig, Timelock, storage-layout validation, and rollback rehearsal.
-   Contracts cannot establish underlying-asset authenticity, legal title, redemption, or cross-jurisdiction legality; define these in a separate rule matrix.

* * *

## 9\. Glossary {#9-glossary}

| Term | Meaning |
| --- | --- |
| T-REX / Suite | ERC-3643 reference implementation / six business contracts for one asset |
| ONCHAINID / Claim / Topic / Issuer | Identity contract / qualification assertion / assertion type / issuing institution |
| IR / IRS / CTR / TIR / MC | Identity registry / identity storage / Topic registry / issuer registry / compliance coordinator |
| Owner / Agent | Configuration governance authority / operational authority |
| Implementation Authority | Version authority that selects the current proxy implementation |
| TREXFactory / Gateway / IdFactory | Asset factory / issuance access gateway / identity factory |
