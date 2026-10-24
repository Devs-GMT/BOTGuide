---
title: "Agent Identity"
section: "Agent OS"
source_url: https://dev-docs.botchain.ai/docs/Agent-OS/agent-identity
source: official
last_synced: 2026-10-24
---
# Agent Identity

Give your AI Agent an independently verifiable on-chain identity compliant with [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004).

**In one sentence:** Create an Agent wallet first, then call the identity registration endpoint once. A few seconds later, the Agent has an on-chain ID that anyone can verify independently. Request on-chain wallet binding separately after registration completes.

This chapter is for developers integrating their systems with the BOT Chain Agent Identity service. It covers obtaining credentials, registering an identity, requesting wallet binding, determining readiness, maintaining descriptive metadata, and enabling third parties to verify it without trusting you.

All paths in this chapter are relative to one of these base URLs:

| Environment | URL |
| --- | --- |
| BOT Mainnet | `https://identity-api.botchain.ai` |
| Bohr Testnet | `https://identity-api.bohr.life` |

## 1\. Overview {#1-overview}

| Question | Answer |
| --- | --- |
| What do I get? | An on-chain `agentId` and a publicly published JSON description file |
| How do I authenticate? | The `X-API-Key` request header |
| Is registration synchronous? | No. Creation immediately returns `202`; on-chain operations run in the background |
| How do I know it is complete? | Poll identity status or receive status-change webhooks |
| How long does it take? | Usually a few seconds, depending on block time |
| Who pays gas? | We do. Your system holds no private keys and does not need to fund the account |
| What can third parties verify? | The owner, Agent wallet, and description file URL, all read directly from the chain |
| Which chains are supported? | BOT Mainnet (chain ID `677`) and Bohr Testnet (chain ID `968`) |

Remember:

> You describe the Agent through the API. The chain records who owns it and which wallet it uses. Others can verify the latter directly without asking you.

## 2\. Get credentials {#2-get-credentials}

Each integrator is a **project** with a project ID and one or more API keys. We issue the keys; self-service provisioning is not currently available. Tell us your desired project name and we return:

```text
project_id  launchpad
key_id      k_01J8XV…
api_key     ak_live_k_01J8XV….<secret>
```

`project_id` is provided during provisioning for your records; **do not include `project_id` in application requests—it is not required**. The server resolves the tenant from the API key, so changing the request body cannot create resources in another project.

An API key consists of two parts separated by a dot:

```text
ak_<environment>_k_<key_id>.<secret>
```

`<environment>` is the issuance environment label (such as `live` or `test`), **not** `project_id`. Project ownership is stored in the server-side `api_keys` table and associated with `key_id`.

Put the entire string, including the dot, in `X-API-Key`. **The secret is returned only once at creation and cannot be retrieved later.** Store it in your secrets manager immediately. If lost, it must be reissued and the old key revoked; recovery is not available.

Keys are environment-specific; testnet keys do not work on mainnet.

## 3\. Register an identity {#3-register-an-identity}

Create a wallet first

