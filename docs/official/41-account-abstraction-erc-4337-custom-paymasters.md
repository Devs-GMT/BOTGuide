---
title: "Custom Paymasters"
section: "Account Abstraction"
source_url: https://dev-docs.botchain.ai/docs/Account-Abstraction/erc-4337/custom-paymasters
source: official
last_synced: 2026-10-24
---
# Custom Paymasters

Developers can deploy a Paymaster compatible with EntryPoint v0.7 to pay Gas for UserOperations that satisfy a custom policy. Developers are responsible for maintaining the custom Paymaster contract, sponsorship service, funds, signature policy, risk controls, and availability.

[Image: Paymaster validation and execution flow]

Reference implementations:

-   [`TokenPaymaster.sol`](https://github.com/eth-infinitism/account-abstraction/blob/releases/v0.7/contracts/samples/TokenPaymaster.sol)
-   [`VerifyingPaymaster.sol`](https://github.com/eth-infinitism/account-abstraction/blob/releases/v0.7/contracts/samples/VerifyingPaymaster.sol)
-   [`LegacyTokenPaymaster.sol`](https://github.com/eth-infinitism/account-abstraction/blob/releases/v0.7/contracts/samples/LegacyTokenPaymaster.sol)

## 1\. IPaymaster API {#1-ipaymaster-api}

```solidity
interface IPaymaster {
    enum PostOpMode {
        opSucceeded,
        opReverted,
        postOpReverted
    }

    function validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external returns (
        bytes memory context,
        uint256 validationData
    );

    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost,
        uint256 actualUserOpFeePerGas
    ) external;
}
```

### 1.1 validatePaymasterUserOp {#11-validatepaymasteruserop}

| Parameter | Description |
| --- | --- |
| `userOp` | Complete PackedUserOperation to sponsor |
| `userOpHash` | UserOperation hash bound to EntryPoint and chainId |
| `maxCost` | Maximum cost calculated from the UserOperation Gas limits and prices |

Return values:

| Field | Description |
| --- | --- |
| `context` | Context passed to `postOp`; empty bytes means that `postOp` is not required |
| `validationData` | Signature validity and time range |

Paymaster `validationData` has the same layout as account validation data:

```text
Low 160 bits: 0 for valid, 1 for signature failure
Next 48 bits: validUntil; 0 means no expiry
High 48 bits: validAfter
```

A Paymaster cannot return an aggregator address. A value other than `0` or `1` in the low 160 bits causes validation to fail.

This method must:

-   Accept calls only from the bound EntryPoint.
-   Validate `paymasterData`, sender, target call, limit, and expiry.
-   Revert or return signature failure for a UserOperation that violates the sponsorship policy.
-   Perform budget and quota checks within `maxCost`.
-   Comply with the Bundler's ERC-7562 storage-access and state-change rules.

### 1.2 postOp {#12-postop}

| Parameter | Description |
| --- | --- |
| `mode` | Whether UserOperation execution succeeded or reverted |
| `context` | Context returned by the validation stage |
| `actualGasCost` | Actual Gas cost incurred before `postOp` is called |
| `actualUserOpFeePerGas` | Actual Gas price paid by this UserOperation |

`PostOpMode` values:

| Value | Description |
| --- | --- |
| `opSucceeded` | Account business call succeeded |
| `opReverted` | Account business call reverted; the Paymaster still pays the Gas |
| `postOpReverted` | Internal EntryPoint cleanup state; it is not passed to the Paymaster as a call argument |

EntryPoint calls `postOp` only when `context` is non-empty. If validation returns a non-empty context, the Paymaster must provide a reliable `postOp`. A `postOp` revert causes the UserOperation to fail, but the Gas already consumed must still be paid.

## 2\. BasePaymaster {#2-basepaymaster}

[`BasePaymaster.sol`](https://github.com/eth-infinitism/account-abstraction/blob/releases/v0.7/contracts/core/BasePaymaster.sol) provides EntryPoint binding, caller validation, and deposit and stake management. A subclass only needs to implement sponsorship-policy logic.

### 2.1 Subclass extension interfaces {#21-subclass-extension-interfaces}

```solidity
function _validatePaymasterUserOp(
    PackedUserOperation calldata userOp,
    bytes32 userOpHash,
    uint256 maxCost
) internal virtual returns (
    bytes memory context,
    uint256 validationData
);

function _postOp(
    PostOpMode mode,
    bytes calldata context,
    uint256 actualGasCost,
    uint256 actualUserOpFeePerGas
) internal virtual;
```

`_validatePaymasterUserOp` is required. Override `_postOp` when validation returns non-empty context; the default BasePaymaster `_postOp` reverts.

### 2.2 Fund-management interfaces {#22-fund-management-interfaces}

```solidity
function entryPoint() external view returns (address);

function deposit() external payable;

function getDeposit() external view returns (uint256);

function withdrawTo(
    address payable withdrawAddress,
    uint256 amount
) external;

function addStake(uint32 unstakeDelaySec) external payable;

function unlockStake() external;

function withdrawStake(
    address payable withdrawAddress
) external;
```

Except for `deposit`, BasePaymaster restricts withdrawal and stake-management methods to the Owner.

## 3\. RPC UserOperation fields {#3-rpc-useroperation-fields}

When using a Paymaster, the RPC UserOperation contains:

| Field | Type | Description |
| --- | --- | --- |
| `paymaster` | address | Paymaster contract address |
| `paymasterVerificationGasLimit` | QUANTITY | Gas limit for Paymaster validation |
| `paymasterPostOpGasLimit` | QUANTITY | Gas limit for Paymaster `postOp` |
| `paymasterData` | DATA | Custom authorization, signature, or policy data |

Both Gas limits must be present in the final submitted object. The Paymaster implementation and sponsorship service define the `paymasterData` format.

Omit all four fields when no Paymaster is used. Do not provide the zero address.

## 4\. paymasterAndData layout {#4-paymasteranddata-layout}

The RPC fields are packed into PackedUserOperation using this layout:

```text
Offset 0, length 20 bytes: paymaster
Offset 20, length 16 bytes: paymasterVerificationGasLimit
Offset 36, length 16 bytes: paymasterPostOpGasLimit
Offset 52 to the end: paymasterData
```

When a Paymaster is used, this field is at least 52 bytes long. When no Paymaster is used, `paymasterAndData` is empty bytes.

## 5\. Deposit and stake {#5-deposit-and-stake}

### 5.1 Deposit {#51-deposit}

The deposit pays actual UserOperation Gas. EntryPoint checks and reserves the required prefund during validation.

| Interface | Description |
| --- | --- |
| `depositTo(paymaster)` | Adds to the Paymaster's Gas deposit |
| `balanceOf(paymaster)` | Queries the available deposit |
| `withdrawTo` | Withdraws the Paymaster's own deposit |

An insufficient deposit produces `AA31 paymaster deposit too low`.

### 5.2 Stake {#52-stake}

Stake supports the Bundler's reputation and denial-of-service protections; it does not directly pay Gas.

| Interface | Description |
| --- | --- |
| `addStake` | Adds stake and sets the unlock delay |
| `unlockStake` | Begins the unlock waiting period |
| `withdrawStake` | Withdraws the stake after the waiting period |

When a Paymaster accesses associated storage or changes certain state during validation, the Bundler may require a minimum stake and unstake delay. Exact thresholds depend on Bundler configuration.

## 6\. Common errors {#6-common-errors}

| Error | Meaning |
| --- | --- |
| `AA31` | Paymaster deposit is insufficient |
| `AA32` | Paymaster `validationData` time range is invalid |
| `AA33` | `validatePaymasterUserOp` reverted |
| `AA34` | Low 160 bits of Paymaster `validationData` are not `0` |
| `AA36` | Paymaster validation exceeded its Gas limit |
| `PostOpReverted` | `postOp` reverted; also inspect the `PostOpRevertReason` event |
| `AA93` | `paymasterAndData` length or layout is invalid |
