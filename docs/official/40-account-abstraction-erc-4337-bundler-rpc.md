---
title: "Bundler RPC"
section: "Account Abstraction"
source_url: https://dev-docs.botchain.ai/docs/Account-Abstraction/erc-4337/bundler-rpc
source: official
last_synced: 2026-10-24
---
# Bundler RPC

The BOT Chain Bundler accepts RPC UserOperations, runs simulations, maintains the UserOperation queue, and uses a Relayer to call EntryPoint through a standard transaction. The standard BOT Chain RPC does not provide `eth_sendUserOperation`.

[Image: UserOperation mempool flow]

## 1\. RPC UserOperation v0.7 {#1-rpc-useroperation-v07}

BOT Chain uses EntryPoint v0.7 and is not compatible with the v0.6 field format.

### 1.1 Bundler RPC request structure {#11-bundler-rpc-request-structure}

```json
{
  "sender": "0x...",
  "nonce": "0x...",
  "factory": "0x...",
  "factoryData": "0x...",
  "callData": "0x...",
  "callGasLimit": "0x...",
  "verificationGasLimit": "0x...",
  "preVerificationGas": "0x...",
  "maxFeePerGas": "0x...",
  "maxPriorityFeePerGas": "0x...",
  "paymaster": "0x...",
  "paymasterVerificationGasLimit": "0x...",
  "paymasterPostOpGasLimit": "0x...",
  "paymasterData": "0x...",
  "signature": "0x..."
}
```

### 1.2 Fields {#12-fields}

| Field | Type | Gas estimation | Final submission | Description |
| --- | --- | --- | --- | --- |
| `sender` | address (20-byte, `0x`\-prefixed hexadecimal address) | Required | Required | Smart-account address, including a counterfactual address that has not been deployed |
| `nonce` | QUANTITY (`0x`\-prefixed hexadecimal integer without redundant leading zeros; zero is `0x0`) | Required | Required | Account nonce managed by EntryPoint |
| `factory` | address | Conditional | Conditional | Factory used for the account's first deployment |
| `factoryData` | DATA (even-length, `0x`\-prefixed hexadecimal bytes; empty is `0x`) | Conditional | Conditional | Calldata for the Factory to create the account |
| `callData` | DATA | Required | Required | Business execution data sent to the smart account |
| `callGasLimit` | QUANTITY | May be omitted or temporary | Required | Gas limit for account execution |
| `verificationGasLimit` | QUANTITY | May be omitted or temporary | Required | Gas limit for Factory and account validation |
| `preVerificationGas` | QUANTITY | May be omitted or temporary | Required | Fixed calldata and bundle overhead |
| `maxFeePerGas` | QUANTITY | Optional | Required | Maximum total Gas price |
| `maxPriorityFeePerGas` | QUANTITY | Optional | Required | Maximum priority fee |
| `paymaster` | address | Conditional | Conditional | Paymaster that pays the Gas |
| `paymasterVerificationGasLimit` | QUANTITY | Conditional | Conditional | Gas limit for Paymaster validation |
| `paymasterPostOpGasLimit` | QUANTITY | Conditional | Conditional | Gas limit for Paymaster `postOp` |
| `paymasterData` | DATA | Optional | Optional | Custom Paymaster authorization or policy data |
| `signature` | DATA | Required; a placeholder may be used | Required; real authorization | Interpreted and validated by the `sender` account |

## 2\. Construct a UserOperation {#2-construct-a-useroperation}

The following TypeScript snippets can be combined and run in order. The example uses BOT Chain Testnet, SimpleAccount, and no Paymaster. Install `viem` first:

```bash
npm install viem
```

Shared configuration and the RPC helper:

