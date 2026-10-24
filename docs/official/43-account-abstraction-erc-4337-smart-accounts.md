---
title: "Smart Accounts"
section: "Account Abstraction"
source_url: https://dev-docs.botchain.ai/docs/Account-Abstraction/erc-4337/smart-accounts
source: official
last_synced: 2026-10-24
---
# Smart Accounts

SimpleAccount is a minimal single-Owner ECDSA reference implementation. Developers can also implement custom ERC-4337 smart accounts.

The `SimpleAccount implementation` is a shared implementation address used by all account proxies, not the address of a user's account. Each account instance is determined by its Owner and salt.

## 1\. SimpleAccountFactory API {#1-simpleaccountfactory-api}

```solidity
interface ISimpleAccountFactory {
    function accountImplementation()
        external view returns (address);

    function getAddress(
        address owner,
        uint256 salt
    ) external view returns (address);

    function createAccount(
        address owner,
        uint256 salt
    ) external returns (address);
}
```

| Method | Description |
| --- | --- |
| `accountImplementation` | Returns the shared SimpleAccount implementation |
| `getAddress` | Calculates the counterfactual proxy address for an Owner and salt without deploying the account |
| `createAccount` | Creates the proxy when the address has no code; otherwise returns the existing account |

For a first UserOperation, the Factory data consists of the Factory address and ABI-encoded `createAccount(owner, salt)` calldata. EntryPoint requires the Factory to return the same address as the UserOperation `sender` and requires `sender` to contain code after deployment.

## 2\. SimpleAccount API {#2-simpleaccount-api}

```solidity
interface ISimpleAccount {
    function owner() external view returns (address);

    function entryPoint() external view returns (address);

    function getNonce() external view returns (uint256);

    function initialize(address owner) external;

    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external;

    function executeBatch(
        address[] calldata dest,
        uint256[] calldata value,
        bytes[] calldata func
    ) external;

    function getDeposit() external view returns (uint256);

    function addDeposit() external payable;

    function withdrawDepositTo(
        address payable withdrawAddress,
        uint256 amount
    ) external;
}
```

### 2.1 Account state {#21-account-state}

| Method | Description |
| --- | --- |
| `owner` | Current single ECDSA Owner |
| `entryPoint` | EntryPoint bound to the account |
| `getNonce` | Next nonce for key `0` in EntryPoint |
| `initialize` | Initializes the proxy Owner; can only run once |

The Factory initializes the proxy during creation. Do not expose an uninitialized proxy to other callers.

### 2.2 Business execution {#22-business-execution}

| Method | Caller | Behavior |
| --- | --- | --- |
| `execute` | Owner or the bound EntryPoint | Executes one target call and forwards revert data |
| `executeBatch` | Owner or the bound EntryPoint | Atomically executes multiple target calls |

`executeBatch` requires equal destination and calldata array lengths. The value array may be empty, meaning that none of the calls transfers BOT, or it may have the same length as the destination array.

When the Owner calls an execution method directly, it uses a standard on-chain transaction and pays transaction Gas. When EntryPoint calls the method, it uses a UserOperation and settles Gas from the account or Paymaster deposit.

### 2.3 EntryPoint deposit {#23-entrypoint-deposit}

| Method | Description |
| --- | --- |
| `getDeposit` | Queries the account's Gas deposit in EntryPoint |
| `addDeposit` | Adds to the account's EntryPoint deposit |
| `withdrawDepositTo` | Allows the Owner to withdraw the account deposit |

The account's native BOT balance funds transfers and business calls. The EntryPoint deposit pays UserOperation Gas. These balances are independent.

### 2.4 Token reception {#24-token-reception}

SimpleAccount can receive native BOT, ERC-721, and ERC-1155 tokens and implements the corresponding receiver interface detection.

## 3\. SimpleAccount validation behavior {#3-simpleaccount-validation-behavior}

SimpleAccount inherits `BaseAccount.validateUserOp`:

```solidity
function validateUserOp(
    PackedUserOperation calldata userOp,
    bytes32 userOpHash,
    uint256 missingAccountFunds
) external returns (uint256 validationData);
```

| Step | SimpleAccount behavior |
| --- | --- |
| Caller check | Accepts only the bound EntryPoint |
| Signature hash | Applies EIP-191 to `userOpHash` |
| Signature validation | ECDSA recovery must equal the Owner |
| Signature failure | Returns `SIG_VALIDATION_FAILED`, which is `1` |
| Nonce | EntryPoint manages uniqueness; the default key is `0` |
| Prefund | Pays `missingAccountFunds` to EntryPoint |

SimpleAccount does not natively provide multisig, social recovery, Session Keys, Passkeys, or ERC-7579 modules. Implement a custom account when these capabilities are required; do not assume that SimpleAccount has undocumented interfaces.

## 4\. Custom smart accounts {#4-custom-smart-accounts}

Developers can implement `IAccount` from scratch or inherit [`BaseAccount`](https://github.com/eth-infinitism/account-abstraction/blob/releases/v0.7/contracts/core/BaseAccount.sol). Either approach must remain compatible with EntryPoint v0.7 and the Bundler's validation rules.

### 4.1 Required interface {#41-required-interface}

```solidity
interface IAccount {
    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData);
}
```

| Parameter | Description |
| --- | --- |
| `userOp` | Complete PackedUserOperation to validate and execute |
| `userOpHash` | Hash bound to EntryPoint and chainId |
| `missingAccountFunds` | Difference between the account deposit and required prefund |

`validationData` uses this layout:

```text
Low 160 bits: 0 for a valid signature, 1 for an invalid signature, or another value for an aggregator address
Next 48 bits: validUntil; 0 means no expiry
High 48 bits: validAfter
```

### 4.2 Required behavior {#42-required-behavior}

-   Verify that `msg.sender` is the account's trusted EntryPoint.
-   Validate `signature`, the authorization policy, and required account state.
-   Return `1` for a signature mismatch. Other format or policy errors may revert.
-   Apply the account's nonce policy; EntryPoint still updates nonce uniqueness.
-   When no Paymaster is used and the deposit is insufficient, pay `missingAccountFunds`.
-   Avoid violating ERC-7562 opcode, storage-access, and external-call restrictions.
-   Provide deterministic and simulatable validation logic without uncontrolled side effects during estimation.

When inheriting `BaseAccount`, a subclass must provide at least:

-   `entryPoint()`: returns the bound EntryPoint.
-   `_validateSignature(...)`: returns signature and time-range validation data.
-   Optional `_validateNonce(...)`: adds a custom account nonce policy.
-   Optional `_payPrefund(...)`: customizes prefund management.

### 4.3 Execution interface design {#43-execution-interface-design}

An account can define its own `callData` interface for single execution, batch execution, module execution, or layered permissions. By default, EntryPoint sends `userOp.callData` directly to the account.

An account may also implement the optional interface:

```solidity
interface IAccountExecute {
    function executeUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) external;
}
```

When `callData` uses the `executeUserOp` selector, EntryPoint gives the full UserOperation and hash to the account for execution. This interface is optional for an ERC-4337 account.

### 4.4 Factory and deployment {#44-factory-and-deployment}

A custom Factory should:

-   Derive a stable account address from deterministic parameters.
-   Return the deployed account address from its creation method.
-   Put the Factory address in the first 20 bytes of `initCode` for the first UserOperation.
-   Put Factory calldata in the remaining bytes of `initCode`.
-   Ensure the deployment result equals the UserOperation `sender`.
-   Omit Factory fields after the account has been deployed.

The Bundler simulates Factory and account validation. A UserOperation is rejected before entering the mempool if Factory or account behavior violates the rules.