An identity is registered **for an Agent wallet**. Both `wallet_id` and `wallet_address` are required and must come from an existing wallet. Create the wallet before calling this endpoint; see [Agent Wallet](https://dev-docs.botchain.ai/docs/Agent-OS/agent-wallet).

A `wallet_id` can belong to only one identity globally. Reusing it for another identity returns `409`.

```text
POST /v1/agents/identities
Content-Type: application/json
X-API-Key: ak_…
Idempotency-Key: <your-idempotency-key>
```

```json
{
  "external_agent_id": "your-agent-id",
  "wallet_id": "wal_de43139cef869dc9c4…",
  "chain_id": 677,
  "owner_address": "0x5f5802fA78d5eE2A3B4fD67F49CD502430C3E88C",
  "wallet_address": "0xd9DC4F46d9da603A2A077A7190BAa85f4e2f05fe",
  "metadata": {
    "name": "Example Agent",
    "description": "What this Agent does"
  },
  "callback_url": "https://your-service.example/webhooks/identity"
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `external_agent_id` | Yes | Agent identifier in your system, unique within the project and chain |
| `wallet_id` | Yes | The Agent wallet this identity belongs to (globally unique) |
| `chain_id` | Yes | Mainnet `677` or testnet `968`; other values are rejected |
| `owner_address` | Yes | Address controlling this identity; must be a valid EVM address |
| `wallet_address` | Yes | Agent wallet address used for transactions; must be a valid EVM address |
| `metadata` | Yes | Free-form description; `name` must exist and be nonempty |
| `callback_url` | No | Absolute `http`/`https` URL for status changes; use polling if omitted |
| `idempotency_key` | Yes | Supply in the body or in the `Idempotency-Key` header |

The request body contains **no** project ID or key material. The project is derived from the API key, so callers cannot create an identity in another project by passing a different value.

`external_agent_id` is unique within `(project, chain)`. Creating the same `(project, chain, external_agent_id)` again returns the existing identity with `"replayed": true`, even if the request content differs; it does not create a second record. Only permanent conflicts, such as a `wallet_id` already used by another identity, return `409`.

Returns `202 Accepted`: the identity record exists, but the on-chain operation has not happened yet.

```json
{
  "identity": {
    "identity_id": "idn_c39e39dd-1030-4c33-b888-5beeb876247d",
    "project_id": "launchpad",
    "external_agent_id": "your-agent-id",
    "wallet_id": "wal_de43139cef869dc9c4…",
    "chain_id": 677,
    "owner_address": "0x5f5802fa78d5ee2a3b4fd67f49cd502430c3e88c",
    "wallet_address": "0xd9dc4f46d9da603a2a077a7190baa85f4e2f05fe",
    "registry_address": "0xb43edfb9c7609cf645e932b2ff20f26f0d4488de",
    "status": "PENDING",
    "wallet_binding_status": "PENDING",
    "created_at": "2026-09-08T06:12:44Z",
    "updated_at": "2026-09-08T06:12:44Z"
  },
  "replayed": false
}
```

Save `identity_id`; all subsequent endpoints use it. Creation queues only owner gas funding, followed by `register()` and publication of the final metadata; it does **not** automatically queue wallet binding.

Read and write responses have different shapes

Write endpoints wrap the identity in `identity`; **read endpoints return the object directly**. After creation, use `response.identity.status`; after `GET`, use `response.status`. Reading both the same way is the most common integration mistake.

### Idempotency {#idempotency}

Use a unique `Idempotency-Key` for each logical creation. Replaying the same key returns `200` and `"replayed": true`, not `202`, so timeout retries do not create a second identity. Derive the key from your own Agent ID instead of generating a random value for every HTTP request; doing the latter defeats idempotency.

## 4\. Wait for registration {#4-wait-for-registration}

Registration passes through several background stages. You do not need to handle each one; watch for `status` to become `REGISTERED`.

| Status | Meaning |
| --- | --- |
| `PENDING` | Accepted and queued |
| `GAS_FUNDING` | Funding the owner account for gas |
| `REGISTERING` | `register()` submitted; waiting for on-chain inclusion |
| `METADATA_PENDING` | Publishing or updating the final registration file, both after initial registration and during later metadata updates |
| `REGISTERED` | **Registration complete.** `erc8004_agent_id` and `metadata_uri` are populated |
| `WALLET_BINDING` | Wallet-binding transaction submitted; waiting for on-chain confirmation, then returns to `REGISTERED` |

`wallet_binding_status` progresses independently: `PENDING` becomes `CONFIRMED` once on-chain binding completes.

An identity can be `REGISTERED` while `wallet_binding_status` remains `PENDING`: binding may not have been requested, or it may have been requested but the transaction has not yet been submitted. While the binding transaction is pending on-chain, `status` briefly becomes `WALLET_BINDING`.

### 4.1 Polling {#41-polling}

```text
GET /v1/agents/identities/{identity_id}
X-API-Key: ak_…
```

Read endpoints return the identity directly without a wrapper:

```json
{
  "identity_id": "idn_c39e39dd-1030-4c33-b888-5beeb876247d",
  "project_id": "launchpad",
  "wallet_id": "wal_de43139cef869dc9c4…",
  "status": "REGISTERED",
  "wallet_binding_status": "CONFIRMED",
  "erc8004_agent_id": "45",
  "registry_address": "0xb43edfb9c7609cf645e932b2ff20f26f0d4488de",
  "metadata_uri": "https://…/v2-….json",
  "owner_address": "0x5f5802fa78d5ee2a3b4fd67f49cd502430c3e88c",
  "wallet_address": "0xd9dc4f46d9da603a2a077a7190baa85f4e2f05fe",
  "updated_at": "2026-09-08T06:12:51Z"
}
```

You can also look it up using your identifier, avoiding the need to store ours:

```text
GET /v1/agents/by-external-id/{chain_id}/{external_agent_id}
GET /v1/agents/by-erc8004/{chain_id}/{registry_address}/{erc8004_agent_id}
```

All three endpoints return `404` for identities outside your project. “Not yours” and “does not exist” intentionally have identical responses.

### 4.2 Callbacks (webhooks) {#42-callbacks-webhooks}

If you provide `callback_url`, we POST each status change to it:

```text
POST <your callback_url>
Content-Type: application/json
X-Callback-Token: <token agreed during provisioning>
```

`X-Callback-Token` is agreed alongside the API key during project provisioning and configured in the identity service worker. It is **not** a new token issued for each identity creation. Receivers must validate it against the same value provided during provisioning.

```json
{
  "identity_id": "idn_c39e39dd-1030-4c33-b888-5beeb876247d",
  "external_agent_id": "your-agent-id",
  "chain_id": 677,
  "status": "REGISTERED",
  "wallet_binding_status": "CONFIRMED",
  "erc8004_agent_id": "45",
  "registry_address": "0xb43edfb9c7609cf645e932b2ff20f26f0d4488de",
  "metadata_uri": "https://…/v2-….json",
  "updated_at": "2026-09-08T06:12:51Z"
}
```

Follow four receiver rules:

1.  **Validate `X-Callback-Token` first** using a constant-time comparison, then process the body. Skipping validation lets anyone who knows the URL forge status updates.
2.  **Return `2xx` promptly.** All other responses count as failures and are retried. Perform the actual work asynchronously.
3.  **Handle duplicate deliveries.** Retries can deliver the same state multiple times; `identity_id` plus `updated_at` is sufficient as an idempotency key.
4.  **Retries can arrive out of order.** Ignore payloads whose `updated_at` is older than your stored record.

Retry delays are 15 seconds, 1 minute, 5 minutes, then every 15 minutes. **Delivery is never abandoned**: persistently failing endpoints accumulate retries rather than lose status changes. Callbacks optimize polling, not replace it. Even if your endpoint is down for an hour, polling returns the current state immediately.

## 5\. Update metadata {#5-update-metadata}

```text
PUT /v1/agents/identities/{identity_id}/metadata
X-API-Key: ak_…
```

```json
{
  "metadata": { "name": "Example Agent", "description": "Updated description" },
  "idempotency_key": "update-2026-09-08-1"
}
```

This publishes a new version of the registration file and updates the on-chain URI. It returns `202` and `{"identity": …, "replayed": false}`; replaying the same idempotency key returns `200` and `"replayed": true`.

Once accepted, the identity’s `status` returns to `METADATA_PENDING`, then becomes `REGISTERED` after `setAgentURI` is confirmed. Confirm the update by observing `metadata_uri` change or waiting for `status` to return to `REGISTERED`.

`agentId`, `owner`, `walletAddress`, and `registrations` are **not accepted** here. These fields are determined on-chain: the service merges current on-chain values into each new version, so callers cannot publish a file claiming an arbitrary owner or agentId.

### Request wallet binding {#request-wallet-binding}

```text
POST /v1/agents/identities/{identity_id}/wallet-binding
Content-Type: application/json
X-API-Key: ak_…

{ "idempotency_key": "bind-2026-09-08-1" }
```

The body contains **only** an idempotency key. No address or signature is needed: the wallet was determined at identity creation, and our side holding its key generates the on-chain authorization signature.

**Creating an identity does not automatically queue binding.** Call this endpoint after the identity’s `status` becomes `REGISTERED`; calling too early returns `425`. Use it for both initial binding and requeuing binding that remains `PENDING`. Returns `202`, or `200` with `"replayed": true`.

Binding is complete when `wallet_binding_status` becomes `CONFIRMED`.

### Suspend {#suspend}

```text
POST /v1/agents/identities/{identity_id}/suspend
X-API-Key: ak_…
```

Returns `200` and `{"identity": …}`. A suspended identity stops accepting new tasks, including further registration steps, metadata updates, and wallet binding, and `suspended_at` is set. Transactions already broadcast continue toward confirmation.

The on-chain identity is unaffected. Suspension is platform-side state, not an on-chain operation; third parties reading the registry still see a valid identity.

## 6\. Error handling {#6-error-handling}

The error body includes an `error` string. Use the HTTP status to decide whether to retry:

| Status | Meaning | Retry? |
| --- | --- | --- |
| `400` | Malformed request or missing required fields | No. Fix the request |
| `401` | Missing or invalid API key | No |
| `404` | Identity does not exist or belongs to another project | No |
| `409` | Permanent conflict, such as a `wallet_id` already used by another identity | No |
| **`425`** | **Identity has not reached the required state** | **Yes, retry later** |
| `5xx` | Error on our side | Yes, with backoff |

Pay particular attention to `425 Too Early`. The operation is valid, but the identity has not reached the stage that permits it, for example wallet binding requested before registration completes. It looks similar to `409`, but means the opposite: **`409` means stop; `425` means retry later.** Treating `425` as permanent abandons identities that could succeed.

## 7\. Verify an identity on-chain {#7-verify-an-identity-on-chain}

Everything above describes our records through our API. ERC-8004 lets third parties verify key facts without trusting us. If someone asks you to prove an Agent is yours, give them this section.

All calls below are read-only: no private keys, gas, or account required.

### 7.1 Three core reads {#71-three-core-reads}

| What you want to know | Call | Returns |
| --- | --- | --- |
| Who controls this Agent | `ownerOf(uint256 agentId)` | `address` |
| Which wallet it uses | `getAgentWallet(uint256 agentId)` | `address` |
| Where it describes itself | `tokenURI(uint256 agentId)` | `string` |

```js
import { ethers } from 'ethers'

const provider = new ethers.JsonRpcProvider('https://rpc.botchain.ai')
const registry = new ethers.Contract(
  '0xB43Edfb9C7609cF645e932B2fF20f26F0d4488dE',
  [
    'function ownerOf(uint256) view returns (address)',
    'function getAgentWallet(uint256) view returns (address)',
    'function tokenURI(uint256) view returns (string)',
  ],
  provider,
)

const agentId = 45n
console.log(await registry.ownerOf(agentId))        // 0x5f5802fA78d5eE2A3B4fD67F49CD502430C3E88C
console.log(await registry.getAgentWallet(agentId)) // 0xd9DC4F46d9da603A2A077A7190BAa85f4e2f05fe
console.log(await registry.tokenURI(agentId))       // https://…/v2-….json
```

To avoid adding dependencies, use raw JSON-RPC instead:

```bash
# ownerOf(45), selector 0x6352211e, argument padded to 32 bytes
curl -s https://rpc.botchain.ai \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_call","params":[{
        "to":"0xB43Edfb9C7609cF645e932B2fF20f26F0d4488dE",
        "data":"0x6352211e000000000000000000000000000000000000000000000000000000000000002d"
      },"latest"]}'
