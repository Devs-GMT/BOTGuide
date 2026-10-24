---
title: "BDEX V2"
section: "DEX"
source_url: https://dev-docs.botchain.ai/docs/DEX/bdex-v2
source: official
last_synced: 2026-10-24
---
# BDEX V2

BDEX V2 is a Constant Product AMM (x × y = k) deployed on BOT Chain, based on the battle-tested Uniswap V2 architecture. It provides a simple and reliable DEX infrastructure for token creators and developers.

### Creating Trading Pairs {#creating-trading-pairs}

BDEX V2 trading pairs are created through the **V2 Factory** contract. A pair is uniquely identified by two token addresses, and each token pair can only have one V2 pair contract.

**Factory method:**

```solidity
function createPair(address tokenA, address tokenB) external returns (address pair);
function getPair(address tokenA, address tokenB) external view returns (address pair);
```

**Basic rules:**

-   `tokenA` and `tokenB` must be different tokens.
    
-   Neither token address can be the zero address.
    
-   If the pair already exists, `createPair` will revert.
    
-   After creation, developers can read the pair address through `getPair(tokenA, tokenB)` or listen to the `PairCreated` event.
    

**Example flow:**

```javascript
const pair = await factory.getPair(tokenA, tokenB)

if (pair === ZERO_ADDRESS) {
  const tx = await factory.createPair(tokenA, tokenB)
  await tx.wait()
}
```

For most frontend integrations, developers do not need to manually create the pair first. Adding initial liquidity through the router can create the pair when needed.

### Adding / Removing Liquidity {#adding--removing-liquidity}

BDEX V2 liquidity is managed through the **V2 Router02** contract. Liquidity providers deposit both tokens into a pair and receive V2 LP tokens. The LP token is the pair contract's ERC-20 token and represents the provider's share of the pool.

**Common methods:**

```solidity
function addLiquidity(
  address tokenA,
  address tokenB,
  uint amountADesired,
  uint amountBDesired,
  uint amountAMin,
  uint amountBMin,
  address to,
  uint deadline
) external returns (uint amountA, uint amountB, uint liquidity);

function removeLiquidity(
  address tokenA,
  address tokenB,
  uint liquidity,
  uint amountAMin,
  uint amountBMin,
  address to,
  uint deadline
) external returns (uint amountA, uint amountB);
```

**Integration notes:**

-   Users must approve the V2 Router02 to spend both ERC-20 tokens before adding liquidity.
    
-   For an existing pool, liquidity should be added according to the current reserve ratio.
    
-   For a new pool, the first liquidity provider defines the initial price by choosing the deposit ratio.
    
-   `amountAMin` and `amountBMin` should be set to protect users from slippage.
    
-   Removing liquidity burns LP tokens and returns the underlying token pair according to the user's pool share.
    

**Native BOT liquidity:**

For pools involving native BOT, use the ETH-style router methods such as `addLiquidityETH` / `removeLiquidityETH`. Internally, native BOT is wrapped as WBOT.

### Token Swap Guide {#token-swap-guide}

BDEX V2 swaps can be executed directly through Router02, but frontend applications are recommended to use the official **Routing API** to get the best route and executable calldata.

**Recommended integration path:**

1.  Call the Routing API `GET /quote`.
    
2.  Read `methodParameters.to`, `methodParameters.calldata`, and `methodParameters.value` from the response.
    
3.  Submit these fields with `eth_sendTransaction`.
    

**Routing API example:**

```http
GET /quote?chainId=677
  &tokenInAddress=0x...
  &tokenOutAddress=0x...
  &amount=1000000000000000000
  &type=exactIn
  &protocols=v2
  &recipient=0x...
  &slippageTolerance=0.5
```

**Direct Router02 methods:**

```solidity
function swapExactTokensForTokens(
  uint amountIn,
  uint amountOutMin,
  address[] calldata path,
  address to,
  uint deadline
) external returns (uint[] memory amounts);

function swapTokensForExactTokens(
  uint amountOut,
  uint amountInMax,
  address[] calldata path,
  address to,
  uint deadline
) external returns (uint[] memory amounts);
```

**Swap fee:**

-   BDEX V2 uses a fixed **0.30%** swap fee.
    
-   The fee is taken from the input token amount.
    
-   The output token is not charged by the pool separately.
    
-   Fees remain in the pool and are distributed to LPs through the pool reserve growth.
    

**Fee-on-transfer tokens:**

Fee-on-transfer tokens should only use V2 routes. V3 liquidity and swap flows may revert for tax tokens. The Routing API automatically detects supported fee-on-transfer cases and restricts routing when needed.
