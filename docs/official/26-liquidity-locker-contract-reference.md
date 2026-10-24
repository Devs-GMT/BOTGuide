---
title: "Contract Reference"
section: "Liquidity Locker"
source_url: https://dev-docs.botchain.ai/docs/Liquidity-Locker/contract-reference
source: official
last_synced: 2026-10-24
---
# Contract Reference

This section maps the user-facing write and read interfaces to their detailed reference pages.

## V2 Locker {#v2-locker}

### Write Functions {#write-functions}

`lockLPToken`, `relock`, `withdraw`, `incrementLock`, `splitLock`, and `transferLockOwnership` are documented in [V2 Locker](https://dev-docs.botchain.ai/docs/Liquidity-Locker/v2-locker#write-functions).

### Read Functions {#read-functions}

Lock records, token and user enumeration, fee-whitelist queries, and public configuration getters are documented in [V2 Locker](https://dev-docs.botchain.ai/docs/Liquidity-Locker/v2-locker#read-functions).

## V3 Locker {#v3-locker}

### Write Functions {#write-functions-1}

`lock`, `collect`, `collectBatchPreview`, liquidity management, relocking, withdrawal, collector settings, and two-step lock ownership transfer are documented in [V3 Locker](https://dev-docs.botchain.ai/docs/Liquidity-Locker/v3-locker#write-functions).

### Read Functions {#read-functions-1}

Lock records, user enumeration, fee queries, Position Manager allowlist status, and public configuration getters are documented in [V3 Locker](https://dev-docs.botchain.ai/docs/Liquidity-Locker/v3-locker#read-functions).

## FullRangeConvertorV2 {#fullrangeconvertorv2}

Use `convertToFullRangeAndLock` to convert a V3 ranged position into a full-range position and lock it atomically. The helper queries are `getRangeAndMaxTick` and `tickSpacingToMaxTick`. See [Range Converter](https://dev-docs.botchain.ai/docs/Liquidity-Locker/range-converter).
