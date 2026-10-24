---
title: "EntryPoint"
section: "Account Abstraction"
source_url: https://dev-docs.botchain.ai/docs/Account-Abstraction/erc-4337/entrypoint
source: official
last_synced: 2026-10-24
---
# EntryPoint

This page documents the on-chain interface of the EntryPoint deployed on BOT Chain. When submitting UserOperations directly, the caller must assume the responsibilities of a Bundler.

[Image: EntryPoint validation and execution flow]

## 1\. PackedUserOperation {#1-packeduseroperation}

EntryPoint accepts the following on-chain structure:

```solidity
struct PackedUserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    bytes32 accountGasLimits;
    uint256 preVerificationGas;
    bytes32 gasFees;
    bytes paymasterAndData;
    bytes signature;
}
```

### 1.1 Fields and encoding {#11-fields-and-encoding}

| Field | Meaning | Encoding layout |
| --- | --- | --- |
| `sender` | Smart-account address | `smartAccount(160)` |
| `nonce` | Two-dimensional nonce managed by EntryPoint | `key(192) ‖ sequence(64)` |
| `initCode` | Factory address and calldata used for first deployment | Undeployed: `factory(160) ‖ factoryData(N)`; deployed: `0x` |
| `callData` | Execution data sent to the smart account | `selector(32) ‖ encodedArguments(N)` |
| `accountGasLimits` | Gas limits for account validation and execution | `verificationGasLimit(128) ‖ callGasLimit(128)` |
| `preVerificationGas` | Calldata and bundle overhead outside on-chain validation | `preVerificationGas(256)` |
| `gasFees` | EIP-1559 priority fee and maximum total fee | `maxPriorityFeePerGas(128) ‖ maxFeePerGas(128)` |
| `paymasterAndData` | Optional Paymaster address, Gas limits, and custom data | Used: `paymaster(160) ‖ paymasterVerificationGasLimit(128) ‖ paymasterPostOpGasLimit(128) ‖ paymasterData(N)`; unused: `0x` |
| `signature` | Authorization data validated by the smart account | `accountSignature(N)` |

Numbers in parentheses are bit lengths; `N` denotes a variable length.

## 2\. Execution interfaces {#2-execution-interfaces}

```solidity
function handleOps(
    PackedUserOperation[] calldata ops,
    address payable beneficiary
) external;

function handleAggregatedOps(
    UserOpsPerAggregator[] calldata opsPerAggregator,
    address payable beneficiary
) external;
```

### 2.1 handleOps {#21-handleops}

| Parameter | Description |
| --- | --- |
| `ops` | UserOperations that do not use a signature aggregator |
| `beneficiary` | Address that receives the actual Gas fees for the batch |

EntryPoint validates the entire batch before executing each account's `callData`. A validation error can revert the entire batch. A business-execution revert is recorded through an event and does not necessarily revert the outer transaction.

### 2.2 handleAggregatedOps {#22-handleaggregatedops}

Use this method when accounts return a non-zero signature aggregator. UserOperations are grouped by aggregator, and each group carries an aggregated signature. Use `handleOps` when signature aggregation is not required.

`UserOpsPerAggregator` contains:

| Field | Type | Description |
| --- | --- | --- |
| `userOps` | `PackedUserOperation[]` | Operations handled by the current aggregator |
| `aggregator` | `IAggregator` | Aggregator for the group; only in `handleAggregatedOps`, a zero-address group means that no aggregation is needed |
| `signature` | `bytes` | Aggregated signature for the group |

## 3\. Hash, nonce, and address {#3-hash-nonce-and-address}

```solidity
function getUserOpHash(
    PackedUserOperation calldata userOp
) external view returns (bytes32);

function getNonce(
    address sender,
    uint192 key
) external view returns (uint256 nonce);

function incrementNonce(uint192 key) external;

function getSenderAddress(bytes memory initCode) external;
```

### 3.1 getUserOpHash {#31-getuserophash}

Returns the UserOperation hash that the account must validate. The hash binds:

