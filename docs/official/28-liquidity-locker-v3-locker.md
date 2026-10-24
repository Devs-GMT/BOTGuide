---
title: "V3 Locker"
section: "Liquidity Locker"
source_url: https://dev-docs.botchain.ai/docs/Liquidity-Locker/v3-locker
source: official
last_synced: 2026-10-24
---
# V3 Locker

V3 Locker holds ERC721 liquidity positions issued by allowlisted `INonfungiblePositionManager` contracts. The NFT price range cannot change while locked. Authorized accounts can collect fees, and any user can increase liquidity.

`ETERNAL_LOCK` is `type(uint256).max`. A permanent lock cannot be withdrawn or have liquidity removed, but it can be transferred, collect fees, and receive more liquidity.

## Write Functions {#write-functions}

### lock {#lock}

```solidity
function lock(LockParams calldata params)
    external
    payable
    returns (uint256 lockId)
```

Transfers the position NFT into custody, collects fees accrued before locking, applies the selected lock fee, and creates a lock.

| Field | Type | Description |
| --- | --- | --- |
| `params.nftPositionManager` | `INonfungiblePositionManager` | Allowlisted Position Manager. |
| `params.nft_id` | `uint256` | NFT token ID owned and approved by the caller. |
| `params.dustRecipient` | `address` | Recipient of fees accrued before locking. |
| `params.owner` | `address` | Initial lock owner; must be nonzero. |
| `params.additionalCollector` | `address` | Optional additional collector. |
| `params.collectAddress` | `address` | Recipient of net proceeds from automatic collection; must be nonzero. |
| `params.unlockDate` | `uint256` | Future Unix timestamp in seconds, or `ETERNAL_LOCK`. |
| `params.countryCode` | `uint16` | Code accepted by `COUNTRY_LIST`. |
| `params.feeName` | `string` | Named fee option, usually `DEFAULT`; ignored when `r` is nonempty. |
| `params.r` | `bytes[]` | Empty for a named fee; FeeResolver payload for a dynamic fee. |

| Return | Type | Description |
| --- | --- | --- |
| `lockId` | `uint256` | Newly created lock ID. |

**Access / payable:** NFT owner/caller; payable; nonReentrant.

The Position Manager, owner, collection address, date, and country/region must be valid. The caller must approve the NFT. Fees already accrued by the position are first collected to `dustRecipient`, so they are not charged as newly locked liquidity. For a native fixed fee, `msg.value` must match exactly; an ERC20 fixed fee requires allowance. The stored `ucf` is the selected collection-fee rate. The function increments `NONCE` and emits `onLock`.

When `params.r` is nonempty, `FEE_RESOLVER.useFee(params.r, msg.sender)` supplies a dynamic fee. The signed payload binds its nonce, user, chain, and Resolver.

### collect {#collect}

```solidity
function collect(
    uint256 _lockId,
    address _recipient,
    uint128 _amount0Max,
    uint128 _amount1Max
) external returns (
    uint256 amount0,
    uint256 amount1,
    uint256 fee0,
    uint256 fee1
)
```

Collects token0 and token1 fees from a locked position.

| Name | Type | Description |
| --- | --- | --- |
| `_lockId` | `uint256` | Lock whose fees are collected. |
| `_recipient` | `address` | Net-proceeds recipient for normal callers; protocol-fee recipient for the Auto Collector. |
| `_amount0Max` | `uint128` | Maximum token0 amount to collect. |
| `_amount1Max` | `uint128` | Maximum token1 amount to collect. |

| Return | Type | Description |
| --- | --- | --- |
| `amount0` | `uint256` | Net token0 delivered to the user-side recipient. |
| `amount1` | `uint256` | Net token1 delivered to the user-side recipient. |
| `fee0` | `uint256` | Protocol token0 fee. |
| `fee1` | `uint256` | Protocol token1 fee. |

**Access / payable:** lock owner, `additionalCollector`, or `AUTO_COLLECT_ACCOUNT`; nonpayable; nonReentrant.

For a normal caller, protocol fees go to `FEE_ADDR_COLLECT` and net proceeds go to `_recipient`. For `AUTO_COLLECT_ACCOUNT`, fees go to `_recipient` and net proceeds go to the lock's `collectAddress`. If `ucf == 0`, the Position Manager sends all collected tokens directly to `_recipient`, including an Auto Collector call. Treat `AUTO_COLLECT_ACCOUNT` as trusted and avoid zero recipients.

