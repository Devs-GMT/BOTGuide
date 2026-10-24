---
title: "BOT Chain Node Configuration: Best Practices"
section: "Developers"
source_url: https://dev-docs.botchain.ai/docs/Developers/bot-chain-node-configuration-best-practices
source: official
last_synced: 2026-10-24
---
# BOT Chain Node Configuration: Best Practices

### Hardware Specifications {#hardware-specifications}

To ensure optimal performance and reliability, it is crucial to select the appropriate node type based on your specific requirements for transaction processing and state querying on the BOT Chain.

### Archive & Full Node Deployment Guide {#archive--full-node-deployment-guide-}

1.  **Clone the repository and enter the directory**
    
2.  bash
    

```bash
git clone https://github.com/bl-BOHR/node-deploy.git && cd node-deploy
```

1.  **Grant execution permissions (only required the first time on Linux)**
    
2.  bash
    

```bash
chmod +x BOHR_full_node.sh BOHR_archive_node.sh bin/geth*
```

1.  **Initialize and start the node**
    
    -   Full node:
        
    -   bash
        
    
    ```bash
    ./BOHR_full_node.sh reset
    ```
    
    -   Archive node:
        
    -   bash
        
    
    ```bash
    ./BOHR_archive_node.sh reset
    ```
    
2.  **View logs** Node logs are located at: .local/fullnode/node/BOHR-node.log
    

### Recommended Configuration {#recommended-configuration}

For users requiring access to the latest world state in a lightweight mode, the fast node is the ideal choice. It demands less from your system's CPU and disk space.

-   **Processor**: Minimum 2-core CPU.
    
-   **Memory**: At least 4 GB RAM.
    
-   **Storage**: Solid State Drive (SSD) with a minimum capacity of 128GB.
    
-   **Network**: Stable and high-speed internet connection, minimum 1 MBps.
    

#### Archive Node {#archive-node}

For comprehensive access to the entire historical world state of the BOT mainnet, consider deploying an Archive Node. Detailed instructions are available at BOT Chain GitHub repository.（An external link to our repository is required here.）

-   **Processor**: Minimum 4-core CPU.
    
-   **Memory**: At least 8 GB RAM.
    
-   **Storage**: SSD with a minimum capacity of 1TB (NVME SSDs are recommended for optimal performance).
    
-   **Network**: Stable and high-speed internet connection, minimum 2 MBps.
    

#### Full Node {#full-node}

To obtain the latest world state and verify the validity of the state or to generate data proofs, a standard Full Node is suitable.

-   **Processor**: Minimum 4-core CPU.
    
-   **Memory**: At least 8 GB RAM.
    
-   **Storage**: Solid State Drive (SSD) with a minimum capacity of 1TB.
    
-   **Network**: Stable and high-speed internet connection, minimum 2 MBps.
    

### Peers Configuration {#peers-configuration}

#### Mainnet {#mainnet}

-   There is no need to specify static nodes, only Bootnodes are required for mainnet which are already configured in the code. Also, make sure to use the config.toml file from the latest release.

#### Testnet {#testnet}

-   Testnet still need to configure the StaticNodes manually and hence, the StaticNodes list is contained in the latest release's config.toml.

### Troubleshooting for no peers on testnet {#troubleshooting-for-no-peers-on-testnet}

-   Check for configuration issues like wrong chain id, wrong config file/dir.
    
-   Make sure to update the config.toml file as per the latest release
    
-   Don't use bootnodes on testnet, it's not required.
    
-   Deleting the `geth/nodes` and `geth/nodekey` file/dir might help
    
-   Re-download the snapshot and try again.
    

### Store Your BOT with a Hardware Wallet {#store-your-bot-with-a-hardware-wallet}

The most valuable assets of a validator are two keys: one for signing transactions and another for signing blocks

### Securing Your Full Node RPC from Hackers {#securing-your-full-node-rpc-from-hackers}

Please do not expose your RPC endpoints to public networks.

### Account Private keys {#account-private-keys}

To protect your BOT, do not share your 24 words with anyone. The only person who should ever need to know them is you. In short, HSMs are affordable, performant and portable pieces of hardware that help to securely generate, store and manage your private keys. Malware attacks and remote extraction of private keys are much more difficult when an HSM is configured properly.

### Software Vulnerabilities {#software-vulnerabilities}

To protect your BOT, you should only download software directly from official sources, and make sure that you're always using the latest, most secure version

### Running Server as a Daemon {#running-server-as-a-daemon}

