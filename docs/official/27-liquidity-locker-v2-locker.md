---
title: "V2 Locker"
section: "Liquidity Locker"
source_url: https://dev-docs.botchain.ai/docs/Liquidity-Locker/v2-locker
source: official
last_synced: 2026-10-24
---
# V2 Locker

V2 Locker holds ERC20 LP tokens created by the configured BDEX V2 Factory. `ETERNAL_LOCK` is `type(uint256).max`. A permanent lock cannot be withdrawn or shortened, but its amount can be increased, split, or transferred.

## Write Functions {#write-functions}

### lockLPToken {#locklptoken}

```solidity
function lockLPToken(
    address _lpToken,
    uint256 _amount,
    uint256 _unlock_date,
    address payable _referral,
    bool _fee_in_eth,
    address payable _withdrawer,
    uint16 _countryCode
) external payable
```

Transfers LP tokens from the caller, deducts the current fees, and creates a lock.

| Name | Type | Description |
| --- | --- | --- |
| `_lpToken` | `address` | BDEX V2 pair token. |
| `_amount` | `uint256` | LP amount transferred before fees. |
| `_unlock_date` | `uint256` | Unix timestamp in seconds, or `ETERNAL_LOCK`. |
| `_referral` | `address payable` | Eligible referrer, or the zero address. |
| `_fee_in_eth` | `bool` | `true` pays the fixed fee in the native token; `false` uses the secondary token. |
| `_withdrawer` | `address payable` | Initial lock owner. |
| `_countryCode` | `uint16` | Code accepted by `COUNTRY_LIST`. |

**Access / payable:** any caller; payable; nonReentrant.

`_amount` must be nonzero. Except for `ETERNAL_LOCK`, the unlock date must be in the future and below `10_000_000_000`. The country/region and Factory pair must be valid. The caller must supply LP allowance and, when paying with the secondary token, secondary-token allowance. A non-allowlisted native-fee payer must send the exact computed fee. The contract accepts a zero `_withdrawer`, so clients must reject it. Stored `amount` and `initialAmount` are net of the LP fee. The function then increments `NONCE` and emits `onNewLock`.

### relock {#relock}

```solidity
function relock(uint256 _lockID, uint256 _unlock_date) external
```

Extends a lock or converts it into a permanent lock.

| Name | Type | Description |
| --- | --- | --- |
| `_lockID` | `uint256` | Lock to extend. |
| `_unlock_date` | `uint256` | New timestamp in seconds, or `ETERNAL_LOCK`. |

**Access / payable:** lock owner only; nonpayable; nonReentrant.

The new value must exceed the current `unlockDate` and pass the seconds-format check. The contract does not separately require it to exceed `block.timestamp`; clients should require `_unlock_date > max(current unlockDate, current block time)`. The current LP fee is deducted from the entire remaining amount and `onRelock` is emitted. This function has no minimum-received parameter.

### withdraw {#withdraw}

```solidity
function withdraw(uint256 _lockID, uint256 _amount) external
```

Withdraws part or all of an expired timed lock.

| Name | Type | Description |
| --- | --- | --- |
| `_lockID` | `uint256` | Source lock. |
| `_amount` | `uint256` | Amount to withdraw; `type(uint256).max` means all remaining LP. |

**Access / payable:** lock owner only; nonpayable; nonReentrant.

The amount must be nonzero, the lock must be non-permanent, and `unlockDate < block.timestamp` must hold. A full withdrawal removes the ID from the owner's active indexes while retaining the historical `LOCKS` record with amount zero. Emits `onWithdraw`.

### incrementLock {#incrementlock}

```solidity
function incrementLock(uint256 _lockID, uint256 _amount) external
```

Adds LP tokens to an existing lock.

| Name | Type | Description |
| --- | --- | --- |
| `_lockID` | `uint256` | Lock receiving the increment. |
| `_amount` | `uint256` | LP amount supplied before fees. |

**Access / payable:** any caller; nonpayable; nonReentrant.

The function intentionally performs no owner check: contributed LP belongs to the existing lock owner. The amount must be nonzero and approved. Clients should verify `LOCKS(_lockID).lpToken != address(0)`. The net amount after the current LP fee is added to `amount`, but not to `initialAmount`, and `onIncrementLock` is emitted.

### splitLock {#splitlock}

```solidity
function splitLock(uint256 _lockID, uint256 _amount) external payable
```

Moves part of a lock into a new lock with the same owner and terms.

| Name | Type | Description |
| --- | --- | --- |
| `_lockID` | `uint256` | Source lock. |
| `_amount` | `uint256` | Amount assigned to the child lock. |

**Access / payable:** lock owner only; payable; nonReentrant.

The amount must be nonzero and cannot exceed the source balance. Even for an allowlisted account, `msg.value` must equal `gFees.ethFee`. The child inherits `lpToken`, `lockDate`, `unlockDate`, owner, and country/region code; both its `amount` and `initialAmount` equal `_amount`. Emits `onSplitLock` and `onNewLock`.

### transferLockOwnership {#transferlockownership}