### collectBatchPreview {#collectbatchpreview}

```solidity
function collectBatchPreview(
    uint256[] calldata lockIds,
    address[] calldata recipients,
    uint128[] calldata amount0Maxs,
    uint128[] calldata amount1Maxs
) external
```

Simulates multiple `collect` calls and returns exact results through an intentional revert.

| Name | Type | Description |
| --- | --- | --- |
| `lockIds` | `uint256[]` | Locks to preview. |
| `recipients` | `address[]` | Recipient parameter for each `collect` call. |
| `amount0Maxs` | `uint128[]` | Maximum token0 amount for each lock. |
| `amount1Maxs` | `uint128[]` | Maximum token1 amount for each lock. |

**Access / payable:** each item uses the same authorization as `collect`; nonpayable; nonReentrant.

All arrays must have equal length or the function reverts with `LengthMismatch()`. Call it only through `eth_call`. A successful preview intentionally reverts with:

```solidity
error CollectBatchPreviewResult(CollectPreviewItem[] previews);
```

Each item contains the lock ID, recipient, token addresses, net amounts, and fees. The revert atomically rolls back Position Manager, token, and Locker state. Any other revert indicates a real validation or execution failure. Do not broadcast this function as a transaction.

### increaseLiquidity {#increaseliquidity}

```solidity
function increaseLiquidity(
    uint256 _lockId,
    INonfungiblePositionManager.IncreaseLiquidityParams calldata params
) external payable returns (
    uint128 liquidity,
    uint256 amount0,
    uint256 amount1
)
```

Adds token0 and token1 liquidity to a locked position.

| Name | Type | Description |
| --- | --- | --- |
| `_lockId` | `uint256` | Lock receiving liquidity. |
| `params.tokenId` | `uint256` | Must equal the lock's NFT ID. |
| `params.amount0Desired` | `uint256` | Maximum token0 transferred from the caller. |
| `params.amount1Desired` | `uint256` | Maximum token1 transferred from the caller. |
| `params.amount0Min` | `uint256` | Minimum token0 spent. |
| `params.amount1Min` | `uint256` | Minimum token1 spent. |
| `params.deadline` | `uint256` | Position Manager deadline. |

| Return | Type | Description |
| --- | --- | --- |
| `liquidity` | `uint128` | Liquidity added. |
| `amount0` | `uint256` | Token0 amount used. |
| `amount1` | `uint256` | Token1 amount used. |

**Access / payable:** any caller; payable; nonReentrant.

The caller must approve both tokens. Unused tokens are refunded to the caller and `onIncreaseLiquidity` is emitted. This implementation does not forward `msg.value`; integrations should send zero native tokens. Direct Position Manager interaction may cost less gas when compatible.

### decreaseLiquidity {#decreaseliquidity}

```solidity
function decreaseLiquidity(
    uint256 _lockId,
    INonfungiblePositionManager.DecreaseLiquidityParams calldata params
) external payable returns (uint256 amount0, uint256 amount1)
```

Removes liquidity after a timed lock expires and sends the resulting tokens to the owner.

| Name | Type | Description |
| --- | --- | --- |
| `_lockId` | `uint256` | Lock whose liquidity is reduced. |
| `params.tokenId` | `uint256` | Must equal the lock's NFT ID. |
| `params.liquidity` | `uint128` | Liquidity to remove. |
| `params.amount0Min` | `uint256` | Minimum token0 amount credited. |
| `params.amount1Min` | `uint256` | Minimum token1 amount credited. |
| `params.deadline` | `uint256` | Position Manager deadline. |

| Return | Type | Description |
| --- | --- | --- |
| `amount0` | `uint256` | Token0 amount credited by `decreaseLiquidity`. |
| `amount1` | `uint256` | Token1 amount credited by `decreaseLiquidity`. |

**Access / payable:** lock owner only; payable; nonReentrant.

The lock must be expired and non-permanent. All currently accrued fees are first collected through the Locker fee path; then all tokens owed by the NFT are collected to the caller. This implementation does not forward `msg.value`; send zero. Emits `onDecreaseLiquidity`.

### relock {#relock}

```solidity
function relock(uint256 _lockId, uint256 _unlockDate) external
```

Extends a lock or makes it permanent.

| Name | Type | Description |
| --- | --- | --- |
| `_lockId` | `uint256` | Lock to extend. |
| `_unlockDate` | `uint256` | New timestamp in seconds, or `ETERNAL_LOCK`. |

**Access / payable:** lock owner only; nonpayable; nonReentrant.

