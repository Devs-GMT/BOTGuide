---
title: "EOA Paymaster"
section: "Developers"
source_url: https://dev-docs.botchain.ai/docs/Developers/eoa-paymaster
source: official
last_synced: 2026-10-24
---
# EOA Paymaster

### Overview {#overview}

#### EOA Based Paymaster {#eoa-based-paymaster}

This document introduces a paymaster solution specifically designed for Externally Owned Account (EOA) wallets, differing from the paymaster defined in EIP-4337. With minimal modifications, wallets can integrate this solution to support gas fee sponsorship, significantly enhancing user experience.

#### What is EOA-based Paymaster {#what-is-eoa-based-paymaster}

The paymaster in [EIP-4337](https://github.com/ethereum/ercs/blob/master/ERCS/erc-4337.md) (Account Abstraction via Entry Point Contract Specification) is a crucial component designed to enhance the flexibility and user experience of Ethereum transactions. It allows a third party to pay for a user's transaction fees, removing the need for users to hold ETH to pay for gas.

While EIP-4337 introduced the revolutionary concept of paymasters for smart contract wallets, a significant portion of the Ethereum ecosystem still relies on EOAs. Recognizing this, this presents a groundbreaking paymaster solution specifically designed for EOA wallets. This innovation brings the benefits of transaction sponsorship and enhanced user experience to the broader BOT Chain user base, without requiring a shift to smart contract wallets. The EOA paymaster solution aims to democratize access to sponsored transactions, making blockchain interactions more user-friendly and cost-effective for millions of existing EOA wallet users.

#### How does it Work {#how-does-it-work}

A significant shift occurs in transaction processing:

1.  Validator Role: Validators no longer verify individual transaction gas prices within a block.
    
2.  Transaction Bundling: Private transactions are grouped into bundles and submitted to builders.
    
3.  Prioritization: Builders prioritize based on the aggregate gas price of each bundle.
    
4.  Intra-Bundle Flexibility: Within a single bundle, gas prices can vary, allowing for zero-fee and higher-fee transactions to coexist.
    

This flexibility enables innovative features such as sponsored gas fees and gasless transactions.

##### Definitions

**Bundle**: An ordered array of transactions that execute atomically, ensuring all transactions in the bundle are processed together or not at all.

**Builder**: A new stakeholder in the MEV supply chain responsible for constructing blocks. Builders package transaction bundles, individual transactions from the public txpool, and private transaction order flow into proposed blocks.

**Proposer**: A validator who selects the most profitable block from multiple builders' proposals for inclusion in the blockchain.

**Paymaster**: An infrastructure component that enables transaction sponsorship, allowing self or third parties to cover gas fees.

**Sponsor Policy**: A set of rules defined by the gas sponsor to determine which transactions qualify for sponsorship. This may include criteria such as whitelisted transaction senders or specific transaction types.

##### Overall Workflow

The gas sponsorship process involves several key components and steps:

1.  User Initiation:
    
    -   A user prepares a transaction using any compatible wallet.
        
    -   The wallet sets the gas price to zero for potentially sponsored transactions.
        
2.  Paymaster Submission:
    
    -   The wallet submits the zero-gas-price transaction to the Paymaster.
3.  Sponsor Policy Verification:
    
    -   The Paymaster checks the transaction against existing sponsor policies.
        
    -   Policies may include criteria such as sender/recipient addresses, token types, or transaction limits.
        
4.  Sponsorship Processing:
    
    -   If the transaction is eligible for sponsorship: a. The Paymaster creates a sponsor transaction with a higher gas price. b. The original user transaction and the sponsor transaction are combined into a bundle.
        
    -   If not eligible, the transaction is rejected or returned to the user for normal processing.
        
5.  Bundle Creation and Submission:
    
    -   This bundle is submitted to multiple MEV builders.
6.  Builder Selection and Block Proposal:
    
    -   MEV builders incorporate the bundle into their block proposals.
7.  Blockchain Inclusion:
    
    -   Proposers (validators) select the most profitable block from the builders' proposals.
        
    -   The selected block, containing both the user's original transaction and the sponsor's transaction, is added to the blockchain.
        
    -   This ensures atomic execution of both transactions.
        
8.  Post-Transaction Processing:
    
    -   The Paymaster Manager updates the sponsor's account, deducting the appropriate amount for the sponsored gas.

This solution enables seamless gas sponsorship without requiring significant changes to existing wallet infrastructures. It provides a flexible system that can accommodate various sponsorship models while maintaining the security and integrity of the blockchain network.

### Paymaster Infra {#paymaster-infra}

Ready to enable gasless experiences in your app or wallet? Here's some helpful information on paymaster infrastructure that are available on BOT Chain:

-   [Nodereal](https://docs.nodereal.io/docs/megafuel-overview). The MegaFuel powered by Nodereal is a paymaster implementation based on BOT Chain Paymaster for EOA Wallet. With minimal modifications, wallets can integrate MegaFuel to support gas fee sponsorship, significantly enhancing user experience. At the same time, sponsors can customize their sponsorship on MegaFuel, allowing sponsored users to send gasless transactions.

#### Paymaster API Spec {#paymaster-api-spec}

To facilitate widespread adoption and ensure interoperability across diverse wallet implementations, it is crucial to establish a standardized set of interface specifications for paymasters. This standardization will enable wallet developers to integrate gas sponsorship features efficiently and consistently, regardless of the specific paymaster service they choose to utilize.

#### API Spec {#api-spec}

Paymaster needs to implement a JSON-RPC API called `pm_isSponsorable`, so that it can return sponsor and policy information to wallets. Paymaster also needs to implement `eth_sendRawTransaction` JSON-RPC API. The detailed API Specs are defined as below:

##### pm\_isSponsorable

**Request Parameters**

-   `jsonrpc`: The JSON-RPC protocol version ("2.0").
    
-   `id`: A unique identifier for the request (1 in this example).
    
-   `method`: The method name to be invoked ("pm\_isSponsorable").
    
-   `params`: An array containing a single object with the following fields:
    
    -   `to`: The recipient address of the transaction.
        
    -   `from`: The sender address of the transaction.
        
    -   `value`: The value of the transaction in hexadecimal.
        
    -   `data`: Additional data for the transaction in hexadecimal.
        
    -   `gas`: The gas limit of the transaction in hexadecimal.
        

**Example:**

```plain
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "pm_isSponsorable",
  "params": [
    {
      "to": "0x...", // an address
      "from": "0x...", // an address"value": "0xa1",
      "data": "0x",
      "value": "0x1b4",
      "gas" : "0x101b4"
    }
  ]
}
```

**Response Fields**

-   `jsonrpc`: The JSON-RPC protocol version ("2.0").
    
-   `id`: The unique identifier for the request (1 in this example).
    
-   `result`: An object containing the sponsorship policy details:
    
    -   (Required) `Sponsorable`: A boolean indicating whether the transaction is sponsored (true or false).
        
    -   (Required) `SponsorPolicy`:. The name of the sponsor policy.
        

**Example:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "Sponsorable": true,
    "SponsorPolicy": "a sample policy name"
  }
}
```

##### eth\_sendrawtransaction

The `eth_sendrawtransaction` API implemented by the Paymaster should follow this [Ethereum API Spec](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction). The client can create a new message call transaction or a contract creation for signed transactions via `eth_sendrawtransaction` API.

**Request Parameters**

The `params` should contain the signed transaction data.

**Example:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_sendRawTransaction",
  "params": [
    "0x02f86a6102850df8475800850df84758000a94cd9c02358c223a3e788c0b9d94b98d434c7aa0f18080c080a0bcb0e8ffa344e4b855c6e13ee9e4e5d22cff6ad8bd1145a93b93c5d332100c2ca03765236eba5fbb357e35014fd19ba4b3c6b87f3793bd14dddf7913fc8dcc88bf"
  ]
}
```