```solidity
function transferLockOwnership(
    uint256 _lockID,
    address payable _newOwner
) external
```

Immediately transfers the lock and its active indexes.

| Name | Type | Description |
| --- | --- | --- |
| `_lockID` | `uint256` | Lock to transfer. |
| `_newOwner` | `address payable` | New lock owner. |

**Access / payable:** lock owner only; nonpayable.

The new owner must differ from the caller. This is a one-step transfer with no acceptance call. The contract accepts the zero address, so clients must reject it. Emits `onTransferLockOwnership`.

## Read Functions {#read-functions}

### LOCKS {#locks}

```solidity
function LOCKS(uint256 _lockID) external view returns (
    address lpToken,
    uint256 lockDate,
    uint256 amount,
    uint256 initialAmount,
    uint256 unlockDate,
    uint256 lockID,
    address owner,
    uint16 countryCode
)
```

Public mapping getter for a lock. `amount` is the remaining LP balance and `initialAmount` is the net amount at creation. Unknown IDs return zero values.

### TOKEN\_LOCKS {#token\_locks}

```solidity
function TOKEN_LOCKS(address lpToken, uint256 index)
    external view returns (uint256 lockID)
```

Returns the historical lock ID for an LP token at `index`.

### Token Enumeration {#token-enumeration}

```solidity
function getNumLocksForToken(address _lpToken)
    external view returns (uint256);
function getNumLockedTokens() external view returns (uint256);
function getLockedTokenAtIndex(uint256 _index)
    external view returns (address);
```

| Parameter | Description |
| --- | --- |
| `_lpToken` | LP token whose historical lock count is returned. |
| `_index` | Zero-based global LP-token index; an out-of-range access reverts. |

The global token set is never pruned, and `TOKEN_LOCKS` contains historical IDs.

### User Enumeration {#user-enumeration}

```solidity
function getUserNumLockedTokens(address _user)
    external view returns (uint256);
function getUserLockedTokenAtIndex(address _user, uint256 _index)
    external view returns (address);
function getUserNumLocksForToken(address _user, address _lpToken)
    external view returns (uint256);
function getUserLockForTokenAtIndex(
    address _user,
    address _lpToken,
    uint256 _index
) external view returns (TokenLock memory);
```

| Parameter | Description |
| --- | --- |
| `_user` | Owner whose active indexes are queried. |
| `_lpToken` | LP token within that owner's indexes. |
| `_index` | Zero-based index; an out-of-range access reverts. |

These functions return the active token-set size, a token by index, the active lock count for a token, and a full lock respectively. Fully withdrawn locks are removed.

### Fee Allowlist Queries {#fee-allowlist-queries}

```solidity
function getWhitelistedUsersLength() external view returns (uint256);
function getWhitelistedUserAtIndex(uint256 _index)
    external view returns (address);
function getUserWhitelistStatus(address _user)
    external view returns (bool);
```

These functions return the allowlist length, an address by index, and membership status. An invalid index reverts.

### Public Configuration Getters {#public-configuration-getters}

```solidity
function NONCE() external view returns (uint256);
function ETERNAL_LOCK() external view returns (uint256);
function uniswapFactory() external view returns (address);
function COUNTRY_LIST() external view returns (address);
function owner() external view returns (address);
function gFees() external view returns (
    uint256 ethFee,
    address secondaryFeeToken,
    uint256 secondaryTokenFee,
    uint256 secondaryTokenDiscount,
    uint256 liquidityFee,
    uint256 referralPercent,
    address referralToken,
    uint256 referralHold,
    uint256 referralDiscount
);
```

`NONCE` is the next lock ID, not the active-lock count. Percentage fields use a denominator of `1000` (`10 = 1%`). Fees can change immediately; reread them and simulate immediately before submitting a write transaction.

## Events {#events}

### onNewLock {#onnewlock}

```solidity
event onNewLock(uint256 lockID, address lpToken, address owner, uint256 amount, uint256 lockDate, uint256 unlockDate, uint16 countryCode);
```

Emitted by `lockLPToken` and when `splitLock` creates a child lock. Fields identify the new lock, LP token, owner, stored net amount, creation and unlock times, and validated country/region code.

| Parameter | Description |
| --- | --- |
| `lockID` | New lock ID. |
| `lpToken` | Locked pair token. |
| `owner` | Lock owner. |
| `amount` | Stored net amount. |
| `lockDate` | Creation timestamp. |
| `unlockDate` | Unlock timestamp or `ETERNAL_LOCK`. |
| `countryCode` | Validated country/region code. |

### onRelock {#onrelock}

```solidity
event onRelock(uint256 lockID, address lpToken, address owner, uint256 amountRemainingInLock, uint256 liquidityFee, uint256 unlockDate);
```

Emitted after extending a lock and deducting its fee. `amountRemainingInLock` is the net remainder and `liquidityFee` is the deducted LP fee.

| Parameter | Description |
| --- | --- |
| `lockID` | Extended lock. |
| `lpToken` | Pair token. |
| `owner` | Lock owner. |
| `amountRemainingInLock` | Net remaining amount. |
| `liquidityFee` | Deducted LP fee. |
| `unlockDate` | New unlock time. |