-   UserOperation content, excluding `signature`
-   Current EntryPoint address
-   Current chainId

Changing any participating field after signing invalidates the signature.

### 3.2 getNonce {#32-getnonce}

Returns the next complete nonce for an account and nonce key:

```text
nonce = uint192 key || uint64 sequence
```

SimpleAccount uses key `0` by default. Do not substitute the Owner EOA transaction nonce or the smart account's `eth_getTransactionCount`.

### 3.3 incrementNonce {#33-incrementnonce}

Allows a caller to advance the sequence for one of its nonce keys. Standard accounts usually rely on EntryPoint to update the nonce after successful validation.

### 3.4 getSenderAddress {#34-getsenderaddress}

Calculates a counterfactual account address from `initCode`. The method always reverts and returns the result through the custom error `SenderAddressResult(address sender)`.

## 4\. Deposit and stake {#4-deposit-and-stake}

```solidity
function getDepositInfo(
    address account
) external view returns (DepositInfo memory info);

function balanceOf(address account)
    external view returns (uint256);

function depositTo(address account) external payable;

function withdrawTo(
    address payable withdrawAddress,
    uint256 withdrawAmount
) external;

function addStake(uint32 unstakeDelaySec) external payable;

function unlockStake() external;

function withdrawStake(
    address payable withdrawAddress
) external;
```

### 4.1 Deposit {#41-deposit}

A deposit is the balance that an account or Paymaster pre-funds in EntryPoint to pay UserOperation Gas.

| Method | Description |
| --- | --- |
| `balanceOf` | Queries an entity's deposit |
| `getDepositInfo` | Queries deposit, stake, and unlock state together |
| `depositTo` | Allows any address to fund the specified entity |
| `withdrawTo` | Withdraws the caller's own deposit |

### 4.2 Stake {#42-stake}

A stake is locked by a Factory, Paymaster, or aggregator to satisfy validation and reputation rules. It is not used directly to pay UserOperation Gas.

| Method | Description |
| --- | --- |
| `addStake` | Adds stake and sets a minimum unlock delay |
| `unlockStake` | Begins the unlock waiting period |
| `withdrawStake` | Withdraws the stake after the waiting period |

Deposit and stake are independent. A stake alone cannot pay Gas, and a deposit alone does not necessarily satisfy the Bundler's stake requirement for entities that access restricted storage.

## 5\. Core events {#5-core-events}

| Event | Key fields | Purpose |
| --- | --- | --- |
| `UserOperationEvent` | userOpHash, sender, paymaster, nonce, success, actualGasCost, actualGasUsed | Determines the final result of each UserOperation |
| `AccountDeployed` | userOpHash, sender, factory, paymaster | Records counterfactual account deployment |
| `UserOperationRevertReason` | userOpHash, sender, nonce, revertReason | Records revert data from the account's business call |
| `PostOpRevertReason` | userOpHash, sender, nonce, revertReason | Records a Paymaster `postOp` revert |
| `UserOperationPrefundTooLow` | userOpHash, sender, nonce | Records insufficient prefund during execution |
| `BeforeExecution` | None | Separates validation-stage and execution-stage events |
| `Deposited` / `Withdrawn` | account, amount | Records deposit changes |
| `StakeLocked` / `StakeUnlocked` / `StakeWithdrawn` | account, stake, time | Records the stake lifecycle |

A successful outer `handleOps` transaction does not mean that every UserOperation succeeded. Use `UserOperationEvent.success` as the result.

## 6\. Core errors {#6-core-errors}

| Error | Description |
| --- | --- |
| `FailedOp(opIndex, reason)` | The specified UserOperation failed during validation or prefunding |
| `FailedOpWithRevert(opIndex, reason, inner)` | Failure with internal revert data from an account, Factory, or Paymaster |
| `PostOpReverted(returnData)` | Paymaster `postOp` reverted |
| `SignatureValidationFailed(aggregator)` | Aggregated signature validation failed |
| `SenderAddressResult(sender)` | Expected result carrier for `getSenderAddress` |