The date must exceed both the current `unlockDate` and `block.timestamp`; except for a permanent lock it must be below `10_000_000_000`. A lock can never be shortened. Emits `onRelock`.

### withdraw {#withdraw}

```solidity
function withdraw(uint256 _lockId, address _receiver) external
```

Transfers the complete NFT out of an expired timed lock.

| Name | Type | Description |
| --- | --- | --- |
| `_lockId` | `uint256` | Lock to withdraw. |
| `_receiver` | `address` | NFT recipient. |

**Access / payable:** lock owner only; nonpayable; nonReentrant.

The lock must be expired and non-permanent. If `ucf > 0`, all fees are first collected with `_receiver` as the normal recipient. The NFT is then transferred, user-index and `LOCKS` state are deleted, and `onWithdraw` is emitted. Use a receiver capable of accepting safe ERC721 transfers.

### setAdditionalCollector {#setadditionalcollector}

```solidity
function setAdditionalCollector(
    uint256 _lockId,
    address _additionalCollector
) external
```

Sets the optional account allowed to call `collect`.

| Name | Type | Description |
| --- | --- | --- |
| `_lockId` | `uint256` | Lock to configure. |
| `_additionalCollector` | `address` | Collector address, or the zero address to clear it. |

**Access / payable:** lock owner only; nonpayable; nonReentrant. Updates the lock and emits `onSetAdditionalCollector`.

### setCollectAddress {#setcollectaddress}

```solidity
function setCollectAddress(
    uint256 _lockId,
    address _collectAddress
) external
```

Sets the recipient of net proceeds from automatic collection.

| Name | Type | Description |
| --- | --- | --- |
| `_lockId` | `uint256` | Lock to configure. |
| `_collectAddress` | `address` | Nonzero automatic-collection recipient. |

**Access / payable:** lock owner only; nonpayable; nonReentrant. Emits `onSetCollectAddress`.

### transferLockOwnership {#transferlockownership}

```solidity
function transferLockOwnership(
    uint256 _lockId,
    address _newOwner
) external
```

Starts a two-step lock-ownership transfer.

| Name | Type | Description |
| --- | --- | --- |
| `_lockId` | `uint256` | Lock to transfer. |
| `_newOwner` | `address` | Proposed owner. |

**Access / payable:** lock owner only; nonpayable; nonReentrant.

The new owner must differ from the caller. The contract accepts a zero address, but a zero pending owner cannot accept. A new proposal overwrites an existing pending owner. Emits `onLockOwnershipTransferStarted`.

### acceptLockOwnership {#acceptlockownership}

```solidity
function acceptLockOwnership(
    uint256 _lockId,
    address _collectAddress
) external
```

Accepts a pending transfer and chooses the new automatic-collection address.

| Name | Type | Description |
| --- | --- | --- |
| `_lockId` | `uint256` | Lock to accept. |
| `_collectAddress` | `address` | New stored collection address. |

**Access / payable:** pending owner only; nonpayable; nonReentrant.

User indexes are moved, `pendingOwner` and `additionalCollector` are cleared, and `_collectAddress` is stored. Unlike `setCollectAddress`, this function accepts a zero address, so clients must reject it. Emits `onTransferLockOwnership`.

## Read Functions {#read-functions}

### getLock / LOCKS {#getlock--locks}

```solidity
function getLock(uint256 _lockId)
    external view returns (Lock memory _lock);
function LOCKS(uint256 lockId) external view returns (
    uint256 lock_id,
    INonfungiblePositionManager nftPositionManager,
    address pool,
    uint256 nft_id,
    address owner,
    address pendingOwner,
    address additionalCollector,
    address collectAddress,
    uint256 unlockDate,
    uint16 countryCode,
    uint256 ucf
);
```

Both return the same fields: `getLock` returns a struct and the public mapping getter returns an ABI tuple. Withdrawn or unknown IDs return an all-zero lock.

| Parameter | Description |
| --- | --- |
| `_lockId` / `lockId` | Lock ID to read. |

### getLocksLength / NONCE {#getlockslength--nonce}

```solidity
function getLocksLength() external view returns (uint256);
function NONCE() external view returns (uint256);
```

Both return the next lock ID, including historical withdrawn locks. Neither is the active-lock count.

### User Enumeration {#user-enumeration}

```solidity
function getNumUserLocks(address _user)
    external view returns (uint256);
function getUserLockAtIndex(address _user, uint256 _index)
    external view returns (Lock memory);
```

