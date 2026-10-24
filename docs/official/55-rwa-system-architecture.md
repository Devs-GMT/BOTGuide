---
title: "03 · System Architecture and Roles"
section: "RWA"
source_url: https://dev-docs.botchain.ai/docs/RWA/system-architecture
source: official
last_synced: 2026-10-24
---
# 03 · System Architecture and Roles

The previous chapter explained each core object. This chapter places them in the complete system and explains contract layers, sharing boundaries, and participant responsibilities.

## 3.1 Four-layer architecture {#31-four-layer-architecture}

Ordinary applications mainly access the asset layer. ONCHAINID Gateway is needed when creating an identity, and TREXGateway is needed when issuing a new asset.

## 3.2 Platform-shared and asset-specific components {#32-platform-shared-and-asset-specific-components}

### Platform-shared capabilities {#platform-shared-capabilities}

Project RWA normally provides:

-   `ONCHAINID Gateway`: public entry point for investors to create identities;
-   `IdFactory`: creates identities and stores wallet-to-identity mappings;
-   `TREXGateway`: admission entry point for issuing new assets;
-   `TREXFactory`: creates asset Suites;
-   Implementation Authority: manages implementation versions used by proxies.

Published addresses are listed in [06 · Environment Configuration and Acceptance](https://dev-docs.botchain.ai/docs/RWA/testnet-practice/).

### Asset-specific capabilities {#asset-specific-capabilities}

Each issuance creates a new:

```text
Token
IdentityRegistry
IdentityRegistryStorage
ClaimTopicsRegistry
TrustedIssuersRegistry
ModularCompliance
```

Each asset can therefore have independent eligibility requirements, recognized institutions, compliance rules, and administrative roles.

## 3.3 Connections inside one asset {#33-connections-inside-one-asset}

Some associated addresses can be discovered dynamically on-chain:

```text
Token.identityRegistry()           → IdentityRegistry
Token.compliance()                 → ModularCompliance
IdentityRegistry.identity(wallet)  → Investor ONCHAINID
IdentityRegistry.topicsRegistry()  → ClaimTopicsRegistry
IdentityRegistry.issuersRegistry() → TrustedIssuersRegistry
```

Validate both the public address table and on-chain results. Stop write operations and confirm the target asset configuration when they differ.

## 3.4 Five participant types {#34-five-participant-types}

### Project RWA platform {#project-rwa-platform}

Responsible for network and shared infrastructure:

-   publishing RPC, Chain ID, explorer, and public contract addresses;
-   managing admission for new asset issuance;
-   maintaining shared identity, issuance, and version infrastructure;
-   publishing upgrade, security, and migration notices;
-   providing test environments and integration support.

The platform does not replace the issuer in defining real-world asset rights and redemption terms.

### Asset issuer {#asset-issuer}

Responsible for a specific asset:

-   defining name, symbol, decimals, and real-world rights;
-   selecting required Claim Topics;
-   selecting recognized ClaimIssuers;
-   configuring country, limit, or lockup rules;
-   appointing Owner, Token Agent, and IR Agent;
-   registering investors;
-   performing mint, burn, pause, and freeze operations.

### Qualification institution {#qualification-institution}

Responsible for eligibility review:

-   performing KYC/AML and other reviews off-chain;
-   generating Claim signatures;
-   managing eligibility expiry and revocation;
-   protecting the Claim signing key.

### Investor {#investor}

Responsible for their wallet and identity:

-   creating or controlling ONCHAINID;
-   submitting signed Claims;
-   paying gas for their own transactions;
-   initiating transfers and approvals;
-   protecting wallet keys.

### Application developer {#application-developer}

Responsible for connecting correctly to the on-chain system:

-   using the correct network and proxy addresses;
-   reading decimals and associated contracts dynamically;
-   coordinating user interaction without custody of administrative private keys;
-   processing receipts, events, and reverts;
-   distinguishing on-chain state from off-chain business state.

## 3.5 Operations and permissions {#35-operations-and-permissions}

| Operation | Target | Signer | Platform or issuer permission required |
| --- | --- | --- | --- |
| Query asset and balance | Token | None, read-only | No |
| Query eligibility | IdentityRegistry | None, read-only | No |
| Create ONCHAINID | ONCHAINID Gateway | Investor | No |
| Generate Claim signature | Off-chain signing service | Qualification institution | Yes |
| Write Claim | Investor ONCHAINID | Investor | No |
| Register investor | IdentityRegistry | IR Agent | Yes |
| Mint / burn | Token | Token Agent | Yes |
| Ordinary transfer | Token | Token holder | No |
| Issue new asset | TREXGateway | Approved issuer account | Yes |
| Upgrade contract | Version-management contract | Governance role | Yes |

Applications can construct transactions, but the final signer must satisfy contract permissions.

## 3.6 Multi-asset scenarios {#36-multi-asset-scenarios}

An investor can reuse a wallet and ONCHAINID, while each asset makes an independent eligibility decision:

-   Claim reuse depends on whether the assets recognize the same Topic and Issuer;
-   query every asset through its own IdentityRegistry;
-   participation in independent assets normally requires registration in multiple registries;
-   whether the underlying IdentityRegistryStorage is shared depends on the issuance design and must not be assumed by the application.

## 3.7 Effect of upgrades on external applications {#37-effect-of-upgrades-on-external-applications}

A normal upgrade does not change the proxy address or the balances and identity state stored by the proxy.

The system has three version mechanisms:

| Object | Version mechanism | Scope |
| --- | --- | --- |
| Token, IR, IRS, CTR, TIR, MC | TREX Implementation Authority | Asset Suites referencing the same IA |
| Investor ONCHAINID | ONCHAINID Implementation Authority | Identity contracts referencing the same IA |
| Upgradeable compliance module | ERC1967 / UUPS | Assets referencing that module |

Integration teams should monitor:

-   whether ABI methods are added or deprecated;
-   whether events remain compatible;
-   whether the platform publishes migration instructions;
-   whether network, address, and read-only checks still pass after an upgrade.

Ordinary applications do not call upgrade interfaces directly.

A global IA upgrade has a broad impact. Production issuers should use multisig, delayed execution, storage-layout checks, and upgrade rehearsals. External applications use proxy addresses and follow published upgrade notices.

## 3.8 Governance and security boundaries {#38-governance-and-security-boundaries}

System permissions fall into four groups:

| Permission | Purpose | Recommendation |
| --- | --- | --- |
| Owner | Upgrade, replace components, configure rules | Use multisig and delayed execution for production assets |
| Agent | Registration, mint, burn, pause, freeze, and routine operations | Separate duties, grant minimum authority, retain audit records |
| Contract callback | Automated calls among Token, Compliance, and modules | Do not assign to a human wallet |
| ONCHAINID Key | Identity management, execution, and Claim signing | Separate management keys from Claim keys |

A Safe or other multisig contract can hold Owner or identity-management permissions. When Claim validation depends on a recoverable signing address, use a controlled EOA, HSM, or MPC signing service for the Claim key.

Pay special attention to:

-   loss of Owner, Agent, IA, or ClaimIssuer control directly affects assets or investor eligibility;
-   pausing does not prevent Agent mint, burn, forced transfer, or wallet recovery;
-   removing a trusted Issuer or changing a required Topic can alter many investors' eligibility at once;
-   contracts do not replace underlying-asset authenticity, legal title, or redemption arrangements.

## 3.9 What to read next {#39-what-to-read-next}

The next chapter follows the actual sequence of events and explains asset issuance, investor onboarding, minting, transfers, and burning:

[Continue: 04 · Complete Business Processes](https://dev-docs.botchain.ai/docs/RWA/core-processes/)
