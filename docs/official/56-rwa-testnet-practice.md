---
title: "06 · Environment Configuration and Acceptance"
section: "RWA"
source_url: https://dev-docs.botchain.ai/docs/RWA/testnet-practice
source: official
last_synced: 2026-10-24
---
# 06 · Environment Configuration and Acceptance

This chapter provides the network parameters, demo assets, query examples, and acceptance checklist required to connect to the public environments.

* * *

## 6.1 Environment information {#61-environment-information}

| Item | Test environment | Mainnet demo environment |
| --- | --- | --- |
| Purpose | Development, integration, acceptance | BOT Mainnet capability verification |
| Network | Bohr Testnet | BOT Mainnet |
| Status | Available | Demo Suite deployed |
| Chain ID | `968` | `677` |
| RPC | `https://rpc.bohr.life` | `https://rpc.botchain.ai` |
| Explorer | `https://scan.bohr.life` | `https://scan.botchain.ai` |
| Native gas asset | Test BOT | BOT |

Contract addresses, Token balances, identities, and Claims are not shared between Bohr Testnet and BOT Mainnet.

* * *

## 6.2 Recommended configuration structure {#62-recommended-configuration-structure}

Use independent configuration files or environment variables for each environment:

```ts
type RwaEnvironment = {
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  contracts: {
    token: string;
    identityRegistry: string;
    onchainIdGateway?: string;
    idFactory?: string;
    claimIssuer?: string;
  };
};
```

Test environment example:

```js
const rwaTestnet = {
  chainId: 968,
  rpcUrl: 'https://rpc.bohr.life',
  explorerUrl: 'https://scan.bohr.life',
  contracts: {
    token: '0xA7aEb5cc99C558E7A237aA1B3483e71E59e66036',
    identityRegistry: '0x5C3f759a7Fe22331750E6CA3293a96C34daE3417',
    onchainIdGateway: '0xb62261a7193B6F37A5c6A2c242aD542C840d6f5a',
    idFactory: '0xEa3216f557B6598F53fCcd146E63912c4c1be02C',
    claimIssuer: '0xEa7E7c89F56f167E12570E15d648460104510d47',
  },
};
```

BOT Mainnet capability-demo configuration:

```js
const rwaMainnet = {
  chainId: 677,
  rpcUrl: 'https://rpc.botchain.ai',
  explorerUrl: 'https://scan.botchain.ai',
  contracts: {
    token: '0x58F96a44594C9C5C8DE282Eeb75208B5f11C0c36',
    identityRegistry: '0xe0b6FbEa0a9af21ddd455D6cA776478cAbe7c141',
    onchainIdGateway: '0xFCF1E45f42aAa5CccA0A035f7a946BC8Fd55Fac6',
    idFactory: '0xE97099950DFe98535927a650658c0E964c8d6f67',
    claimIssuer: '0xD40b0c8dC960755C2586601Ff505F036FfE9BF59',
  },
};
```

