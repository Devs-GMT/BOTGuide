---
title: "Range Converter"
section: "Liquidity Locker"
source_url: https://dev-docs.botchain.ai/docs/Liquidity-Locker/range-converter
source: official
last_synced: 2026-10-24
---
# Range Converter

## FullRangeConvertorV2 {#fullrangeconvertorv2}

`FullRangeConvertorV2` converts a V3 narrow-range position into a full-range position and locks the new position in `BDexV3LiquidityLocker` within the same transaction.

## convertToFullRangeAndLock {#converttofullrangeandlock}

```solidity
function convertToFullRangeAndLock(
    LockParams lockParams,
    SlippageChecks slippageParams
) external payable returns (
    uint256 newLockId,
    uint256 amountLiquidity0,
    uint256 amountLiquidity1,
    uint256 refund0,
    uint256 refund1
);
```

Before calling, the NFT owner must approve `lockParams.nft_id` to `FullRangeConvertorV2`.

### lockParams {#lockparams}

```solidity
struct LockParams {
    INonfungiblePositionManager nftPositionManager;
    uint256 nft_id;
    address dustRecipient;
    address owner;
    address additionalCollector;
    address collectAddress;
    uint256 unlockDate;
    uint16 countryCode;
    string feeName;
    bytes[] r;
}
```

| Parameter | Description |
| --- | --- |
| `nftPositionManager` | Position Manager for the source position NFT (BDEX); it must be allowlisted by the Locker. |
| `nft_id` | ID of the NFT to convert and lock. |
| `dustRecipient` | Receives unused token0/token1 and the initial collection made during locking. |
| `owner` | Owner of the new lock. |
| `additionalCollector` | Optional address allowed to collect fees. |
| `collectAddress` | Recipient used by automatic fee collection; it cannot be the zero address. |
| `unlockDate` | Unlock time in seconds and in the future; use `ETERNAL_LOCK` for a permanent lock. |
| `countryCode` | Country or region code supported by the Locker. |
| `feeName` | Locker fee option name; use `DEFAULT` by default. |
| `r` | Dynamic-fee signature parameters; pass an empty array `[]` when dynamic fees are unused. |

### slippageParams {#slippageparams}

```solidity
struct SlippageChecks {
    uint256 amount0LiquidityMin;
    uint256 amount1LiquidityMin;
    uint256 amount0RefundMin;
    uint256 amount1RefundMin;
}
```

| Parameter | Description |
| --- | --- |
| `amount0LiquidityMin` | Minimum token0 used to mint the full-range NFT. It must be greater than `0` for a narrow-range conversion. |
| `amount1LiquidityMin` | Minimum token1 used to mint the full-range NFT. It must be greater than `0` for a narrow-range conversion. |
| `amount0RefundMin` | Minimum token0 refunded to `dustRecipient` after conversion; usually `0`. |
| `amount1RefundMin` | Minimum token1 refunded to `dustRecipient` after conversion; usually `0`. |

`amount0RefundMin` and `amount1RefundMin` are minimum refund amounts. They do not represent maximum slippage or maximum loss.

### msg.value {#msgvalue}

When the fixed fee selected by `feeName` uses the native token, `msg.value` must exactly equal that option's `flatFee`.

The current Converter cannot pay an ERC20 fixed fee. Do not use an option where `flatFeeToken != address(0)` and `flatFee > 0`.

### Return Values {#return-values}

| Return value | Description |
| --- | --- |
| `newLockId` | ID of the newly created Locker lock. |
| `amountLiquidity0` | Actual token0 amount used for the new full-range liquidity. |
| `amountLiquidity1` | Actual token1 amount used for the new full-range liquidity. |
| `refund0` | Token0 amount refunded to `dustRecipient`. |
| `refund1` | Token1 amount refunded to `dustRecipient`. |

If the source NFT is already full range, the contract skips reminting and locks it directly. In this case, both liquidity amounts and both refund amounts return `0`.

## getRangeAndMaxTick {#getrangeandmaxtick}

```solidity
function getRangeAndMaxTick(
    INonfungiblePositionManager nftPositionManager,
    uint256 nftId
) external view returns (
    bool isFullRange,
    int24 maxTick
);
```

| Parameter or return value | Description |
| --- | --- |
| `nftPositionManager` | Position Manager that owns the NFT. |
| `nftId` | NFT ID to inspect. |
| `isFullRange` | Whether the NFT already represents a full-range position. |
| `maxTick` | Maximum usable tick for the current fee tier. A full range is `[-maxTick, maxTick]`. |

## tickSpacingToMaxTick {#tickspacingtomaxtick}

```solidity
function tickSpacingToMaxTick(
    int24 tickSpacing
) external pure returns (int24 maxTick);
```

| Parameter or return value | Description |
| --- | --- |
| `tickSpacing` | Tick spacing for the pool fee tier. |
| `maxTick` | Maximum usable tick for the spacing. |
