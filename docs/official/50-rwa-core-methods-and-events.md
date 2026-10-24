---
title: "05 · Contract Interfaces and Events"
section: "RWA"
source_url: https://dev-docs.botchain.ai/docs/RWA/core-methods-and-events
source: official
last_synced: 2026-10-24
---
# 05 · Contract Interfaces and Events

The previous chapter described issuance, onboarding, minting, transfers, and burning. This chapter maps those processes to contract methods and serves as an implementation reference.

## 5.1 Find the correct contract first {#51-find-the-correct-contract-first}

An external application does not need to connect directly to the entire Suite. Start from the asset Token proxy address:

Recommended discovery order:

1.  Read the Token proxy address for the target environment from the public address table;
2.  Call `Token.identityRegistry()` for the asset registry;
3.  Call `Token.compliance()` for the asset compliance entry point;
4.  Query the wallet's ONCHAINID through `IdFactory.getIdentity(wallet)`;
5.  Compare on-chain results with public configuration and never use an implementation address as the business entry point.

## 5.2 Permission reference {#52-permission-reference}

| Caller | Common write methods | Description |
| --- | --- | --- |
| Any user or application | All `view` methods | Read-only calls send no transaction and consume no user gas |
| Token holder | `transfer`, `approve`, `transferFrom` | Identity, pause, freeze, and compliance checks still apply |
| Investor identity-management wallet | `deployIdentityForWallet`, `addClaim` | Create and maintain its own ONCHAINID |
| IR Agent | `registerIdentity`, `updateIdentity`, `updateCountry`, `deleteIdentity` | Manage investor registration for one asset |
| Token Agent | `mint`, `burn`, `pause`, `unpause`, freeze, forced transfer, recovery | Asset-management operations |
| Contract Owner | Change registries, compliance modules, or governance configuration | Outside ordinary application integration |

Identify the current wallet role before showing operations. Hiding a button in the frontend does not replace on-chain permission control.

## 5.3 Token {#53-token}

### Common read methods {#common-read-methods}

| Method | Return | Purpose |
| --- | --- | --- |
| `name()` / `symbol()` | `string` | Display asset name and symbol |
| `decimals()` | `uint8` | Amount conversion |
| `totalSupply()` | `uint256` | Current total supply |
| `balanceOf(wallet)` | `uint256` | Total wallet balance |
| `identityRegistry()` | `address` | Asset eligibility registry |
| `compliance()` | `address` | Asset compliance entry point |
| `paused()` | `bool` | Whether ordinary transfers are paused |
| `isFrozen(wallet)` | `bool` | Whether the wallet is fully frozen |
| `getFrozenTokens(wallet)` | `uint256` | Partially frozen amount |

Calculate available balance as:

```text
availableBalance = balanceOf(wallet) - getFrozenTokens(wallet)
```

### Holder write methods {#holder-write-methods}

| Method | Purpose | Main prerequisites |
| --- | --- | --- |
| `transfer(to, amount)` | Direct transfer | Token active, wallet states allowed, recipient eligible, rules pass |
| `approve(spender, amount)` | Set allowance | Holder signature |
| `transferFrom(from, to, amount)` | Transfer using allowance | Allowance, balance, eligibility, and rules pass |

### Token Agent methods {#token-agent-methods}

| Method | Purpose | Key result |
| --- | --- | --- |
| `mint(to, amount)` | Mint | `Transfer(0x0, to, amount)` |
| `burn(wallet, amount)` | Burn | `Transfer(wallet, 0x0, amount)` |
| `pause()` / `unpause()` | Pause or enable ordinary transfers | `Paused` / `Unpaused` |
| `setAddressFrozen(wallet, frozen)` | Fully freeze or unfreeze a wallet | `AddressFrozen` |
| `freezePartialTokens(wallet, amount)` | Freeze part of a balance | `TokensFrozen` |
| `unfreezePartialTokens(wallet, amount)` | Unfreeze part of a balance | `TokensUnfrozen` |
| `forcedTransfer(from, to, amount)` | Administrative forced transfer | `Transfer` |
| `recoveryAddress(lost, new, identity)` | Recover assets to a new wallet | `RecoverySuccess` and `Transfer` |

Every `amount` is an integer in the smallest unit. Batch methods may hit the block gas limit, so split batches and track each transaction separately.

Token operations apply different checks:

| Operation | Blocked while paused | Recipient eligibility | `canTransfer` | Frozen-balance handling |
| --- | --- | --- | --- | --- |
| `transfer` / `transferFrom` | Yes | Checked | Checked | Frozen units cannot transfer |
| `mint` | No | Checked | Checked | Not applicable |
| `burn` | No | Not checked | Not checked | Agent may need to unfreeze |
| `forcedTransfer` | No | Checked | Not checked | Agent may need to unfreeze |
| `recoveryAddress` | No | Recovery-flow rules | Not checked | Frozen state can migrate |

Pause primarily restricts ordinary holder transfers. It does not stop Agent mint, burn, forced transfer, or wallet recovery.

## 5.4 IdentityRegistry {#54-identityregistry}

IdentityRegistry belongs to a specific asset. Obtain its address from the target Token's `identityRegistry()` before querying or registering an investor.

### Common read methods {#common-read-methods-1}

| Method | Meaning |
| --- | --- |
| `contains(wallet)` | Whether the wallet has a registration record |
| `isVerified(wallet)` | Whether the wallet satisfies all current requirements |
| `identity(wallet)` | Registered ONCHAINID address |
| `investorCountry(wallet)` | Registered country or region code |
| `topicsRegistry()` | Registry of required Claim Topics |
| `issuersRegistry()` | Registry of recognized ClaimIssuers |