```typescript
import {
  createPublicClient,
  encodeFunctionData,
  http,
  parseAbi,
  toHex,
  type Hex,
} from "viem";
import { getUserOperationHash } from "viem/account-abstraction";
import { privateKeyToAccount } from "viem/accounts";

const CHAIN_ID = 968;
const RPC_URL = "https://rpc.bohr.life";
const BUNDLER_URL = "https://bundler.bohr.life/rpc/";
const ENTRY_POINT = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";
const FACTORY = "0xBC88d6012b3bf8426C2851d3798cEB5257658332";

const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY;
if (!ownerPrivateKey) throw new Error("OWNER_PRIVATE_KEY is required");

const owner = privateKeyToAccount(ownerPrivateKey as Hex);
const publicClient = createPublicClient({ transport: http(RPC_URL) });

const factoryAbi = parseAbi([
  "function getAddress(address owner, uint256 salt) view returns (address)",
  "function createAccount(address owner, uint256 salt) returns (address)",
]);
const entryPointAbi = parseAbi([
  "function getNonce(address sender, uint192 key) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
]);
const simpleAccountAbi = parseAbi([
  "function execute(address dest, uint256 value, bytes func)",
]);

async function bundlerRpc<T>(
  method: string,
  params: unknown[] = [],
): Promise<T> {
  const response = await fetch(BUNDLER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  const payload = (await response.json()) as {
    result?: T;
    error?: {
      code: number;
      message: string;
      data?: unknown;
    };
  };

  if (!response.ok || payload.error) {
    const errorMessage = payload.error
      ? `${payload.error.code}: ${payload.error.message}`
      : `HTTP ${response.status}`;

    throw new Error(errorMessage);
  }

  if (payload.result === undefined) {
    throw new Error(`Bundler returned no result for ${method}`);
  }

  return payload.result;
}
```

The example reads the Owner private key from an environment variable and is only suitable for server-side or local testing. Browser applications should use an account supplied by a wallet and must never embed private keys in frontend code.

### 2.1 Determine sender {#21-determine-sender}

`sender` is the smart-account address, not the Owner EOA.

-   SimpleAccount derives it through `SimpleAccountFactory.getAddress(owner, salt)`.
-   A custom account follows its own Factory or deployment rules.
-   Use the chain RPC method `eth_getCode` to determine whether `sender` has already been deployed.

```typescript
const salt = 0n;

const sender = await publicClient.readContract({
  address: FACTORY,
  abi: factoryAbi,
  functionName: "getAddress",
  args: [owner.address, salt],
});

const accountCode = await publicClient.getCode({ address: sender });
const accountDeployed = accountCode !== undefined && accountCode !== "0x";
```

### 2.2 Set the Factory fields {#22-set-the-factory-fields}

| Account state | `factory` | `factoryData` |
| --- | --- | --- |
| Not deployed | Provide the Factory address | Provide ABI-encoded account-creation calldata |
| Already deployed | Omit | Omit |

For BOT Chain SimpleAccount, `factoryData` encodes `createAccount(owner, salt)`. Supplying Factory fields for an already deployed account triggers `AA10 sender already constructed`.

```typescript
const factoryFields = accountDeployed
  ? {}
  : {
      factory: FACTORY,
      factoryData: encodeFunctionData({
        abi: factoryAbi,
        functionName: "createAccount",
        args: [owner.address, salt],
      }),
    };
```

### 2.3 Read the nonce {#23-read-the-nonce}

Read the nonce from EntryPoint through `getNonce(sender, key)`:

```text
High 192 bits: nonce key
Low 64 bits: sequence for that key
```

BOT Chain SimpleAccount uses key `0` by default. Do not substitute the Owner EOA transaction nonce, the smart account's `eth_getTransactionCount`, or a local counter that is not synchronized with EntryPoint.

```typescript
const nonce = await publicClient.readContract({
  address: ENTRY_POINT,
  abi: entryPointAbi,
  functionName: "getNonce",
  args: [sender, 0n],
});
```

### 2.4 Generate callData {#24-generate-calldata}

The smart-account implementation defines `callData`:

-   BOT Chain SimpleAccount uses `execute` or `executeBatch`.
-   A custom account uses its own public execution interface.
-   `callData` must comply with the authorization policy enforced by the account in `validateUserOp`.

```typescript
// This example uses a call with no value and empty calldata to demonstrate encoding.
// Replace these values with the business contract, transfer value, and calldata.
const target = owner.address;
const targetValue = 0n;
const targetCallData = "0x";

const callData = encodeFunctionData({
  abi: simpleAccountAbi,
  functionName: "execute",
  args: [target, targetValue, targetCallData],
});
```

