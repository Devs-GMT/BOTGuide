---
title: "Core Concepts"
section: "Bridge"
source_url: https://dev-docs.botchain.ai/docs/Bridge/core-concepts
source: official
last_synced: 2026-10-24
---
# Core Concepts

### Lock & Release (Liquidity Model) {#lock--release-liquidity-model}

Because USDT exists natively on every supported network, the Bridge uses a Lock & Release model backed by USDT liquidity vaults on each chain, rather than minting wrapped tokens.

-   **Bridge In:** USDT is locked in the TokenVault on the source chain, and an equal amount of USDT is released from the BOT Chain vault to the recipient.
    
-   **Bridge Out:** USDT is locked in the BOT Chain vault, and an equal amount (minus the withdrawal fee) is released from the vault on the destination chain.
    

### Validators / Relayers {#validators--relayers}

Cross-chain transfers are secured by a decentralized set of validators. When a deposit is detected on the source chain, validators independently observe the event and produce signed attestations. Once the required signature threshold is reached, a relayer submits the aggregated proof to the destination chain to release the USDT.

-   Validators never take custody of user funds; they only attest to observed events.
    
-   The BridgeValidator contract enforces the signature threshold before releasing USDT.
    

### Confirmations & Finality {#confirmations--finality}

To protect against chain reorganizations, the Bridge waits for a minimum number of block confirmations on the source chain before validators attest to a transfer.

-   BOT Chain: Physical Finality — a transaction is final once included, so confirmations are near-instant.
    
-   External chains (Ethereum, BSC, Tron): the Bridge waits for a network-specific confirmation count before processing.
    

### Security Model {#security-model}

-   Every transfer is uniquely identified by a transferId and can only be claimed once (replay protected).
    
-   Release requires a valid quorum of validator signatures verified on-chain.
    
-   Vault balances are fully backed 1:1 by locked USDT.
    
-   Pausable: the BridgeRouter can be paused by governance in an emergency to protect user funds.
