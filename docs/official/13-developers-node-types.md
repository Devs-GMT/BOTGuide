---
title: "Node Types"
section: "Developers"
source_url: https://dev-docs.botchain.ai/docs/Developers/node-types
source: official
last_synced: 2026-10-24
---
# Node Types

### Run BOT Chain {#run-bot-chain-}

### Archive Node {#archive-node}

-   Refer to [https://github.com/bl-BOHR/node-deploy](https://github.com/bl-BOHR/node-deploy)

### Fast Node {#fast-node-}

-   Refer to [https://github.com/bl-BOHR/node-deploy](https://github.com/bl-BOHR/node-deploy)

### Node Maintenance {#node-maintenance}

#### 1\. Binary {#1-binary}

All the clients are suggested to upgrade to the latest release. The latest version is supposed to be more stable and has better performance.

#### 2\. Storage {#2-storage}

##### 2.1 Prune State

According to the test, the performance of a full node will degrade when the storage size reaches a high volume (previously it was 1.5TB, which is an experimental value, the latest number needs to be updated). We suggest that the fullnode always keep light storage by pruning the storage.

##### 2.2 How to Prune

1.  Stop the BOT Chain node.
    
2.  Run `nohup geth snapshot prune-state --datadir {the data dir of your BOT node} &`. It will take 3-5 hours to finish.
    
3.  Start the node once it is done.
    

The maintainers should always have a few backup nodes in case one of the nodes is getting pruned. The hardware is also important, **make sure the SSD meets: 500 GB of free disk space, solid-state drive(SSD), gp3, 8k IOPS, 500 MB/S throughput, read latency <1ms (if node is started with snap sync, it will need NVMe SSD)**.

##### 2.3 Prune Ancient Data in Real Time

Ancient data is block data that is already considered immutable. This is determined by a threshold which is currently set at 90000. This means that blocks older than 90000 are considered ancient data. We recommend the `--prunceancient` flag to users who don't care about the ancient data. This is also advised for users who want to save disk space, since this will only keep data for the latest 90000 blocks. Note that once this flag is turned on, the ancient data will not be recovered again and you cannot go back running your node without this flag in the start-up command.

##### 2.4 How to use the flag

```plain
./geth --tries-verify-mode none --config /server/config.toml --datadir /server/node --cache 8000 --rpc.allow-unprotected-txs --history.transactions 0 --pruneancient=true --syncmode=full
```

##### 2.5 Prune Block Tools

A new offline feature introduced in v1.1.8 to prune undesired ancient block data. It will discard blocks, receipts, and headers in the ancient database to save space.

###### How to prune

1.  Stop the BOT Chain Node.
    
2.  Run
    

```plain
./geth snapshot prune-block --datadir /server/node --datadir.ancient ./chaindata/ancient --block-amount-reserved 1024
```

1.  `block-amount-reserved` is the number of ancient data blocks that you want to keep after pruning.

#### 3\. Light Storage {#3-light-storage}

When the node crashes or been force killed, the node will sync from a block that was a few minutes or a few hours ago. This is because the state in memory is not persisted into the database in real time, and the node needs to replay blocks from the last checkpoint once it starts. The replaying time depends on the configuration `TrieTimeout` in the config.toml. We suggest you raise it if you can tolerate long replaying time, so the node can keep light storage.