### onWithdraw {#onwithdraw}

```solidity
event onWithdraw(uint256 lockID, address lpToken, address owner, uint256 amountRemainingInLock, uint256 amountRemoved);
```

Emitted after a partial or full withdrawal. `owner` is also the recipient.

| Parameter | Description |
| --- | --- |
| `lockID` | Withdrawn lock. |
| `lpToken` | Pair token. |
| `owner` | Owner and recipient. |
| `amountRemainingInLock` | Remaining LP amount. |
| `amountRemoved` | Transferred LP amount. |

### onIncrementLock {#onincrementlock}

```solidity
event onIncrementLock(uint256 lockID, address lpToken, address owner, address payer, uint256 amountRemainingInLock, uint256 amountAdded, uint256 liquidityFee);
```

Emitted when LP is contributed. `owner` is the beneficiary, `payer` supplies the LP, and `amountAdded` is the net increment.

| Parameter | Description |
| --- | --- |
| `lockID` | Incremented lock. |
| `lpToken` | Pair token. |
| `owner` | Beneficiary owner. |
| `payer` | LP provider. |
| `amountRemainingInLock` | New total remaining amount. |
| `amountAdded` | Net LP amount added. |
| `liquidityFee` | Deducted LP fee. |

### onSplitLock {#onsplitlock}

```solidity
event onSplitLock(uint256 lockID, address lpToken, address owner, uint256 amountRemainingInLock, uint256 amountRemoved);
```

Emitted for the source lock when a child lock is created. `amountRemoved` is the child-lock amount.

| Parameter | Description |
| --- | --- |
| `lockID` | Source lock. |
| `lpToken` | Pair token. |
| `owner` | Owner of both locks. |
| `amountRemainingInLock` | Source-lock amount after the split. |
| `amountRemoved` | Child-lock amount. |

### onTransferLockOwnership {#ontransferlockownership}

```solidity
event onTransferLockOwnership(uint256 lockID, address lpToken, address oldOwner, address newOwner);
```

Emitted when the one-step ownership transfer completes.

| Parameter | Description |
| --- | --- |
| `lockID` | Transferred lock. |
| `lpToken` | Pair token. |
| `oldOwner` | Previous owner. |
| `newOwner` | New owner. |

## Errors {#errors}

The following are the primary reverts in V2 Locker user flows. Match strings exactly. The contract uses the spelling `ZERO WITHDRAWL`.

| Error / Revert | Related functions | Trigger |
| --- | --- | --- |
| `TIMESTAMP INVALID` | `lockLPToken`, `relock` | A normal unlock timestamp is at least `10_000_000_000`, usually indicating milliseconds. |
| `DATE PASSED` | `lockLPToken` | The normal unlock time is not later than the current block time. |
| `INSUFFICIENT` | `lockLPToken` | `_amount == 0`. |
| `COUNTRY` | `lockLPToken` | `_countryCode` fails `COUNTRY_LIST` validation. |
| `NOT UNIV2` | `lockLPToken` | `_lpToken` was not created by the configured BDEX V2 Factory. |
| `INADEQUATE BALANCE` | `lockLPToken` | The referrer does not hold the required `referralHold` amount. |
| `FEE NOT MET` | `lockLPToken`, `splitLock` | `msg.value` does not exactly equal the required native fee. |
| `NOT OWNER` | `relock`, `withdraw`, `splitLock`, `transferLockOwnership` | Caller is not the lock owner. |
| `UNLOCK BEFORE` | `relock` | New unlock time is not strictly greater than the current `unlockDate`. |
| `ZERO WITHDRAWL` | `withdraw` | `_amount == 0`, or the resolved withdrawal amount is zero. |
| `ETERNAL_LOCK` | `withdraw` | A permanent lock is being withdrawn. |
| `NOT YET` | `withdraw` | A timed lock has not expired. |
| `ZERO AMOUNT` | `incrementLock`, `splitLock` | Increment or split amount is zero. |
| `OWNER` | `transferLockOwnership` | `_newOwner` equals the caller. |
| `TransferHelper: APPROVE_FAILED` | Token approval paths | The target ERC20 `approve` call fails or returns `false`. |
| `TransferHelper: TRANSFER_FAILED` | Token transfer paths | The target ERC20 `transfer` call fails or returns `false`. |
| `TransferHelper: TRANSFER_FROM_FAILED` | `lockLPToken`, `incrementLock` | Balance or allowance is insufficient, or `transferFrom` fails. |
| `Panic(0x11)` | `withdraw`, `splitLock`, and other amount arithmetic | The request exceeds the remaining amount, or a fee calculation causes arithmetic to underflow/overflow. |

Administrative functions and reentrancy protection may also return inherited OpenZeppelin errors:

| Error / Revert | Trigger |
| --- | --- |
| `Ownable: caller is not the owner` | A non-owner calls an administrative function. |
| `ReentrancyGuard: reentrant call` | A nonReentrant function is reentered. |

Reverts from the underlying Factory, LP token, referral token, or fee token propagate unchanged. Frontends should preserve the original revert data.
