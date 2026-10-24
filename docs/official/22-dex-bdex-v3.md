---
title: "BDEX V3"
section: "DEX"
source_url: https://dev-docs.botchain.ai/docs/DEX/bdex-v3
source: official
last_synced: 2026-10-24
---
# BDEX V3

BDEX V3 introduces Concentrated Liquidity, allowing LPs to allocate capital within custom price ranges for significantly improved capital efficiency. Based on the Uniswap V3 architecture, adapted for BOT Chain's 0.75s block time and low gas environment.

### Concentrated Liquidity Guide {#concentrated-liquidity-guide}

BDEX V3 uses a concentrated liquidity model. Unlike V2, liquidity is not always distributed across the full price range. Liquidity providers choose a custom price range where their capital is active.

When the market price is inside the selected range, the position earns swap fees. When the market price moves outside the range, the position becomes inactive and no longer earns fees until the price re-enters the range.

**Core contracts:**

| Contract | Purpose |
| --- | --- |
| V3 Factory | Creates and manages V3 pools |
| NonfungiblePositionManager | Creates and manages LP positions as NFTs |
| QuoterV2 | Simulates swap output off-chain |
| Universal Router | Executes swaps across supported protocols |

**Supported fee tiers:**

| Fee Tier | Fee Value | Tick Spacing | Typical Use Case |
| --- | --- | --- | --- |
| 0.05% | 500 | 10 | Stable or highly correlated pairs |
| 0.30% | 3000 | 60 | Most standard pairs |
| 1.00% | 10000 | 200 | High volatility or long-tail assets |

**Creating a V3 pool:**

```solidity
function createPool(
  address tokenA,
  address tokenB,
  uint24 fee
) external returns (address pool);
```

After a pool is created, it must be initialized with the initial price before liquidity can be added.

```solidity
function initialize(uint160 sqrtPriceX96) external;
```

**Adding concentrated liquidity:**

Developers should use `NonfungiblePositionManager.mint` to create a position. The position is represented as an ERC-721 NFT.

```solidity
struct MintParams {
  address token0;
  address token1;
  uint24 fee;
  int24 tickLower;
  int24 tickUpper;
  uint256 amount0Desired;
  uint256 amount1Desired;
  uint256 amount0Min;
  uint256 amount1Min;
  address recipient;
  uint256 deadline;
}

function mint(MintParams calldata params)
  external
  payable
  returns (
    uint256 tokenId,
    uint128 liquidity,
    uint256 amount0,
    uint256 amount1
  );
```

**Integration notes:**

-   Users must approve `NonfungiblePositionManager` to spend both tokens before minting a position.
    
-   `tickLower` and `tickUpper` must match the pool's tick spacing.
    
-   `amount0Min` and `amount1Min` should be set to protect users from slippage.
    
-   The narrower the price range, the higher the capital efficiency, but the higher the chance the position becomes inactive.
    

### Position Management {#position-management}

BDEX V3 LP positions are managed by `NonfungiblePositionManager`. Each position is an NFT with its own token pair, fee tier, price range, liquidity amount, and accumulated fees.

**Common position operations:**

```solidity
function increaseLiquidity(IncreaseLiquidityParams calldata params)
  external
  payable
  returns (uint128 liquidity, uint256 amount0, uint256 amount1);

function decreaseLiquidity(DecreaseLiquidityParams calldata params)
  external
  payable
  returns (uint256 amount0, uint256 amount1);

function collect(CollectParams calldata params)
  external
  payable
  returns (uint256 amount0, uint256 amount1);

function burn(uint256 tokenId) external payable;
```

**Position lifecycle:**

1.  **Mint** — Create a new concentrated liquidity position NFT.
    
2.  **Increase Liquidity** — Add more liquidity to an existing position.
    
3.  **Decrease Liquidity** — Remove part or all of the liquidity from the position.
    
4.  **Collect Fees** — Claim accumulated swap fees.
    
5.  **Burn** — Destroy the NFT after all liquidity and fees have been removed.
    

**Fee collection notes:**

-   V3 fees are not automatically transferred to the LP's wallet.
    
-   LPs must call `collect` to claim accumulated fees.
    
-   Fees only accrue while the position is active, meaning the current pool price is within the selected tick range.
    
-   Removing liquidity does not automatically collect all fees; applications should call `collect` when needed.
