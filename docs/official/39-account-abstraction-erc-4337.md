---
title: "ERC-4337"
section: "Account Abstraction"
source_url: https://dev-docs.botchain.ai/docs/Account-Abstraction/erc-4337
source: official
last_synced: 2026-10-24
---
# ERC-4337

BOT Chain provides account abstraction infrastructure compatible with EntryPoint v0.7. Developers can use the BOT Chain Bundler, interact directly with EntryPoint, adopt the reference SimpleAccount, or deploy custom smart accounts and Paymasters.

[Image: ERC-4337 transaction flow]

## Before integration: configure a Gas funding source {#before-integration-configure-a-gas-funding-source}

Before sending a UserOperation, prepare sufficient Gas funds using one of these methods:

-   **Fund the EntryPoint deposit:** Call `EntryPoint.depositTo(sender)` to pre-fund Gas for the smart-account address. Query the balance through `EntryPoint.balanceOf(sender)`.
-   **Fund the smart account:** Transfer enough native BOT to the smart-account address. A compatible account implementation can use those funds during validation to cover the amount required by EntryPoint. A custom account must handle `missingAccountFunds` correctly.
-   **Use a Paymaster:** Include Paymaster data in the UserOperation so that the Paymaster pays the Gas. The Paymaster must have a sufficient EntryPoint deposit and meet the Bundler's stake policy.

## Four integration capabilities {#four-integration-capabilities}

### 1\. Integrate through the Bundler — recommended {#1-integrate-through-the-bundler--recommended}

Construct the UserOperation parameters and call the BOT Chain Bundler RPC. The Bundler simulates and packages the operation, then calls EntryPoint. This path is suitable for direct wallet and DApp integrations. See [Bundler RPC](https://dev-docs.botchain.ai/docs/Account-Abstraction/erc-4337/bundler-rpc) for UserOperation construction and RPC methods.

### 2\. Integrate directly with EntryPoint — advanced {#2-integrate-directly-with-entrypoint--advanced}

Use the chain RPC to interact directly with EntryPoint v0.7. This approach is intended for teams that operate their own Bundler or Relayer infrastructure. See [EntryPoint](https://dev-docs.botchain.ai/docs/Account-Abstraction/erc-4337/entrypoint).

### 3\. Use or customize a smart account {#3-use-or-customize-a-smart-account}

Use the SimpleAccount reference implementation or implement a custom ERC-4337 smart account. See [Smart Accounts](https://dev-docs.botchain.ai/docs/Account-Abstraction/erc-4337/smart-accounts) for interfaces and customization guidance.

### 4\. Implement a custom Paymaster — optional {#4-implement-a-custom-paymaster--optional}

Implement a Paymaster compatible with EntryPoint v0.7 to pay Gas for UserOperations that satisfy your policy. See [Custom Paymasters](https://dev-docs.botchain.ai/docs/Account-Abstraction/erc-4337/custom-paymasters).