### 2.5 Choose the Gas payer {#25-choose-the-gas-payer}

| Scenario | Fields and funding requirements |
| --- | --- |
| No Paymaster | Omit all Paymaster fields and ensure the account deposit is sufficient |
| With a Paymaster | Provide the Paymaster address, both Paymaster Gas limits, and the implementation-specific data |

Do not provide the zero address when a Paymaster is not used. BOT Chain does not provide a public Paymaster, but developers can deploy their own.

This example does not use a Paymaster. Before estimation, it checks the EntryPoint deposit and the account's native-token balance:

```typescript
const [entryPointDeposit, senderBalance] = await Promise.all([
  publicClient.readContract({
    address: ENTRY_POINT,
    abi: entryPointAbi,
    functionName: "balanceOf",
    args: [sender],
  }),
  publicClient.getBalance({ address: sender }),
]);

if (entryPointDeposit === 0n && senderBalance === 0n) {
  throw new Error(
    "Fund the sender or deposit funds for it in EntryPoint before estimating",
  );
}
```

### 2.6 Construct the UserOperation for estimation {#26-construct-the-useroperation-for-estimation}

This object is the `userOp` argument of `eth_estimateUserOperationGas(userOp, entryPoint)`. It is used only for Bundler simulation and Gas estimation; it does not send a transaction.

| Field group | Estimation stage |
| --- | --- |
| sender, nonce, callData | Use final values |
| factory, factoryData | Provide or omit according to deployment state |
| Paymaster fields | Provide or omit according to the sponsorship mode |
| Three Gas limits | May be omitted, zero, or temporary |
| Gas prices | Optional; the Bundler returns suggested values |
| signature | Use a placeholder with a format and length suitable for account validation |

The current Skandha implementation accepts empty DATA (`0x`) and substitutes an internal placeholder during estimation. When an explicit placeholder with the same length as the final signature is required, BOT Chain SimpleAccount can use this 65-byte placeholder:

```text
0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c
```

The placeholder is only for Gas estimation and cannot be used in the final submission.

```typescript
const DUMMY_SIGNATURE =
  "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";

const gasPrice = await bundlerRpc<{
  maxFeePerGas: Hex;
  maxPriorityFeePerGas: Hex;
}>("skandha_getGasPrice");

const estimateUserOperation = {
  sender,
  nonce: toHex(nonce),
  ...factoryFields,
  callData,
  callGasLimit: "0x0",
  verificationGasLimit: "0x0",
  preVerificationGas: "0x0",
  maxFeePerGas: gasPrice.maxFeePerGas,
  maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
  signature: DUMMY_SIGNATURE,
};
```

### 2.7 Apply the Gas estimate {#27-apply-the-gas-estimate}

After `eth_estimateUserOperationGas` returns, copy these values into the final UserOperation:

-   `callGasLimit`
-   `verificationGasLimit`
-   `preVerificationGas`
-   `maxFeePerGas`
-   `maxPriorityFeePerGas`
-   Both Paymaster Gas limits when using a Paymaster

After applying the estimate, all final fields except `signature` should remain unchanged.

```typescript
type UserOperationGasEstimate = {
  callGasLimit: Hex;
  verificationGasLimit?: Hex;
  verificationGas?: Hex;
  preVerificationGas: Hex;
  maxFeePerGas?: Hex;
  maxPriorityFeePerGas?: Hex;
};

const gasEstimate = await bundlerRpc<UserOperationGasEstimate>(
  "eth_estimateUserOperationGas",
  [estimateUserOperation, ENTRY_POINT],
);

const verificationGasLimit =
  gasEstimate.verificationGasLimit ?? gasEstimate.verificationGas;
if (!verificationGasLimit) {
  throw new Error("Bundler did not return verificationGasLimit");
}

const finalUserOperation = {
  ...estimateUserOperation,
  callGasLimit: gasEstimate.callGasLimit,
  verificationGasLimit,
  preVerificationGas: gasEstimate.preVerificationGas,
  maxFeePerGas: gasEstimate.maxFeePerGas ?? gasPrice.maxFeePerGas,
  maxPriorityFeePerGas:
    gasEstimate.maxPriorityFeePerGas ?? gasPrice.maxPriorityFeePerGas,
};
```