Do not automatically fall back to test addresses when mainnet configuration is missing or fails validation. See the complete machine-readable configuration in [`addresses-mainnet.json`](https://dev-docs.botchain.ai/assets/files/addresses-mainnet-fe21ede8417cd60c145fc15de93fbc9b.json).

* * *

## 6.3 Public demo asset {#63-public-demo-asset}

Bohr Testnet and BOT Mainnet both have the following sample asset deployed to demonstrate complete ERC-3643 capabilities. Addresses, balances, identities, and Claims are independent on each network.

| Item | Value |
| --- | --- |
| Name | `Project Real World Asset` |
| Symbol | `PRWA` |
| Decimals | `6` |
| Eligibility Topic | `KYC_APPROVED` |
| Topic value | `7151541257903274562366177585585886223835338030660388602590463654390840817671` |
| Claim scheme | `1` |
| Allowed country codes | `156`, `702` |

### 6.3.1 Bohr Testnet addresses {#631-bohr-testnet-addresses}

Asset Suite:

| Contract | Address |
| --- | --- |
| `Token` | `0xA7aEb5cc99C558E7A237aA1B3483e71E59e66036` |
| `IdentityRegistry` | `0x5C3f759a7Fe22331750E6CA3293a96C34daE3417` |
| `IdentityRegistryStorage` | `0x3fae839c1642BDcFBE94b5A8088a56F8fC787707` |
| `ClaimTopicsRegistry` | `0x042a938B2cE1e1AdF2b4101D9730722d5c75F773` |
| `TrustedIssuersRegistry` | `0x2323413Abd0BF763ed2f3bE9c319A7a05985C2ff` |
| `ModularCompliance` | `0x3aa6A97b6d61039A65C5AEf5649523732379aE9C` |
| Token ONCHAINID | `0x7528D8d23fE511c658564E1cB346ca7D9B72788d` |

Bohr Testnet shared addresses:

| Contract | Address |
| --- | --- |
| `ONCHAINID Gateway` | `0xb62261a7193B6F37A5c6A2c242aD542C840d6f5a` |
| `IdFactory` | `0xEa3216f557B6598F53fCcd146E63912c4c1be02C` |
| `ClaimIssuer` | `0xEa7E7c89F56f167E12570E15d648460104510d47` |
| `TREXGateway` | `0xf73CB3A2830bef113Be01CD5eE5C99d21e43107B` |

Eligibility and rules:

| Item | Address / value |
| --- | --- |
| `KYC_APPROVED` Topic | `7151541257903274562366177585585886223835338030660388602590463654390840817671` |
| Claim scheme | `1` |
| Country Allowlist module | `0x5Da275CcC6eAb8bd43800AB54B9c8Ec48129aB30` |
| Allowed country codes | `156` (China), `702` (Singapore) |

### 6.3.2 BOT Mainnet demo addresses {#632-bot-mainnet-demo-addresses}

Asset Suite:

| Contract | Address |
| --- | --- |
| `Token` | [`0x58F96a44594C9C5C8DE282Eeb75208B5f11C0c36`](https://scan.botchain.ai/address/0x58F96a44594C9C5C8DE282Eeb75208B5f11C0c36) |
| `IdentityRegistry` | [`0xe0b6FbEa0a9af21ddd455D6cA776478cAbe7c141`](https://scan.botchain.ai/address/0xe0b6FbEa0a9af21ddd455D6cA776478cAbe7c141) |
| `IdentityRegistryStorage` | [`0x344D8266058FcE40D8229F8eF118da5ee6f88c54`](https://scan.botchain.ai/address/0x344D8266058FcE40D8229F8eF118da5ee6f88c54) |
| `ClaimTopicsRegistry` | [`0x7778b431b73F57722cBa7D6205F45858D789ACB1`](https://scan.botchain.ai/address/0x7778b431b73F57722cBa7D6205F45858D789ACB1) |
| `TrustedIssuersRegistry` | [`0xC3216525E30E0369B49d75105b3591b647595d63`](https://scan.botchain.ai/address/0xC3216525E30E0369B49d75105b3591b647595d63) |
| `ModularCompliance` | [`0xE0444e1374d5ca5EdF3DAb0bEB54165c8D1968a4`](https://scan.botchain.ai/address/0xE0444e1374d5ca5EdF3DAb0bEB54165c8D1968a4) |
| Token ONCHAINID | [`0x651b1Ad7F96A16228e41cDf6c2eb2282C267dE6B`](https://scan.botchain.ai/address/0x651b1Ad7F96A16228e41cDf6c2eb2282C267dE6B) |

Shared platform addresses:

| Contract | Address |
| --- | --- |
| `ONCHAINID Gateway` | [`0xFCF1E45f42aAa5CccA0A035f7a946BC8Fd55Fac6`](https://scan.botchain.ai/address/0xFCF1E45f42aAa5CccA0A035f7a946BC8Fd55Fac6) |
| `IdFactory` | [`0xE97099950DFe98535927a650658c0E964c8d6f67`](https://scan.botchain.ai/address/0xE97099950DFe98535927a650658c0E964c8d6f67) |
| `ClaimIssuer` | [`0xD40b0c8dC960755C2586601Ff505F036FfE9BF59`](https://scan.botchain.ai/address/0xD40b0c8dC960755C2586601Ff505F036FfE9BF59) |
| `TREX ImplementationAuthority` | [`0x658B369FFfE2474310224c6DAe2f320A27A76D2E`](https://scan.botchain.ai/address/0x658B369FFfE2474310224c6DAe2f320A27A76D2E) |
| `ONCHAINID ImplementationAuthority` | [`0xA5aeF4767C10fE47d1097b65Da55357B29bbbfF6`](https://scan.botchain.ai/address/0xA5aeF4767C10fE47d1097b65Da55357B29bbbfF6) |
| `IAFactory` | [`0x394f0720F519e25d63065690d8565018404b69E8`](https://scan.botchain.ai/address/0x394f0720F519e25d63065690d8565018404b69E8) |
| `TREXFactory` | [`0xCdc6C38438DEd768028EecFd50a8aAf3ad755a92`](https://scan.botchain.ai/address/0xCdc6C38438DEd768028EecFd50a8aAf3ad755a92) |
| `TREXGateway` | [`0x7a8bea060430D7A6B5ac816137733570425Bb777`](https://scan.botchain.ai/address/0x7a8bea060430D7A6B5ac816137733570425Bb777) |

Eligibility and rules:

| Item | Address / value |
| --- | --- |
| `KYC_APPROVED` Topic | `7151541257903274562366177585585886223835338030660388602590463654390840817671` |
| Claim scheme | `1` |
| Country Allowlist module | `0x8AD1cdF24Bf38E9b649294fb01e2A9E83F0E19E5` |
| Allowed country codes | `156` (China), `702` (Singapore) |

> The BOT Mainnet demo Suite uses a Country Allowlist module that has not completed a production audit. It is only for technical capability verification and must not directly carry real assets.

Machine-readable configurations:

-   [Bohr Testnet configuration](https://dev-docs.botchain.ai/assets/files/addresses-testnet-126f991aed3fbb8adcc24c208eea795f.json)
-   [BOT Mainnet demo configuration](https://dev-docs.botchain.ai/assets/files/addresses-mainnet-fe21ede8417cd60c145fc15de93fbc9b.json)

* * *

## 6.4 Public query wallets {#64-public-query-wallets}

These addresses are registered in the test asset's IdentityRegistry and can be used for read-only integration:

| Sample | Wallet | ONCHAINID | Country | Expected eligibility |
| --- | --- | --- | --- | --- |
| Alice | `0xb450970Eece71044acF7cB7f53Ee51e3BC2EA922` | `0xfAB41B1DfD098F439D75cEA0cb48f70B46052544` | `156` | `true` |
| Bob | `0xfc996C5378fe0cd03Fd4296075abc07B16b2B12F` | `0xd3b816e7494e918297E3553d65488a7E0682C6A3` | `702` | `true` |
| Cathy | `0x2b981b025397AE1AFca6f8DC7A2f5C7A868dEe78` | `0xb7522A6649a20A0820E292D8D0f35aB792812011` | `156` | `true` |

These are public query samples, and their private keys are not provided. Use your own test wallet and request test eligibility or assets for write operations.

The latest BOT Mainnet capability-demo Suite has only completed contract deployment and source-code verification. Public wallets have not yet gone through ONCHAINID creation, Claim issuance, or IdentityRegistry registration. Therefore, no mainnet sample wallets with `isVerified == true` are currently published. This section will be completed after independent operational initialization and onchain acceptance.

Use an unregistered wallet you control for negative tests. Expected results are `contains == false` and `isVerified == false`. Do not use the zero address as a real business wallet.

* * *

## 6.5 Step 1: Validate network and contracts {#65-step-1-validate-network-and-contracts}

The JavaScript examples use ethers.js v5. For v6, use the v6 imports for `JsonRpcProvider`, `formatUnits`, and `parseUnits`.

```js
const { ethers } = require('ethers');

const provider = new ethers.providers.JsonRpcProvider(
  'https://rpc.bohr.life'
);

const network = await provider.getNetwork();
if (network.chainId !== 968) {
  throw new Error(`Wrong network: expected 968, got ${network.chainId}`);
}

const TOKEN = '0xA7aEb5cc99C558E7A237aA1B3483e71E59e66036';
const IR = '0x5C3f759a7Fe22331750E6CA3293a96C34daE3417';

const code = await provider.getCode(TOKEN);
if (code === '0x') {
  throw new Error('Token contract not found on current network');
}
```

Validate Chain ID before every write operation.

* * *

## 6.6 Step 2: Read asset information {#66-step-2-read-asset-information}

```js
const token = new ethers.Contract(
  TOKEN,
  [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function identityRegistry() view returns (address)',
    'function compliance() view returns (address)',
    'function paused() view returns (bool)',
  ],
  provider
);

const [name, symbol, decimals, supply, registry, compliance, paused] =
  await Promise.all([
    token.name(),
    token.symbol(),
    token.decimals(),
    token.totalSupply(),
    token.identityRegistry(),
    token.compliance(),
    token.paused(),
  ]);

console.log({
  name,
  symbol,
  decimals,
  totalSupply: ethers.utils.formatUnits(supply, decimals),
  registry,
  compliance,
  paused,
});
```

Acceptance requirements:

-   name and symbol match published asset information;
-   `decimals` is readable;
-   `identityRegistry()` matches configuration;
-   `compliance()` matches the address table.

* * *

## 6.7 Step 3: Query balance and eligibility {#67-step-3-query-balance-and-eligibility}

```js
const wallet = '0xb450970Eece71044acF7cB7f53Ee51e3BC2EA922';

const ir = new ethers.Contract(
  IR,
  [
    'function contains(address) view returns (bool)',
    'function isVerified(address) view returns (bool)',
    'function identity(address) view returns (address)',
    'function investorCountry(address) view returns (uint16)',
  ],
  provider
);

const [rawBalance, contains, verified, identity, country] =
  await Promise.all([
    token.balanceOf(wallet),
    ir.contains(wallet),
    ir.isVerified(wallet),
    ir.identity(wallet),
    ir.investorCountry(wallet),
  ]);

console.log({
  balance: ethers.utils.formatUnits(rawBalance, decimals),
  contains,
  verified,
  identity,
  country,
});
```

For the public test wallets, `contains` and `verified` should be `true`; identity and country should match the table.

* * *

## 6.8 Step 4: Query events {#68-step-4-query-events}

```js
const transferFilter = token.filters.Transfer();
const latest = await provider.getBlockNumber();
const logs = await token.queryFilter(
  transferFilter,
  Math.max(0, latest - 5000),
  latest
);

for (const log of logs) {
  console.log({
    txHash: log.transactionHash,
    blockNumber: log.blockNumber,
    from: log.args.from,
    to: log.args.to,
    value: ethers.utils.formatUnits(log.args.value, decimals),
  });
}
```

A long-running indexer should query in segments and resume from checkpoints to avoid oversized requests.

* * *

## 6.9 Write-operation integration {#69-write-operation-integration}

Different operations require different signers:

| Operation | Signer | Prerequisite |
| --- | --- | --- |
| Create ONCHAINID | Investor test wallet | Test gas |
| `addClaim` | ONCHAINID management wallet | Test Claim signature obtained |
| `registerIdentity` | Test IR Agent | Integration support from issuer or platform |
| `mint` / `burn` | Test Token Agent | Integration support from issuer or platform |
| `transfer` | Token holder | Both parties satisfy eligibility and rules |

Ordinary developers do not need platform or issuer Agent private keys. Operations requiring Agent authority are performed by the target asset issuer. Use your own wallet for investor operations and request test gas, registration, or test assets through public support channels. Never transmit a private key.

### Transfer precheck and submission {#transfer-precheck-and-submission}

The public `PRWA` demo assets on Bohr Testnet and BOT Mainnet are currently paused, so ordinary holder transfers cannot execute. The code below demonstrates the complete integration. Send `transfer` only after the Token Agent calls `unpause()`.

```js
const recipient = '0xfc996C5378fe0cd03Fd4296075abc07B16b2B12F';
const senderAddress = await signer.getAddress();
const amount = ethers.utils.parseUnits('10', decimals);

if (await token.paused()) {
  throw new Error('Token transfers are currently paused');
}

const verified = await ir.isVerified(recipient);
if (!verified) {
  throw new Error('Recipient is not verified for this asset');
}

const complianceAddress = await token.compliance();
const compliance = new ethers.Contract(
  complianceAddress,
  ['function canTransfer(address,address,uint256) view returns (bool)'],
  provider
);

const allowed = await compliance.canTransfer(
  senderAddress,
  recipient,
  amount
);
if (!allowed) {
  throw new Error('Transfer rejected by compliance rules');
}

// signer must be the Token holder
const tx = await token.connect(signer).transfer(recipient, amount);
const receipt = await tx.wait();
console.log(receipt.transactionHash);
```

### approve + transferFrom {#approve--transferfrom}

```js
const approveTx = await token.connect(ownerSigner).approve(spender, amount);
await approveTx.wait();

const transferTx = await token
  .connect(spenderSigner)
  .transferFrom(ownerAddress, recipient, amount);
await transferTx.wait();
```

A precheck cannot guarantee success. State can change between submission and confirmation, and the receipt is final.

* * *

## 6.10 Launch acceptance checklist {#610-launch-acceptance-checklist}

### Environment {#environment}

-   Testnet and mainnet use independent configuration;
-   Chain ID is strictly validated at startup;
-   RPC, explorer, and contract addresses come from official release information;
-   Mainnet configuration cannot automatically fall back to test addresses.

### Contract reads {#contract-reads}

-   Token name, symbol, and `decimals` are correct;
-   Token-bound IR and MC match the address table;
-   Addresses contain contract bytecode;
-   ABI matches the deployed version.

### Amounts and transactions {#amounts-and-transactions}

-   Every amount uses `parseUnits` / `formatUnits`;
-   Write operations distinguish submitted, confirmed, and failed states;
-   Transaction hashes link to the correct explorer;
-   Failed transactions do not update final business state;
-   Retry logic does not duplicate mint or burn submissions.

### Identity and compliance {#identity-and-compliance}

-   Eligibility is queried through the target asset's IR;
-   `contains` and `isVerified` are not conflated;
-   Multi-asset applications do not reuse the wrong IR;
-   Plaintext KYC stays off-chain;
-   Compliance rejections are explained clearly to users.

### Security {#security}

-   No private keys exist in the frontend, repository, or logs;
-   Agent and Claim Signer use controlled signing;
-   Only proxy addresses are used;
-   Teams subscribe to platform upgrade and security notices.

* * *

## 6.11 Troubleshooting order {#611-troubleshooting-order}

```text
1. Confirm Chain ID
2. Confirm RPC availability
3. Confirm the address has bytecode on the current network
4. Read Token.name / decimals / identityRegistry
5. Query balance, paused, isFrozen
6. Query recipient contains / isVerified
7. Query compliance.canTransfer
8. Confirm signer role
9. Use callStatic / estimateGas for the revert reason
10. Query the receipt and events after submission
```

When testnet succeeds and mainnet fails, compare network, contract addresses, asset eligibility requirements, and compliance rules first. Do not assume identical configuration.

* * *

[Previous: 05 · Contract Interfaces and Events](https://dev-docs.botchain.ai/docs/RWA/core-methods-and-events/) · [Back to 01 · Project and Integration Overview](https://dev-docs.botchain.ai/docs/RWA/quick-understanding/)
