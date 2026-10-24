---
title: "Staking and Governance"
section: "Introduction"
source_url: https://dev-docs.botchain.ai/docs/introduction/staking-and-governance
source: official
last_synced: 2026-10-24
---
# Staking and Governance

Proof of Staked Authority brings in decentralization and community involvement. Its core logic can be summarized as the below. You may see similar ideas from other networks, especially Cosmos and EOS.

1.  Token holders, including the validators, can put their tokens "bonded" into the stake. Token holders can delegate their tokens onto any validator or validator candidate, expecting it to become an actual validator, and later they can choose a different validator or candidate to re-delegate their tokens.
    
2.  All validator candidates will be ranked by the number of bonded tokens on them, and the top ones will become the real validators.
    
3.  Validators can share (part of) their blocking reward with their delegators.
    
4.  Validators can suffer from "Slashing", a punishment for their bad behaviors, such as double sign and/or instability.
    
5.  There is an "unbonding period" for validators and delegators so that the system makes sure the tokens remain bonded when bad behaviors are caught, the responsible will get slashed during this period.