**Response Fields**

DATA, 32 Bytes - the transaction hash.

**Example:**

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": "0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331"
}
```

## Wallet Integration {#wallet-integration}

This guide outlines the steps for wallet developers to integrate paymaster services, enabling gas fee sponsorship for their users. By following these standards, wallets can offer seamless, gasless transactions across multiple paymaster providers.

### Interaction Workflow {#interaction-workflow}

[Image: EOA Paymaster interaction workflow between wallet, paymaster, and blockchain]

Integration involves modifying the transaction creation and sending process to interact with paymaster services.

The main steps are:

1.  **Transaction Preparation**:
    
    -   When a user initiates a transaction, first call `gm_sponsorable` to check if it's eligible for sponsorship.
        
    -   If sponsorable, set the transaction's gas price to zero.
        
2.  **User Notification**:
    
    -   Inform the user that the transaction will be gas-free and sponsored by the "policy name" returned by the API.
3.  **Transaction Signing**:
    
    -   Have the user sign the zero-gas-price transaction.
4.  **Submission to Paymaster**:
    
    -   Send the signed transaction to the paymaster using `eth_sendRawTransaction`.
5.  **Response Handling**:
    
    -   Process the paymaster's response:
        
        -   If successful, inform the user that the transaction is submitted.
            
        -   If failed, consider falling back to normal transaction processing or informing the user of the failure.
            
6.  **Transaction Monitoring**:
    
    -   Monitor the transaction status as usual.

### Best Practice {#best-practice}

1.  Always check sponsorability before modifying gas prices.
    
2.  Provide clear user feedback about sponsorship status.
    
3.  Implement proper error handling for cases where sponsorship fails.
    
4.  Consider fallback mechanisms for non-sponsored transactions.
    

## Try Gasless Transaction {#try-gasless-transaction}

### Experience Paymaster in mainstream Wallets {#experience-paymaster-in-mainstream-wallets}

Several mainstream cryptocurrency wallets have already implemented Paymaster integration. This tutorial will guide you through the experience of sending gasless transactions to paymaster integrated wallets.

### Paymaster Integrated Wallets {#paymaster-integrated-wallets}

Wallets with integrated Paymaster functionality offer a seamless experience for users. These wallets automatically detect whether a transaction is eligible for sponsorship. When a transaction qualifies, the wallet sets the gas price to zero without any user intervention.

To illustrate this, we'll walk through the process by transferring stable coin on BOT Chain.
