---
title: "Agent Wallet"
section: "Agent OS"
source_url: https://dev-docs.botchain.ai/docs/Agent-OS/agent-wallet
source: official
last_synced: 2026-10-24
---
# Agent Wallet

Give your AI Agent an account that can initiate transactions without handling private keys.

**In one sentence:** Make one API call to obtain an address for an [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) smart account. We custody the private keys and pay deployment gas; the account pays gas for subsequent transfers.

This chapter is for developers integrating their systems with the BOT Chain Agent Wallet service. It covers creating a wallet, understanding why its address exists before its contract, transferring tokens out, and restricting recipients.

Read this chapter before [Agent Identity](https://dev-docs.botchain.ai/docs/Agent-OS/agent-identity). Identity registration requires an existing wallet.

All paths in this chapter are relative to one of these base URLs:

| Environment | URL |
| --- | --- |
| BOT Mainnet | `https://wallet-api.botchain.ai` |
| Bohr Testnet | `https://wallet-api.bohr.life` |

API keys are bound to an environment. Requests to mainnet with a testnet key are rejected, never silently routed to another environment.

## 1\. Overview {#1-overview}

| Question | Answer |
| --- | --- |
| What do I get? | An ERC-4337 smart account address from which the Agent initiates transactions |
| Must I custody private keys? | No. We store and use them; your system signs nothing |
| Who pays gas? | We pay deployment gas. The Agent needs no balance at creation; the account pays gas for subsequent transfers |
| Can I use the address immediately? | To receive funds, yes. Outgoing transfers require account deployment first |
| How do I transfer funds? | `POST /wallets/{id}/transfers` submits a UserOperation |
| Can I restrict recipients? | Yes, and this is mandatory. The allowlist is checked before execution |
| Which chains are supported? | BOT Mainnet (chain ID `677`) and Bohr Testnet (chain ID `968`) |

Remember:

> The address exists as soon as the wallet is created, but the **contract** at that address is deployed later. Both are expected: an address without code can receive funds.

## 2\. Get credentials {#2-get-credentials}

Wallet and identity services share credentials. Each integrator is a **project** with a project ID and one or more API keys issued by us:

```text
ak_<environment>_k_<key_id>.<secret>
```

Put the entire string, including the dot, in the `X-API-Key` header. **The secret is returned only once at creation and cannot be retrieved later.** Store it in your secrets manager immediately.

Keys are environment-specific; testnet keys do not work on mainnet.

## 3\. Create a wallet {#3-create-a-wallet}

```text
POST /v1/wallets
Content-Type: application/json
X-API-Key: ak_…
```

```json
{
  "external_agent_id": "your-agent-id",
  "chain_id": 677,
  "idempotency_key": "create-agent-42",
  "callback_url": "https://your-service.example/webhooks/wallet"
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `external_agent_id` | Yes | The Agent identifier in your system |
| `chain_id` | Yes | Mainnet `677`, testnet `968` |
| `idempotency_key` | Yes | May also be supplied in the `Idempotency-Key` header |
| `identity_id` | No | Link an existing identity. Usually omitted because identity registration comes next |
| `callback_url` | No | Destination for status-change notifications |

You do **not** supply an owner address or an account address. We generate both and return them. Your system generates nothing, and no key material crosses the boundary.

Returns `202`:

```json
{
  "wallet": {
    "wallet_id": "wal_de43139cef869dc9c42ae3",
    "project_id": "launchpad",
    "external_agent_id": "your-agent-id",
    "chain_id": 677,
    "owner_address": "0x5f5802fA78d5eE2A3B4fD67F49CD502430C3E88C",
    "account_address": "0xd9DC4F46d9da603A2A077A7190BAa85f4e2f05fe",
    "deployment_status": "PREDICTED",
    "status": "ACTIVE",
    "created_at": "2026-09-07T09:37:40Z"
  },
  "replayed": false
}
```

The response contains two addresses that are not interchangeable:

| Field | Meaning |
| --- | --- |
| `account_address` | **The Agent's address.** Send funds here; it is also the on-chain transaction sender |
| `owner_address` | The address controlling the account. Required for identity registration; **do not send funds here** |

Save `wallet_id`; all subsequent endpoints use it.

Read and write responses have different shapes

Write endpoints wrap the object in `wallet`; **read endpoints return the object directly**. After creation, use `response.wallet.account_address`; after `GET`, use `response.account_address`.

Replaying the same idempotency key returns `200`, `"replayed": true`, and the original wallet. Retrying after a timeout therefore does not create a second account.

You can also look up the wallet using your identifier, avoiding the need to store ours:

```text
GET /v1/wallets/{wallet_id}
GET /v1/wallets/by-external-id/{chain_id}/{external_agent_id}
```

Wallets outside your project always return `404`. “Not yours” and “does not exist” have identical responses.

## 4\. The address exists before the contract {#4-the-address-exists-before-the-contract}

The initial `deployment_status` is `PREDICTED`. This is not a transitional state that you simply wait out; it is how ERC-4337 accounts work.

`CREATE2` computes the address from the owner and salt, so it is known in advance and never changes. The contract is deployed there later. Until then:

| Operation | Available in `PREDICTED`? |
| --- | --- |
| Receive native tokens or ERC-20 tokens | **Yes.** Sending funds to an address without code is normal |
| Show the address to users | Yes |
| Transfer tokens out | **No** |

| Status | Meaning |
| --- | --- |
| `PREDICTED` | Address computed; no on-chain contract yet |
| `DEPLOYING` | Deployment submitted; waiting for on-chain inclusion |
| `DEPLOYED` | Contract ready; outgoing transfers are available |

Deployment requires an explicit call

Transfers are rejected unless `deployment_status` is `DEPLOYED`. A transfer **does not** trigger deployment automatically; it only returns `409 WALLET_NOT_READY`. Include deployment in initialization instead of expecting the first payment to trigger it lazily.

```text
POST /v1/wallets/{wallet_id}/deploy
{ "idempotency_key": "deploy-agent-42" }
```

Returns `202` and a UserOperation. Poll the wallet until `deployment_status` becomes `DEPLOYED`; only then will transfers be accepted.

Deployment requires no account balance. We pay the gas.

## 5\. Transfer tokens out {#5-transfer-tokens-out}

```text
POST /v1/wallets/{wallet_id}/transfers
Content-Type: application/json
X-API-Key: ak_…
```

```json
{
  "receiver": "0x1111111111111111111111111111111111111111",
  "token_address": "0x2222222222222222222222222222222222222222",
  "amount": "1000000",
  "request_source": "API",
  "idempotency_key": "payout-2026-09-08-001"
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `receiver` | Yes | Recipient address; must be on this wallet's allowlist |
| `token_address` | Yes | ERC-20 contract address, or the literal `BOT_NATIVE` for native tokens |
| `amount` | Yes | **Smallest units, digits only.** For USDT with 6 decimals, `"1000000"` means 1 USDT |
| `request_source` | Yes | `API`, `CONSOLE`, or `ADMIN`; records the transfer source |
| `idempotency_key` | Yes | Prevents duplicate transfers on retry |

Four cases are rejected immediately:

-   **Do not omit `token_address`.** For native tokens, use the string `BOT_NATIVE`, not an empty value or the zero address.
-   **`amount` accepts digits only.** Decimals and scientific notation are rejected, not rounded: both `"1.5"` and `"1e6"` fail. Floating-point conversion can lose precision and change the amount transferred, so these formats are not accepted.
-   **`request_source` is required** and must be one of the three values above.
-   **The recipient cannot be the wallet's own account address.** A self-transfer executes on-chain and consumes gas without changing the balance, so it is blocked here.

`amount` is a string, not a number. Token quantities can exceed JavaScript's exact numeric range.

Returns `202` and a UserOperation. The transfer has been submitted but is not yet final:

```json
{
  "user_op_hash": "0x…",
  "wallet_id": "wal_de43139cef869dc9c42ae3",
  "chain_id": 677,
  "op_type": "TRANSFER",
  "status": "BUILT",
  "sender": "0xd9DC4F46d9da603A2A077A7190BAa85f4e2f05fe",
  "attempt": 0,
  "created_at": "2026-09-08T07:20:11Z"
}
```

### Track a transfer {#track-a-transfer}

```text
GET /v1/user-operations/{user_op_hash}
```

| Status | Meaning | Terminal? |
| --- | --- | --- |
| `BUILT` | Constructed, not yet signed | No |
| `SIGNED` | Signed, not yet submitted | No |
| `SUBMITTED` | Submitted to the bundler | No |
| `INCLUDED` | Included in a block; receipt not yet confirmed | No |
| `SUCCEEDED` | **Complete.** `tx_hash` and `block_number` are populated | Yes |
| `REVERTED` | On-chain execution failed; gas was consumed | Yes |
| `FAILED` | Never reached the chain; see `last_error` | Yes |

Handle `REVERTED` and `FAILED` differently. `REVERTED` means the transaction reached the chain and failed there, for example due to insufficient balance or rejection by the token contract. `FAILED` means it never reached that step. Retrying `FAILED` with a new idempotency key is reasonable; retrying `REVERTED` without changing anything will revert again.

`attempt` and `last_error` show what the service has already tried for you.

## 6\. Recipient allowlist {#6-recipient-allowlist}

The allowlist is mandatory

Wallets can transfer only to allowlisted addresses. **An empty allowlist means the wallet cannot transfer to any address**, not unrestricted access. Register each recipient before its first transfer or the transfer will be rejected.

This is intentional: the Agent decides when to transfer, so permitted destinations must be fixed in advance rather than inferred from instructions the Agent receives. Validation runs server-side before constructing the operation, so even if your system is fully compromised, an attacker cannot transfer funds to a new address.

```text
POST   /v1/wallets/{wallet_id}/allowlist
GET    /v1/wallets/{wallet_id}/allowlist
DELETE /v1/wallets/{wallet_id}/allowlist/{entry_id}
```

```json
{
  "chain_id": 677,
  "address": "0x1111111111111111111111111111111111111111",
  "label": "Settlement account",
  "allowed_actions": "TRANSFER",
  "created_by": "[email protected]",
  "idempotency_key": "allow-payout-1"
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `chain_id` | Yes | Entries are isolated by chain. An entry on `968` cannot authorize a transfer on `677` |
| `address` | Yes | Recipient address |
| `allowed_actions` | Yes | `TRANSFER`, `PAYMENT`, or `ALL` |
| `created_by` | Yes | Records who approved the address for auditing |
| `label` | No | A recognizable name |
| `idempotency_key` | Yes |  |

Entries match on `(wallet_id, chain_id, address)`, must be `ACTIVE`, and must have `allowed_actions` covering transfers. Rejections explain whether the entry is missing, revoked, or does not permit transfers. These are three different problems requiring different remedies; read the reason instead of simply adding the address again.

Initialization order matters: add recipients before funding the wallet. A funded wallet with no allowlist entries cannot pay anyone.

## 7\. Pause a wallet {#7-pause-a-wallet}

```text
POST /v1/wallets/{wallet_id}/status
{ "status": "PAUSED" }
```

`PAUSED` stops new operations and can be lifted by us. `REVOKED` is permanent.

This endpoint intentionally offers no resume action. Restarting a stopped account is an operational decision, not a mechanical reversal of stopping it. Contact us to resume it.

## 8\. Callbacks (webhooks) {#8-callbacks-webhooks}

If you provide `callback_url`, status changes are delivered via POST with an `X-Callback-Token` header. Follow four receiver rules:

1.  **Validate `X-Callback-Token` first** using a constant-time comparison, then process the body.
2.  **Return `2xx` promptly** and perform the actual work asynchronously.
3.  **Handle duplicate deliveries.** Use the object ID plus `updated_at` as an idempotency key.
4.  **Retries can arrive out of order.** Ignore payloads whose `updated_at` is older than your stored record.

Callbacks optimize polling rather than replace it. If your receiver goes down, polling still returns the current state immediately.

## 9\. Error handling {#9-error-handling}

Error responses include a machine-readable code:

```json
{ "error_code": "WHITELIST_DENIED", "error_message": "…" }
```

Branch on `error_code`, not the error message text.

| HTTP | `error_code` | Meaning | Retry? |
| --- | --- | --- | --- |
| `400` | `INVALID_REQUEST` | Malformed request or field validation failure | No. Fix the request |
| `401` | — | Missing or invalid API key | No |
| `403` | `WHITELIST_DENIED` | No active allowlist entry for the recipient | No. Add the allowlist entry first |
| `403` | `TOKEN_NOT_ALLOWED` | This wallet cannot transfer this token | No |
| `404` | `NOT_FOUND` | Wallet does not exist or belongs to another project | No |
| `409` | `WALLET_NOT_READY` | Not deployed, paused, or revoked | **Depends; see below** |
| `409` | `IDEMPOTENCY_KEY_CONFLICTS` | Same idempotency key used for different content | No |
| `422` | `INSUFFICIENT_BALANCE` | Insufficient balance | No. Fund the wallet first |
| `501` | `NOT_IMPLEMENTED` | Capability not enabled in this environment | No |
| `5xx` | `INTERNAL_ERROR` | Error on our side | Yes, with backoff |

`WALLET_NOT_READY` covers three cases. The `status=` and `deployment=` values in `error_message` identify which:

-   `deployment=PREDICTED` or `DEPLOYING` → **Retry after deployment completes**; this is temporary.
-   `status=PAUSED` → Retry after the wallet resumes.
-   `status=REVOKED` → Permanent failure; do not retry.

Treating every `409` as a permanent conflict incorrectly discards wallets still being deployed.

## 10\. Environments {#10-environments}

| Item | BOT Mainnet | Bohr Testnet |
| --- | --- | --- |
| Chain ID | `677` | `968` |
| RPC | `https://rpc.botchain.ai` | `https://rpc.bohr.life` |
| Block explorer | `https://scan.botchain.ai` | `https://scan.bohr.life` |
| Bundler | `https://bundler.botchain.ai/rpc` | `https://bundler.bohr.life/rpc` |
| EntryPoint | `0x0000000071727De22E5E9d8BAf0edAc6f37da032` | Same as mainnet |
| Account type | Kernel `v0.3.3` | Same as mainnet |

`EntryPoint` is the standard ERC-4337 v0.7 singleton contract, so existing ERC-4337 tooling works with these accounts without modification.

## Next: Identity {#next-identity}

The wallet gives the Agent an account. [Identity](https://dev-docs.botchain.ai/docs/Agent-OS/agent-identity) makes it verifiable: anyone can query the chain directly to see who owns it and which wallet it uses.

Identity registration requires three values from the wallet you just created:

| Identity API field | Source |
| --- | --- |
| `wallet_id` | `wallet.wallet_id` |
| `wallet_address` | `wallet.account_address` |
| `owner_address` | `wallet.owner_address` |
