---
title: "EIP-7702"
section: "Account Abstraction"
source_url: https://dev-docs.botchain.ai/docs/Account-Abstraction/eip-7702
source: official
last_synced: 2026-10-24
---
# EIP-7702

BOT Chain Mainnet and Testnet support EIP-7702 type 4 transactions. An existing EOA can sign an authorization that delegates its execution code to a deployed account implementation while retaining the original EOA address, balance, and private-key control.

Two submission paths exist:

-   **Native transaction:** Send a type 4 transaction containing `authorizationList` through the chain RPC.
-   **UserOperation:** The BOT Chain Bundler does not currently support EIP-7702 UserOperations. This path can be implemented with a self-hosted Bundler.

## Native type 4 transactions {#native-type-4-transactions}

The native path does not use EntryPoint or a Bundler. The EOA pays the transaction Gas.

### 1\. Install dependencies {#1-install-dependencies}

```bash
npm install viem
```

### 2\. Create clients {#2-create-clients}

This example uses BOT Chain Testnet:

```typescript
import {
  createPublicClient,
  createWalletClient,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const botTestnet = {
  id: 968,
  name: "BOT Chain Testnet",
  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.bohr.life"],
    },
  },
} as const;

const eoa = privateKeyToAccount("0x...");

const publicClient = createPublicClient({
  chain: botTestnet,
  transport: http("https://rpc.bohr.life"),
});

const walletClient = createWalletClient({
  account: eoa,
  chain: botTestnet,
  transport: http("https://rpc.bohr.life"),
});
```

Never store a private key in frontend source code in production. Use a wallet connector or a protected signing service.

### 3\. Sign the authorization and set the delegation {#3-sign-the-authorization-and-set-the-delegation}

When the EOA is both the authorization signer and the type 4 transaction sender, set `executor: "self"` so that viem handles the relationship between the transaction nonce and authorization nonce correctly.

```typescript
const implementation = "0x..." as const;

const authorization = await walletClient.signAuthorization({
  account: eoa,
  contractAddress: implementation,
  executor: "self",
});

const hash = await walletClient.sendTransaction({
  account: eoa,
  authorizationList: [authorization],
  to: eoa.address,
  data: "0x",
});

await publicClient.waitForTransactionReceipt({ hash });
```

`sendTransaction` constructs and submits an EIP-7702 type 4 transaction.

If the account implementation requires initialization, include the initialization calldata in the same transaction:

```typescript
import { encodeFunctionData } from "viem";

const initializeData = encodeFunctionData({
  abi: accountAbi,
  functionName: "initialize",
  args: [/* initialization arguments */],
});

const hash = await walletClient.sendTransaction({
  account: eoa,
  authorizationList: [authorization],
  to: eoa.address,
  data: initializeData,
});
```

### 4\. Verify the delegation {#4-verify-the-delegation}

```typescript
const code = await publicClient.getCode({
  address: eoa.address,
});

const expectedCode =
  `0xef0100${implementation.slice(2).toLowerCase()}`;

if (code?.toLowerCase() !== expectedCode) {
  throw new Error("EIP-7702 delegation was not applied");
}
```

### 5\. Call the delegated account {#5-call-the-delegated-account}

After delegation, calls still target the EOA address. Encode calldata according to the account implementation's ABI.

```typescript
import { encodeFunctionData } from "viem";

const callData = encodeFunctionData({
  abi: accountAbi,
  functionName: "execute",
  args: [
    target,
    value,
    targetCallData,
  ],
});

const hash = await walletClient.sendTransaction({
  account: eoa,
  to: eoa.address,
  data: callData,
});
```

The business target is `target`. The account implementation remains the previously authorized `implementation` address.