### 2.8 Calculate userOpHash {#28-calculate-userophash}

The function accepts the unpacked Bundler RPC form of a UserOperation, but QUANTITY fields must first be converted to `bigint`:

```typescript
const sdkUserOperation = {
  ...finalUserOperation,
  nonce: BigInt(finalUserOperation.nonce),
  callGasLimit: BigInt(finalUserOperation.callGasLimit),
  verificationGasLimit: BigInt(finalUserOperation.verificationGasLimit),
  preVerificationGas: BigInt(finalUserOperation.preVerificationGas),
  maxFeePerGas: BigInt(finalUserOperation.maxFeePerGas),
  maxPriorityFeePerGas: BigInt(finalUserOperation.maxPriorityFeePerGas),
};

const userOpHash = getUserOperationHash({
  userOperation: sdkUserOperation,
  entryPointAddress: ENTRY_POINT,
  entryPointVersion: "0.7",
  chainId: CHAIN_ID,
});
```

This function performs a pure off-chain calculation. `entryPointAddress`, `entryPointVersion`, and `chainId` all contribute to the final hash and must match the target network. `signature` does not contribute to the hash, so the placeholder can remain at this stage.

### 2.9 Obtain the final signature {#29-obtain-the-final-signature}

Use an account wallet, SDK, or signing service to sign `userOpHash` and produce the final `signature`.

-   BOT Chain SimpleAccount requires the Owner to sign the UserOperation hash with EIP-191 ECDSA.
-   A custom account may use multisig, Session Keys, aggregated signatures, or another validation scheme.

The real signature must match the implementation of `sender.validateUserOp`. Do not change any hash-participating field after signing.

```typescript
const signature = await owner.signMessage({
  message: { raw: userOpHash },
});

const signedUserOperation = {
  ...finalUserOperation,
  signature,
};
```

### 2.10 Submit and query the result {#210-submit-and-query-the-result}

Submit the final RPC UserOperation through `eth_sendUserOperation`. The Bundler returns a userOpHash. The application then polls the query methods to track the bundle transaction and execution receipt.

```typescript
const submittedUserOpHash = await bundlerRpc<Hex>(
  "eth_sendUserOperation",
  [signedUserOperation, ENTRY_POINT],
);

if (submittedUserOpHash.toLowerCase() !== userOpHash.toLowerCase()) {
  throw new Error("Bundler returned an unexpected userOpHash");
}

type UserOperationReceipt = {
  success: boolean;
  receipt: { transactionHash: Hex };
};

let userOperationReceipt: UserOperationReceipt | null = null;
for (let attempt = 0; attempt < 60 && !userOperationReceipt; attempt++) {
  userOperationReceipt = await bundlerRpc<UserOperationReceipt | null>(
    "eth_getUserOperationReceipt",
    [submittedUserOpHash],
  );
  if (!userOperationReceipt) {
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
}

if (!userOperationReceipt) {
  throw new Error("Timed out waiting for UserOperation receipt");
}

console.log({
  userOpHash: submittedUserOpHash,
  transactionHash: userOperationReceipt.receipt.transactionHash,
  success: userOperationReceipt.success,
});
```

## 3\. Bundler RPC methods {#3-bundler-rpc-methods}

### 3.1 eth\_supportedEntryPoints {#31-eth\_supportedentrypoints}

Returns the EntryPoint addresses accepted by the Bundler. The result should include the configured EntryPoint deployment. Applications should also verify that the Bundler's `eth_chainId` matches the chain RPC.

### 3.2 eth\_estimateUserOperationGas {#32-eth\_estimateuseroperationgas}

#### 3.2.1 Parameters {#321-parameters}

| Position | Parameter | Type | Description |
| --- | --- | --- | --- |
| 1 | `userOp` | Estimate UserOperation | RPC UserOperation to simulate |
| 2 | `entryPoint` | address | EntryPoint supported by the Bundler |
| 3 | `stateOverrides` | object, optional | Account-state overrides used only for simulation |

