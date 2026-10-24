---
title: "Validator Creation Guide"
section: "Staking"
source_url: https://dev-docs.botchain.ai/docs/staking/validator-creation-guide
source: official
last_synced: 2026-10-24
---
# Validator Creation Guide

This guide outlines the process for creating a new validator on the BOT Chain. The BOT staking dApp is the official tool for creating and managing validators on the BOT Chain.

-   Testnet: [https://staking.bohr.life](https://staking.bohr.life)
-   Mainnet: [https://staking.botchain.ai](https://staking.botchain.ai)

### Terminology {#terminology}

-   Operator Address: The address for creating and modifying validator information on the BOT. You should use this address when connecting to the staking dApp. The corresponding account should have more than 2001 BOT for creating validators and paying transaction fees.
-   Consensus Address: A unique address for your validator’s node. It is used for consensus engines when mining new blocks. It should be different from the operator's address. If you have an existing validator created on the Beacon Chain, the old consensus address cannot be reused and you should create a new one.
-   Vote Address: An address used for fast finality voting. If you have an existing validator created on the Beacon Chain, the old vote address cannot be reused and you should create a new one.
-   BLS Proof: A BLS signature verifying ownership of the vote address.
-   Identity: For associating a new validator with an existing one from the Beacon Chain. It is useful when delegators migrate their stakes - they can know there is a new validator running by the same validator operator. This is optional unless you’re migrating an old validator.

### Steps {#steps}

#### 1\. Connecting to the dApp {#1-connecting-to-the-dapp}

Please connect to the staking dApp using your Operator Address. MetaMask, and WalletConnect options are available for the step. Make sure that the account has more than 2001 BOT before moving on to the next step.

#### 2\. Filling out the form {#2-filling-out-the-form}

Navigate to the dApp and select the Become a Validator button in the right middle of the page to initiate the creation process.

The following information is required to create a validator.

##### Basic Information

[Image: Validator creation form showing basic information fields]

You’ll need to provide the following details on the Create Validator page:

-   Validator Name: Choose a name consisting of 3-9 alphanumeric characters, excluding special characters.
-   Website: Provide a URL to a website with additional information about your validator.
-   Description: A brief description of your validator.

##### Addresses

[Image: Validator creation form showing address configuration fields]

The following addresses are required:

-   Consensus Address: A unique address for your validator’s node.
-   Vote Address: An address used for fast finality voting.
-   BLS Proof: A BLS signature verifying ownership of the vote address.
-   Identity: For associating a new validator with an existing one from the Beacon Chain. This is optional unless you’re migrating an old validator.

##### Generate Consensus Address

Note: Make sure you are downloading the correct binary based on your machine’s platform, e.g., if you are using MacOS, you should download the geth\_mac file. In the following, we will refer to the binary as geth for simplicity.

To create a new account for mining, please use the following command and set a password for the account.

```bash
geth account new --datadir ${DATA_DIR}
```

-   DATA\_DIR: The directory where you want to store your key store files.

This command will return the public address (i.e. consensus address) and the path to your private key. Please backup the key file!

An example consensus address is 0x4b3FFeDb3470D441448BF18310cAd868Cf0F44B5.

If you already have an account for mining, you can use the seed phrase to recover the account.

```bash
geth account import --datadir ${DATA_DIR}
```

If you have created a validator on the Beacon Chain, please use a different one for the consensus address.

##### Generate Vote Address and BLS Proof

To create a new BLS account, please use the following command.

```bash
geth bls account new --datadir ${DATA_DIR}
```

-   DATA\_DIR: The directory where you want to store your key store files.

If you already have a voting key, create a bls wallet and use the keyfile to recover it, using the following command.

```bash
geth bls account import ${KEY_FILE} --datadir ${DATA_DIR}
```

-   DATA\_DIR: The backup file for restoring the BLS account.

Then you can get your vote address by running the following command.

```bash
geth bls account list --datadir ${DATA_DIR}
```

An example address is b5fe571aa1b39e33c2735a184885f737a59ba689177f297cba67da94bea5c23dc71fd4deefe2c0d2d21851eb11081f69.

Then you can get your bls proof by running the following command.

```bash
geth bls account generate-proof --chain-id ${BOT_CHAIN_ID} ${OPEATOR_ADDRESS} ${VOTE_ADDRESS}
```

-   BOT\_CHAIN\_ID: 677 for BOT mainnet, and 968 for BOT testnet.
-   OPEATOR\_ADDRESS: The address of your account, which will be recognized as the operator of the new validator.
-   VOTE\_ADDRESS: The vote address created in the last step.

An example proof is 0xaf762123d031984f5a7ae5d46b98208ca31293919570f51ae2f0a03069c5e8d6d47b775faba94d88dbbe591c51c537d718a743b9069e63b698ba1ae15d9f6bf7018684b0a860a46c812716117a59c364e841596c3f0a484ae40a1178130b76a5

##### Create indentity

Note: Make sure you are downloading the correct binary based on your machine’s platform, e.g., if you are using MacOS, you should download the macos\_binary.zip file, and after unzip it your will find botcli (for mainet) and tbotcli(for testnet). In the following, we will refer to binary as botcli for simplicity.

###### Setup account

If you have mnemonic, you can import your account by running the following command:

```bash
${workspace}/bin/botcli keys add <your-account-name> --recover --home ${HOME}/.botcli
Enter a passphrase for your key:
Repeat the passphrase:
```

> Enter your recovery seed phrase: You will be asked to set a password for this account and input your mnemonic. After that, you will get your account info.

-   `${workspace}/bin/botcli`: The path to the botcli binary executable. For testnet, you should use tbotcli instead.
-   `${HOME}`: The folder where you store your account information.

Or if you have a ledger, you can import your account by running the following command:

```bash
${workspace}/bin/botcli keys add <your-account-name> --ledger --index ${index} --home ${HOME}/.botcli
```

-   `${workspace}/bin/botcli`: The path to the botcli binary executable. For testnet, you should use tbotcli instead.
-   `${HOME}`: The folder where you store your account information.
-   `${index}`: The index of the ledger account you want to import.

###### Get identity

After the account is imported, you can get your identity by running the following command:

For local key:

```bash
${workspace}/bin/botcli \ validator-ownership \ sign-validator-ownership \ --bot-operator-address ${NEW_VALIDATOR_OPERATOR_ADDR_ON_BOT} \  --from ${ACCOUNT_NAME} \  --chain-id ${BOT_CHAIN_ID} \
```

For ledger key:

```bash
${workspace}/bin/botcli \ validator-ownership \ sign-validator-ownership \ --bot-operator-address ${NEW_VALIDATOR_OPERATOR_ADDR_ON_BOT} \ --from ${BOT_OPERATOR_NAME} \ --chain-id ${CHAIN_ID} \ --ledger
```

-   `${workspace}/bin/botcli`: The path to the botcli binary executable. For testnet, you should use tbotcli instead.
-   `--to ${NEW_VALIDATOR_OPERATOR_ADDR_ON_BOT}`: Specifies the BOT address to which the new validator operator address will be mapped.
-   `--from ${ACCOUNT_NAME}`: Specifies the account name from which the sign will be performed. The account should be the operator of the validator created on the Beacon Chain.

And you will get the output like this:

```text
TX JSON: {"type":"auth/StdTx","value":{"msg":[{"type":"migrate/ValidatorOwnerShip","value":{"bot_operator_address":"RXN7r5XZlaljqzp8msZvx6Y6124="}}],"signatures":[{"pub_key":{"type":"tendermint/PubKeySecp256k1","value":"Ahr+LlBMLgiUFkP75kIuJW1YHrsTy39GeOdV+IaTREDN"},"signature":"AL5mj52s0+tcdoEb6c6PAmqBixuv3XEmrLW3Y1kvUeYgG3RqVvWU/dIVcfxiHHwLGXlcn0X1v00jFrpLIsxtqA==","account_number":"0","sequence":"0"}],"memo":"","source":"0","data":null}}
Sign Message: {"account_number":"0","chain_id":"Bot-GGG-Ganges","data":null,"memo":"","msgs":[{"bot_operator_address":"0x45737baf95d995a963ab3a7c9ac66fc7a63ad76e"}],"sequence":"0","source":"0"}
Sign Message Hash: 0x8f7179e7969e497b5f3c006535e55c2fa5bea5d118a8008eddce3fccd1675673
Signature: 0x00be668f9dacd3eb5c76811be9ce8f026a818b1bafdd7126acb5b763592f51e6201b746a56f594fdd21571fc621c7c0b19795c9f45f5bf4d2316ba4b22cc6da8
PubKey: 0x021afe2e504c2e08941643fbe6422e256d581ebb13cb7f4678e755f886934440cd
```

The Signature is your identity for associating with the old validator created on the BOT Chain.

##### Commissions

[Image: Validator creation form showing commission rate settings]

-   Rate: The commission rate of the validator.
-   Max Rate: The maximum commission rate that the validator can set.
-   Max Change Rate: The maximum rate change the validator can set to every epoch (1 day).

##### Self-delegation

[Image: Validator creation form showing self-delegation settings]

-   Self Delegate Amount: The amount to delegate when creating the validator. The minimal number to input is 2001 - for the minimal self delegation amount is 2000 BOT and an extra 1 BOT for locking to a dead address.

#### 3\. Submitting the form {#3-submitting-the-form}

Once you have filled out all the required information, click the Submit button to submit the transaction.

Note: Upon completing these steps, your node is not guaranteed to become an active validator. Selection is based on a ranking that reflects the total BOT stake, with only the top N nodes being chosen as active validators. The number N is determined by the “maxElectedValidators” parameter within the StakeHubContract (0x0000000000000000000000000000000000002002).