It is important to keep **geth** running at all times. There are several ways to achieve this, and the simplest solution we recommend is to register **geth** as a systemd service so that it will automatically get started upon system reboots and other events.

### Set up a Backup Node {#set-up-a-backup-node}

-   Run validator node in archive mode
    
-   Shut down nodes gracefully
    
-   Active monitoring with tools
    

### Steps to Run a Backup Node {#steps-to-run-a-backup-node}

1.  Install the latest version of geth
    
2.  Sync to the latest height using fast sync mode. You can either download the latest snapshot or start fast sync once your node is fully synced
    
3.  Shut down your node gracefully kill -HUP $(pgrep geth)
    
4.  Restart your node.
    

#### Why Node will be Offline for a While After Restart? or What will Happen If the Client is Force Killed? {#why-node-will-be-offline-for-a-while-after-restart-or-what-will-happen-if-the-client-is-force-killed}

After running (synchronized) for a long period of time and being abruptly terminated, only archived nodes are expected to quickly re-synchronize upon restart.

Steps to reproduce:

-   Run the node synchronized for a period of time.
    
-   Abruptly kill the node (kill -9 or system crash).
    
-   Restart the node, observe where it resynchronizes from block height 1 hour ago.
    

**Reasons**

If Geth crashes (or is not shut down gracefully), the recent state held in memory is lost and needs to be regenerated. It takes Geth a long time to restore the states.

The root reason is that **geth** does flush the state trie periodically. The period is defined as **trieTimeout** in **config.toml**.

### How to Upgrade a Backup Node to Become a Validator Node? {#how-to-upgrade-a-backup-node-to-become-a-validator-node}

You can stop mining new blocks by sending commands to **geth console**

Connect to your validator node with **geth attach ipc:path/to/geth.ipc**

```plain
miner.stop()
```

Then, let backup node resume validating ,

```plain
miner.start()
```

### Securing the Validators {#securing-the-validators}

Each validator candidate is encouraged to run its operations independently, as diverse setups increase the resilience of the network. Due to the high amount invested by validators, it is highly essential to protect them against different DoS and DDoS attacks. In this section, we discuss the security mechanism adopted by BOT Chain for its validators.

#### Sentry Nodes (DDOS Protection) {#sentry-nodes-ddos-protection}

Validators are responsible for ensuring that the network can sustain denial of service attacks. One recommended way to mitigate these risks is for validators to carefully structure their network topology in a so-called sentry node architecture. Sentry nodes can be quickly spun up or change their IP addresses. Because the links to the sentry nodes are in private IP space, an internet-based attacked cannot disturb them directly. This will ensure validators block proposals and votes always make it to the rest of the network.

To setup your sentry node architecture, you can follow the instructions below:

1.  Build a private network and setup trusted private connections between the validator node and its sentry

Please do not expose your validator fullnode RPC endpoints to the public network.

Install your fullnode

1.  Set sentry as peers for the validator node

On the console of the sentry node, run **admin.nodeInfo.enode** You should get something similar to this.

```plain
enode://f2da64f49c30a0038bba3391f40805d531510c473ec2bcc7c201631ba003c6f16fa09e03308e48f87d21c0fed1e4e0bc53428047f6dcf34da344d3f5bb69373b@[::]:30306?discport=0
```

!!! Note: \[::\] will be parsed as localhost (127.0.0.1). If your nodes are on a local network, check each individual host machine and find your IP with ifconfig If your peers are not on the local network, you need to know your external IP address (use a service) to construct the enode URL. Copy this value and in the console of the first node run,

Update **config.toml** file of validator node

```plain
# make node invisible
NoDiscovery = true
# connect only to sentry
StaticNodes = ["enode://f2da64f49c30a0038bba3391f40805d531510c473ec2bcc7c201631ba003c6f16fa09e03308e48f87d21c0fed1e4e0bc53428047f6dcf34da344d3f5bb69373b@[10.1.1.1]:30306"]
```

This will return true if successful, but that doesn't mean the node was added successfully.

To confirm run **admin.peers** and you should see the details of the node you just added.

That way, your validator node will try to peer with your provided sentry nodes only.

1.  Confirm the connection

To confirm run **admin.peers** and you should see the details of the node you just added.

#### Firewall Configuration {#firewall-configuration}

**geth** uses several TCP ports for different purposes.

**geth** uses a listener (TCP) port and a discovery (UDP) port, both on 31000 by default.

If you need to run JSON-RPC, you'll also need TCP port 8545. Note that JSON-RPC port should not be opened to the outside world, because from there you can do admin operations.
