---
title: "Proof of Staked Authority"
section: "Introduction"
source_url: https://dev-docs.botchain.ai/docs/introduction/proof-of-staked-authority
source: official
last_synced: 2026-10-24
---
# Proof of Staked Authority

Although Proof-of-Work (PoW) has been recognized as a practical mechanism to implement a decentralized network, it is not friendly to the environment and also requires a large number of participants to maintain security.

Ethereum and some other blockchain networks, such as [MATIC Bor](https://github.com/maticnetwork/bor), [TOMOChain](https://www.viction.xyz/), [GoChain](https://gochain.io/), [xDAI](https://xdai.io/), do use [Proof-of-Authority(PoA)](https://en.wikipedia.org/wiki/Proof_of_authority) or its variants in different scenarios, including both testnet and mainnet. PoA provides some defense to 51% attack, with improved efficiency and tolerance to certain levels of Byzantine players (malicious or hacked). It serves as an easy choice to pick as the fundamentals.

Meanwhile, the PoA protocol is most criticized for being not as decentralized as PoW, as the validators, i.e. the nodes that take turns to produce blocks, have all the authorities and are prone to corruption and security attacks. Other blockchains, such as EOS and Lisk both, introduce different types of [Delegated Proof of Stake (DPoS)](https://en.bitcoinwiki.org/wiki/DPoS) to allow the token holders to vote and elect the validator set. It increases the decentralization and favors community governance.

BOT Chain here proposes to combine DPoS and PoA for consensus, so that:

1.  Blocks are produced by a limited set of validators
    
2.  Validators take turns to produce blocks in a PoA manner, similar to [Ethereum's Clique](https://eips.ethereum.org/EIPS/eip-225) consensus design
    
3.  Validator sets are elected in and out based on a staking based governance
    

Fast finalization can greatly improve user experience. The `Fast Finality` feature will be enabled upon the coming Plato upgrade. This will be a major advantage of BOT Chain, and many dapps will benefit from it.

The consensus protocol of BOT Chain fulfills the following goals:

1.  Short blocking time, 0.75 seconds on the mainnet.
    
2.  It requires quite a short time to confirm the finality of transactions.
    
3.  There is no inflation of native token: BOT, the block reward is collected from transaction fees, and it will be paid in BOT.
    
4.  It is 100% compatible with the Ethereum system.
    
5.  It allows modern proof-of-stake blockchain network governance.