| Parameter | Description |
| --- | --- |
| `_user` | Owner whose active lock set is queried. |
| `_index` | Zero-based active-set index; an out-of-range access reverts. |

The first returns the active-lock count. The second resolves the indexed ID and returns its lock.

### Fee Queries {#fee-queries}

```solidity
function getFee(string memory _name)
    public view returns (FeeStruct memory);
function getFeeOptionAtIndex(uint256 _index)
    external view returns (FeeStruct memory);
function getFeeOptionLength() external view returns (uint256);
```

| Parameter | Description |
| --- | --- |
| `_name` | Exact fee-option name; an unknown name reverts. |
| `_index` | Zero-based fee-set index; an invalid index reverts. |

`FeeStruct` contains `name`, `lpFee`, `collectFee`, `flatFee`, and `flatFeeToken`. Options can change immediately, so read them just before locking.

### nftPositionManagerIsAllowed {#nftpositionmanagerisallowed}

```solidity
function nftPositionManagerIsAllowed(address _nftPositionManager)
    external view returns (bool);
```

Returns whether the Position Manager may be used by `lock`.

### Public Configuration Getters {#public-configuration-getters}

```solidity
function ETERNAL_LOCK() external view returns (uint256);
function FEE_DENOMINATOR() external view returns (uint256);
function COUNTRY_LIST() external view returns (address);
function FEE_RESOLVER() external view returns (address);
function AUTO_COLLECT_ACCOUNT() external view returns (address);
function FEE_ADDR_LP() external view returns (address);
function FEE_ADDR_COLLECT() external view returns (address);
function owner() external view returns (address);
```

These compiler-generated or inherited getters expose permanent-lock and fee constants, external dependencies, privileged addresses, and two-step contract ownership.

## Events {#events}

### onLock {#onlock}

```solidity
event onLock(uint256 lock_id, address nftPositionManager, uint256 nft_id, address owner, address additionalCollector, address collectAddress, uint256 unlockDate, uint16 countryCode, uint256 collectFee, address poolAddress, INonfungiblePositionManager.Position position);
```

Emitted when `lock` creates a lock. It includes the IDs and accounts, unlock terms, stored `ucf` rate, pool address, and a full Position snapshot.

| Parameter | Description |
| --- | --- |
| `lock_id` | New lock ID. |
| `nftPositionManager` | Position Manager that defines the NFT. |
| `nft_id` | Position NFT ID. |
| `owner` | Initial lock owner. |
| `additionalCollector` | Optional collector. |
| `collectAddress` | Recipient of net automatic-collection proceeds. |
| `unlockDate` | Unlock timestamp or `ETERNAL_LOCK`. |
| `countryCode` | Validated country/region code. |
| `collectFee` | Stored `ucf` rate. |
| `poolAddress` | Factory pool for the position. |
| `position` | Full Position Manager `Position` snapshot. |

### onWithdraw {#onwithdraw}

```solidity
event onWithdraw(uint256 lock_id, address owner, address receiver);
```

Emitted before the withdrawn lock state is deleted.

| Parameter | Description |
| --- | --- |
| `lock_id` | Withdrawn lock. |
| `owner` | Lock owner. |
| `receiver` | NFT recipient. |

### onLockOwnershipTransferStarted {#onlockownershiptransferstarted}

```solidity
event onLockOwnershipTransferStarted(uint256 lockId, address currentOwner, address pendingOwner);
```

Emitted when the current owner proposes a new owner.

| Parameter | Description |
| --- | --- |
| `lockId` | Lock being transferred. |
| `currentOwner` | Current owner. |
| `pendingOwner` | Proposed owner. |

### onTransferLockOwnership {#ontransferlockownership}

```solidity
event onTransferLockOwnership(uint256 lockId, address oldOwner, address newOwner, address newCollectAddress);
```

Emitted when the pending owner accepts the transfer.

| Parameter | Description |
| --- | --- |
| `lockId` | Transferred lock. |
| `oldOwner` | Previous owner. |
| `newOwner` | New owner accepting the transfer. |
| `newCollectAddress` | Collection address supplied during acceptance. |

### onSetAdditionalCollector {#onsetadditionalcollector}

```solidity
event onSetAdditionalCollector(uint256 lockId, address additionalCollector);
```

Emitted when the owner updates the additional collector, which may be zero.

| Parameter | Description |
| --- | --- |
| `lockId` | Updated lock. |
| `additionalCollector` | New collector, which may be the zero address. |

