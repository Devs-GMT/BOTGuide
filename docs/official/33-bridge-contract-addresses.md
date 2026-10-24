---
title: "Contract Addresses"
section: "Bridge"
source_url: https://dev-docs.botchain.ai/docs/Bridge/contract-addresses
source: official
last_synced: 2026-10-24
---
# Contract Addresses

Bridge contracts are deployed on BOT Chain Mainnet (Chain ID: 677) and Testnet (Chain ID: 968). Counterpart contracts are deployed on each supported external network.

### Bridge — BOT Chain Mainnet {#bridge--bot-chain-mainnet}

| Contract | Address | Description |
| --- | --- | --- |
| BridgeRouter | [0xef8DC669ECa13E612b67Ff09478352E85bD6CC53](https://scan.botchain.ai/address/0xef8DC669ECa13E612b67Ff09478352E85bD6CC53) | Entry point for bridge-in / bridge-out requests |
| USDT (BOT Chain) | [0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C](https://scan.botchain.ai/address/0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C) | USDT token contract on BOT Chain |
| Multicall3 | [0x47FA21f684bBAD707A53a0f9BE59F1422F46C265](https://scan.botchain.ai/address/0x47FA21f684bBAD707A53a0f9BE59F1422F46C265) | Batch contract calls |

### Bridge — External Networks {#bridge--external-networks}

| Network | Contract | Address |
| --- | --- | --- |
| Ethereum (1) | BridgeGateway | [0x2945d3aF6f012e49f7421252b5fB57D1bb7E6Edd](https://etherscan.io/address/0x2945d3aF6f012e49f7421252b5fB57D1bb7E6Edd) |
| Ethereum (1) | USDT (ERC-20) | [0xdAC17F958D2ee523a2206206994597C13D831ec7](https://etherscan.io/address/0xdAC17F958D2ee523a2206206994597C13D831ec7) |
| BNB Smart Chain (56) | BridgeGateway | [0x3cd6fB6b0CDdD3610f0f4769AA7Bb686Cd4a4b55](https://bscscan.com/address/0x3cd6fB6b0CDdD3610f0f4769AA7Bb686Cd4a4b55) |
| BNB Smart Chain (56) | USDT (BEP-20) | [0x55d398326f99059fF775485246999027B3197955](https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955) |
| Tron | BridgeGateway | [TGhXbQpjBgC6bDp5jAexzeQPHEXXsx5f35](https://tronscan.org/#/address/TGhXbQpjBgC6bDp5jAexzeQPHEXXsx5f35) |
| Tron | USDT (TRC-20) | [TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t](https://tronscan.org/#/address/TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t) |

### Bridge — BOT Chain Testnet {#bridge--bot-chain-testnet}

| Contract | Address |
| --- | --- |
| BridgeRouter | [0x6239404Aa276ba68486E2Fa40E90CDd36ff8ec3A](https://scan.bohr.life/address/0x6239404Aa276ba68486E2Fa40E90CDd36ff8ec3A) |
| USDT (BOT Chain Testnet) | [0x75edC9335175Fc0552D51D48439F229c10420fe3](https://scan.bohr.life/address/0x75edC9335175Fc0552D51D48439F229c10420fe3) |

### Bridge — External Test Networks {#bridge--external-test-networks}

| Network | Contract | Address |
| --- | --- | --- |
| Ethereum Sepolia (11155111) | BridgeGateway | [0xc83AE6F73e8918750b87DD001E36093A1AB7b272](https://sepolia.etherscan.io/address/0xc83AE6F73e8918750b87DD001E36093A1AB7b272) |
| Ethereum Sepolia (11155111) | USDT (ERC-20) | [0x7B1e05a39adF207a759EAf89E867dBcC1C615130](https://sepolia.etherscan.io/address/0x7B1e05a39adF207a759EAf89E867dBcC1C615130) |
| BNB Smart Chain Testnet (97) | BridgeGateway | [0xbCAA929FdB16f5a7185C96A4Ed0CC4F25ab86E40](https://testnet.bscscan.com/address/0xbCAA929FdB16f5a7185C96A4Ed0CC4F25ab86E40) |
| BNB Smart Chain Testnet (97) | USDT (BEP-20) | [0x5d012516D129Ab3aE7673FE32E5ABFCD9be4d086](https://testnet.bscscan.com/address/0x5d012516D129Ab3aE7673FE32E5ABFCD9be4d086) |
| Tron Nile | BridgeGateway | [TMGhDtUkEhARjd1uYDVssubqH4ivnarfv7](https://nile.tronscan.org/#/address/TMGhDtUkEhARjd1uYDVssubqH4ivnarfv7) |
| Tron Nile | USDT (TRC-20) | [TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf](https://nile.tronscan.org/#/address/TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf) |

The **resource\_id** of the USDT token is the same across all test networks and the mainnet:

```text
0xac589789ed8c9d2c61f17b13369864b5f181e58eba230a6ee4ec4c3e7750cd1d
```

### Bridge Contract Function Example {#bridge-contract-function-example}

| Entrance | Scene | Target chain has been credited |
| --- | --- | --- |
| `deposit(...)` | Ordinary cross-chain | Only transfer the target chain token, such as USDT |
| `depositWithBotGas(...)` | Switch to BOT Chain and wish to include the native BOT currency as Gas | Receive USDT + BOT; the BOT cost will be deducted from the net amount of this USDT deposit. |