State overrides are keyed by address and support `balance`, `nonce`, `code`, `state`, and `stateDiff`. They affect only the current simulation.

#### 3.2.2 Result {#322-result}

| Field | Type | Description |
| --- | --- | --- |
| `callGasLimit` | QUANTITY | Gas limit for account execution |
| `verificationGasLimit` | QUANTITY | Gas limit for Factory and account validation |
| `verificationGas` | QUANTITY | Validation Gas alias returned by Skandha |
| `preVerificationGas` | QUANTITY | Fixed calldata and bundle overhead |
| `maxFeePerGas` | QUANTITY | Suggested maximum total Gas price |
| `maxPriorityFeePerGas` | QUANTITY | Suggested maximum priority fee |
| `paymasterVerificationGasLimit` | QUANTITY, optional | Gas limit for Paymaster validation |
| `paymasterPostOpGasLimit` | QUANTITY, optional | Gas limit for Paymaster `postOp` |
| `validAfter` | QUANTITY, optional | Start of the validation time range |
| `validUntil` | QUANTITY, optional | End of the validation time range |

### 3.3 eth\_sendUserOperation {#33-eth\_senduseroperation}

The parameters are the final RPC UserOperation and the EntryPoint address. The method returns a `bytes32 userOpHash`, not the outer `handleOps` transaction hash.

Bundler acceptance only means that the UserOperation entered the packaging flow; it does not mean that the operation has been included on-chain or executed successfully.

### 3.4 eth\_getUserOperationByHash {#34-eth\_getuseroperationbyhash}

Returns `null` when no operation is found. Otherwise it returns:

| Field | Description |
| --- | --- |
| `userOperation` | Original RPC UserOperation |
| `entryPoint` | Execution entry point |
| `blockNumber` | Included block number, optional |
| `blockHash` | Included block hash, optional |
| `transactionHash` | Outer `handleOps` transaction hash, optional |

A UserOperation that is still in the mempool may not have transaction or block fields.

### 3.5 eth\_getUserOperationReceipt {#35-eth\_getuseroperationreceipt}

Returns `null` until the operation is included on-chain. The primary fields after inclusion are:

| Field | Description |
| --- | --- |
| `userOpHash` | UserOperation hash |
| `sender` | Smart account |
| `nonce` | UserOperation nonce |
| `paymaster` | Gas-paying Paymaster, optional |
| `actualGasCost` | Actual Gas cost |
| `actualGasUsed` | Actual Gas used |
| `success` | Whether account business execution succeeded |
| `reason` | Failure reason, optional |
| `logs` | Logs related to the UserOperation |
| `receipt` | Outer `handleOps` transaction receipt |

Use `success` as the final business result. A successful outer transaction does not mean that every UserOperation inside it succeeded.

### 3.6 skandha\_getGasPrice {#36-skandha\_getgasprice}

This extension method takes no parameters and returns `maxFeePerGas` and `maxPriorityFeePerGas`. To support other Bundlers, a fallback strategy must still produce both fields. The chain RPC's `eth_gasPrice` may be used as a pricing input, but it is not a complete EIP-1559 two-field quote. Do not set the UserOperation Gas price to zero even if the on-chain base fee is zero.

## 4\. Troubleshooting {#4-troubleshooting}

| Symptom | What to check |
| --- | --- |
| `Invalid Entrypoint` | Bundler-supported list, network, and EntryPoint address |
| Parameter validation fails | QUANTITY and DATA encoding, address length, and conditional fields |
| `AA10` | An already deployed account still includes Factory fields |
| `AA21` | Account deposit or prefund is insufficient |
| `AA24` | Account signature, hash, chainId, or EntryPoint does not match |
| `AA25` | Nonce was already used or violates the account policy |
| `AA31` / `AA33` | Paymaster deposit is insufficient or validation failed |
| Receipt does not appear | Mempool state, Gas quote, nonce, and Relayer state |
| Receipt has `success: false` | Decode `UserOperationRevertReason` and inspect the business call |