### onSetCollectAddress {#onsetcollectaddress}

```solidity
event onSetCollectAddress(uint256 lockId, address collectAddress);
```

Emitted when the owner updates the nonzero automatic-collection recipient.

| Parameter | Description |
| --- | --- |
| `lockId` | Updated lock. |
| `collectAddress` | New nonzero recipient. |

### onRelock {#onrelock}

```solidity
event onRelock(uint256 lockId, uint256 unlockDate);
```

Emitted after extending a lock.

| Parameter | Description |
| --- | --- |
| `lockId` | Extended lock. |
| `unlockDate` | New unlock timestamp. |

### onIncreaseLiquidity {#onincreaseliquidity}

```solidity
event onIncreaseLiquidity(uint256 lockId);
```

Emitted after adding liquidity through the Locker wrapper.

| Parameter | Description |
| --- | --- |
| `lockId` | Lock whose liquidity increased. |

### onDecreaseLiquidity {#ondecreaseliquidity}

```solidity
event onDecreaseLiquidity(uint256 lockId);
```

Emitted after reducing liquidity from an expired lock through the Locker.

| Parameter | Description |
| --- | --- |
| `lockId` | Lock whose liquidity decreased. |

## Errors {#errors}

### Locker Business Errors {#locker-business-errors}

| Error / Revert | Related functions | Trigger |
| --- | --- | --- |
| `OWNER CANNOT = address(0)` | `lock` | `params.owner` is zero. |
| `COLLECT_ADDR` | `lock`, `setCollectAddress` | `collectAddress` is zero. Note that `acceptLockOwnership` does not perform this check. |
| `MILLISECONDS` | `lock`, `relock` | A normal timestamp is at least `10_000_000_000`, usually indicating milliseconds. |
| `DATE PASSED` | `lock`, `relock` | Unlock time is not later than the current block time. |
| `COUNTRY` | `lock` | `countryCode` fails `COUNTRY_LIST`. |
| `INVALID NFT POSITION MANAGER` | `lock` | Position Manager is not allowlisted. |
| `NOT FOUND` | `lock`, `getFee` | Named fee option does not exist. |
| `FLAT FEE` | `lock` | Native `msg.value` does not exactly match the named fee. |
| `Gas token transfer failed` | `lock`, `adminRefundEth` | Native-token transfer to the fee or refund recipient fails. |
| `OWNER` | `collect`, `collectBatchPreview`, lock-management functions | Caller is not an allowed owner, additional collector, Auto Collector, or pending owner. |
| `NFT ID` | `increaseLiquidity`, `decreaseLiquidity` | `params.tokenId` differs from the stored `nft_id`. |
| `ETERNAL_LOCK` | `decreaseLiquidity`, `withdraw` | Liquidity removal or NFT withdrawal is attempted on a permanent lock. |
| `NOT YET` | `decreaseLiquidity`, `withdraw` | A timed lock has not expired. |
| `DATE` | `relock` | New unlock time is not strictly greater than the current `unlockDate`. |
| `SAME OWNER` | `transferLockOwnership` | `_newOwner` equals the current owner. |
| `L` | `setUCF` | New `_ucf` is not strictly below the lock's current rate. |
| `DEFAULT` | `removeFee` | Removal of the built-in `DEFAULT` option is attempted. |
| `Fee not exists` | `removeFee` | Fee option does not exist. |

### Batch Preview Custom Errors {#batch-preview-custom-errors}

```solidity
error CollectBatchPreviewResult(CollectPreviewItem[] previews);
error LengthMismatch();
```

| Custom Error | Meaning |
| --- | --- |
| `CollectBatchPreviewResult(...)` | Expected success payload for `collectBatchPreview`. Decode `previews` as a result. |
| `LengthMismatch()` | The lengths of `lockIds`, `recipients`, `amount0Maxs`, and `amount1Maxs` differ. |

### External Dependency and Inherited Errors {#external-dependency-and-inherited-errors}

| Error / Revert | Trigger |
| --- | --- |
| `STF` | `TransferHelper.safeTransferFrom` fails, usually because balance or allowance is insufficient. |
| `ST` | `TransferHelper.safeTransfer` fails. |
| `SA` | `TransferHelper.safeApprove` fails. |
| `Ownable: caller is not the owner` | A non-owner calls an administrative function. |
| `ReentrancyGuard: reentrant call` | A nonReentrant function is reentered. |
| `Panic(0x11)` | Solidity arithmetic underflows or overflows. |