```

The examples connect to mainnet. For testnet, use `https://rpc.bohr.life` and the `IdentityRegistry` address in section 8; everything else stays the same.

Two behaviors matter:

-   For an unregistered ID, `ownerOf` **reverts** instead of returning the zero address. Treat this revert as “Agent does not exist,” and distinguish it from a network error.
-   `getAgentWallet` **does not check** whether the ID exists. It returns the zero address for both unregistered IDs and registered IDs without wallet binding. Use `ownerOf`, not `getAgentWallet`, to determine existence.

### 7.2 Registration file {#72-registration-file}

`tokenURI` points to JSON in the ERC-8004 registration file format:

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "Example Agent",
  "description": "What this Agent does",
  "owner": "0x5f5802fa78d5ee2a3b4fd67f49cd502430c3e88c",
  "walletAddress": "0xd9dc4f46d9da603a2a077a7190baa85f4e2f05fe",
  "registrations": [
    {
      "agentId": "45",
      "agentRegistry": "eip155:677:0xb43edfb9c7609cf645e932b2ff20f26f0d4488de"
    }
  ]
}
```

**Verify this file instead of trusting it.** A file served from a URL not obtained through `tokenURI` proves nothing. The correct procedure is:

1.  Read `tokenURI(agentId)` from the registry.
2.  Fetch that URL without substituting another.
3.  Check that `registrations[0].agentId` matches the requested ID and `registrations[0].agentRegistry` points to the registry you queried.
4.  Check that `owner` matches `ownerOf` and `walletAddress` matches `getAgentWallet`.

If the file and chain disagree, the chain takes precedence. The registry is authoritative for ownership and wallet binding; the file is a description that should match it.

### 7.3 Values that change over time {#73-values-that-change-over-time}

| Change | On-chain method | Read again |
| --- | --- | --- |
| Metadata update | `setAgentURI` | `tokenURI` |
| Bind or replace wallet | `setAgentWallet` | `getAgentWallet` |
| Unbind wallet | `unsetAgentWallet` | `getAgentWallet` |
| Ownership transfer | `transferFrom` | `ownerOf` |

Because the URI can change, **do not cache registration files indefinitely**. Key the cache by URI and reread `tokenURI` when fresh data is needed.

Wallet binding supports two signature verification methods, allowing either account type:

| Wallet type | Verification |
| --- | --- |
| EOA, including EIP-7702 delegated EOAs | ECDSA |
| Contract wallet (ERC-4337 account, Safe, etc.) | [ERC-1271](https://eips.ethereum.org/EIPS/eip-1271) |

This matters for Agents because their wallets are usually smart accounts rather than EOAs.

## 8\. Environments and contract addresses {#8-environments-and-contract-addresses}

Always call the **proxy** address; implementation contract addresses change on upgrades.

The identity service currently orchestrates only **IdentityRegistry** operations: registration, URI updates, and wallet binding. The Reputation / Validation addresses below are companion ERC-8004 contracts deployed on-chain, but **this service does not currently call them**. Third parties can use them for their own reputation or validation integrations; identity registration itself requires only IdentityRegistry.

### BOT Mainnet (chain ID 677) {#bot-mainnet-chain-id-677}

| Item | Address |
| --- | --- |
| RPC | `https://rpc.botchain.ai` |
| Block explorer | `https://scan.botchain.ai` |
| `IdentityRegistry` | `0xB43Edfb9C7609cF645e932B2fF20f26F0d4488dE` |
| `ReputationRegistry` | `0xB3f7061354193a424856Cc63028cE3556262dAc9` |
| `ValidationRegistry` | `0x85Bf081D1492393C3Fb2742b379b6ADbC7dbC79b` |

### Bohr Testnet (chain ID 968) {#bohr-testnet-chain-id-968}

| Item | Address |
| --- | --- |
| RPC | `https://rpc.bohr.life` |
| Block explorer | `https://scan.bohr.life` |
| `IdentityRegistry` | `0xec8fFbC3c9A34AdDCbB3A14F91db2bd26A8b99c0` |
| `ReputationRegistry` | `0xD4084c9397adca7fD0c24617681a2eA4C286402A` |
| `ValidationRegistry` | `0x0ff64E68C0e5fB2c57E6B3e1D7F3c65FBD0eEA33` |

Agent IDs are scoped to a registry. Mainnet Agent `45` and testnet Agent `45` are unrelated identities. Always pass the chain ID with an agentId; this is why the registration file includes `agentRegistry`.

The registry is a full ERC-721 implementation named `AgentIdentity` (`AGENT`). Query its version with `getVersion()`, not the commonly used `version()`; the current version on both chains is `2.0.0`. NFT-capable wallets and explorers can therefore display Agent identities without adaptation.
