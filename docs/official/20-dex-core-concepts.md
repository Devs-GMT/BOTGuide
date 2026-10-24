---
title: "Core Concepts"
section: "DEX"
source_url: https://dev-docs.botchain.ai/docs/DEX/core-concepts
source: official
last_synced: 2026-10-24
---
# Core Concepts

### AMM (Automated Market Maker) {#amm-automated-market-maker}

BDEX uses the AMM model to enable permissionless token trading without order books. Liquidity providers deposit token pairs into pools, and traders swap against these pools using deterministic pricing algorithms.

**Two AMM Models Supported:**

| Model | Protocol | Formula | Use Case |
| --- | --- | --- | --- |
| Constant Product | BDEX V2 | x × y = k | Simple, universal, lower gas cost |
| Concentrated Liquidity | BDEX V3 | Liquidity within price ranges | Capital efficient, advanced LP strategies |

### Liquidity Pools {#liquidity-pools}

A liquidity pool holds reserves of two tokens. Anyone can provide liquidity by depositing both tokens in the correct ratio and receive LP tokens (V2) or an NFT position (V3) representing their share.

-   V2 Pools: Each pair has exactly one pool with a flat 0.30% fee
    
-   V3 Pools: Each pair can have multiple pools at different fee tiers (0.05%, 0.30%, 1.00%)
    

### Fee Structure {#fee-structure}

| Item | V2 | V3 |
| --- | --- | --- |
| Swap Fee | 0.30% (fixed) | 0.05% / 0.30% / 1.00% |
| LP Fee Share | 100% to LPs | 100% to LPs (in active range) |

### Slippage & Price Impact {#slippage--price-impact}

Slippage is the difference between the expected output and actual output of a swap. Price impact increases with trade size relative to pool liquidity.

-   Always set `amountOutMin` for V2 or `amountOutMinimum` for V3 and Universal Router flows to protect against excessive slippage
    
-   Recommended slippage tolerance: 0.1% - 1.0% for major pairs, up to 5% for low-liquidity tokens
    
-   Use the Routing API, V3 QuoterV2, or V2 `getAmountsOut` to preview swap results before submitting transactions
    

### Tick & Tick Spacing (V3 Only) {#tick--tick-spacing-v3-only}

In V3, liquidity is placed within price ranges defined by ticks. Available tick spacing depends on the selected fee tier. See the [BDEX V3](https://dev-docs.botchain.ai/docs/DEX/bdex-v3) section for details.
