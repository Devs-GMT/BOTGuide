---
title: "Fees"
section: "Bridge"
source_url: https://dev-docs.botchain.ai/docs/Bridge/fees
source: official
last_synced: 2026-10-24
---
# Fees

The BOT Chain Bridge uses a simple, fixed fee structure for USDT transfers.

| Direction | Bridge Fee | Notes |
| --- | --- | --- |
| **Bridge In** (into BOT Chain) | Free (0 USDT) | No bridge fee is charged for deposits into BOT Chain |
| **Bridge Out** (out of BOT Chain) | 0.1% (min 1 USDT) | A 0.1% fee (minimum 1 USDT) is deducted from the transfer amount |

-   Bridge In: the recipient receives the full deposited USDT amount (network gas on the source chain still applies).
    
-   Bridge Out: the recipient receives the transfer amount minus the withdrawal fee (0.1%, minimum 1 USDT). The transfer amount must be greater than 10 USDT.
