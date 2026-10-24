---
title: "Fast Finality"
section: "Introduction"
source_url: https://dev-docs.botchain.ai/docs/introduction/fast-finality
source: official
last_synced: 2026-10-24
---
# Fast Finality

Finality is critical for blockchain security, once the block is finalized, it wouldn't be reverted anymore. The fast finality feature is very useful. The users can make sure they get the accurate information from the latest finalized block, then they can decide what to do next instantly.

BOT Chain users are encouraged to wait until receiving blocks sealed by more than ⅔\*N+1 different validators. In that way, the BOT Chain can tolerate less than ⅓\*N Byzantine validators. For example, with 21 validators, if the block time is 3 seconds, the ⅔\*N+1 different validator seals will need a time period of (⅔\*21+1)\*3 = 45 seconds. Any critical applications for BOT Chain may have to wait for ⅔\*N+1 to ensure a relatively secure finality. With the above enhancement by slashing mechanism, ½\*N+1 or even fewer blocks are enough as confirmation for most transactions.

When the feature `Fast Finality` is enabled. The chain will be finalized within two blocks if ⅔\*N or more validators vote normally, otherwise the chain has a fixed number of blocks to reach probabilistic finality as before.
