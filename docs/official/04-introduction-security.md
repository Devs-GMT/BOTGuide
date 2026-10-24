---
title: "Security"
section: "Introduction"
source_url: https://dev-docs.botchain.ai/docs/introduction/security
source: official
last_synced: 2026-10-24
---
# Security

Given there are more than ½\*N+1 validators are honest, PoA based networks usually work securely and properly. However, there are still cases where a certain amount Byzantine validators may still manage to attack the network, e.g. through [Clone Attack](https://arxiv.org/pdf/1902.10244.pdf). BOT Chain does introduce Slashing logic to penalize Byzantine validators for double signing or inavailability. This Slashing logic will expose the malicious validators in a very short time and make the "Clone Attack" very hard or extremely non-beneficial to execute.