`contains == true` only confirms a registration record and does not replace `isVerified == true`.

### IR Agent methods {#ir-agent-methods}

| Method | Purpose | Event |
| --- | --- | --- |
| `registerIdentity(wallet, identity, country)` | First registration | `IdentityRegistered` |
| `updateIdentity(wallet, identity)` | Replace associated identity | `IdentityUpdated` |
| `updateCountry(wallet, country)` | Update country or region code | `CountryUpdated` |
| `deleteIdentity(wallet)` | Remove registration from the asset | `IdentityRemoved` |

One ONCHAINID can be referenced by multiple assets, but each asset uses its own IdentityRegistry and normally requires a separate registration.

## 5.5 ONCHAINID Gateway, IdFactory, and Identity {#55-onchainid-gateway-idfactory-and-identity}

### Create or query identity {#create-or-query-identity}

| Contract | Method | Caller | Purpose |
| --- | --- | --- | --- |
| ONCHAINID Gateway | `deployIdentityForWallet(wallet)` | Investor | Create deterministic ONCHAINID for wallet |
| IdFactory | `getIdentity(wallet)` | Any application | Query associated identity |

IdFactory emits `Deployed` and `WalletLinked` after creation. Query `getIdentity(wallet)` again and use the final on-chain mapping.

### Claim methods {#claim-methods}

The investor calls on their own ONCHAINID:

```solidity
addClaim(
    uint256 topic,
    uint256 scheme,
    address issuer,
    bytes signature,
    bytes data,
    string uri
) returns (bytes32 claimId)
```

| Method | Purpose |
| --- | --- |
| `getClaim(claimId)` | Read all fields of one Claim |
| `getClaimIdsByTopic(topic)` | Query Claim IDs for a Topic |
| `isClaimValid(identity, topic, signature, data)` | Validate ClaimIssuer signature |

Key events:

-   `ClaimAdded`: first write;
-   `ClaimChanged`: update;
-   `ClaimRemoved`: removal.

ClaimSigner generates the off-chain signature. ClaimIssuer is the on-chain institution contract to which the signature belongs. They are distinct concepts.

## 5.6 ModularCompliance {#56-modularcompliance}

`canTransfer` is defined on ModularCompliance, not Token:

```solidity
canTransfer(
    address from,
    address to,
    uint256 amount
) view returns (bool)
```

| Method | Purpose |
| --- | --- |
| `canTransfer(from, to, amount)` | Precheck whether current rules allow transfer |
| `getModules()` | List bound rule modules |
| `getTokenBound()` | Get bound Token |
| `isModuleBound(module)` | Check whether a module is bound |

`canTransfer == true` means rules pass at query time. Pause, freeze, balance, eligibility, or rules may change before the transaction, so the receipt remains authoritative.

`transferred`, `created`, and `destroyed` are called by the bound Token to notify compliance modules of state changes. Ordinary applications do not call them directly.

## 5.7 Event indexing {#57-event-indexing}

Index at least:

| Event | Source | Purpose |
| --- | --- | --- |
| `Transfer` | Token | Mint, burn, transfer |
| `Approval` | Token | Allowance changes |
| `Paused` / `Unpaused` | Token | Transfer-status changes |
| `AddressFrozen` | Token | Full wallet freeze |
| `TokensFrozen` / `TokensUnfrozen` | Token | Partial freeze changes |
| `RecoverySuccess` | Token | Wallet recovery |
| `IdentityRegistered` / `IdentityRemoved` | IdentityRegistry | Registration changes |
| `IdentityUpdated` / `CountryUpdated` | IdentityRegistry | Identity or country changes |
| `ClaimAdded` / `ClaimChanged` / `ClaimRemoved` | ONCHAINID | Eligibility-evidence changes |
| `ModuleAdded` / `ModuleRemoved` | ModularCompliance | Rule-module changes |

Events reveal changes but are not current state by themselves. After a reorganization, backfill, or long offline period, re-read contract state for reconciliation.

## 5.8 Minimum ABI {#58-minimum-abi}

Start with this minimum set when a full ABI is unnecessary:

```js
const tokenAbi = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function identityRegistry() view returns (address)',
  'function compliance() view returns (address)',
  'function paused() view returns (bool)',
  'function isFrozen(address) view returns (bool)',
  'function getFrozenTokens(address) view returns (uint256)',
  'function transfer(address,uint256) returns (bool)',
  'event Transfer(address indexed from,address indexed to,uint256 value)',
];

const identityRegistryAbi = [
  'function contains(address) view returns (bool)',
  'function isVerified(address) view returns (bool)',
  'function identity(address) view returns (address)',
  'function investorCountry(address) view returns (uint16)',
  'event IdentityRegistered(address indexed investorAddress,address indexed identity)',
];

const complianceAbi = [
  'function canTransfer(address,address,uint256) view returns (bool)',
  'function getModules() view returns (address[])',
];
```

Use the official ABI matching the deployed version for real write operations. Do not infer argument order from method names.

## 5.9 Recommended call order {#59-recommended-call-order}

Before an investor transfer:

```text
Validate Chain ID
→ Read Token.decimals
→ Read paused / isFrozen / getFrozenTokens
→ Obtain the correct registry through Token.identityRegistry
→ Query recipient contains / isVerified
→ Obtain compliance through Token.compliance
→ Call canTransfer
→ estimateGas or run a static simulation
→ Send transaction and wait for receipt
→ Update the application from events and latest state
```

The next chapter connects these interfaces to public environments and provides read, event-query, and acceptance steps:

[Continue: 06 · Environment Configuration and Acceptance](https://dev-docs.botchain.ai/docs/RWA/testnet-practice/)
