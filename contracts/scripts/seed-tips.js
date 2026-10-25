// Owner only: submit a few starter tips and approve them, so the Community tips section is not empty.
//   CONTRACT=0x... npx hardhat run scripts/seed-tips.js --network botTestnet
// Tips whose title already exists are skipped, so running it twice is safe.
// Every tip below was checked by hand on BOT Chain; edit the list before running it on mainnet.
const hre = require("hardhat");

const TIPS = [
  {
    title: "Foundry needs --broadcast to deploy",
    section: "Deploy",
    body: "forge create only simulates the deployment unless you pass --broadcast. Tested on BOT Chain Testnet (chain 968) with Foundry 1.5.1: add --broadcast to send the transaction.",
  },
  {
    title: "Default EVM version works, no need for paris",
    section: "Deploy",
    body: "PUSH0, MCOPY and TSTORE ran without error in an eth_call on both the mainnet and testnet RPCs, so you do not have to lower the EVM version. Solidity 0.8.20 with Hardhat 2 deployed fine on testnet.",
  },
  {
    title: "Remix shows ETH, but it is your BOT balance",
    section: "Wallet",
    body: "With Injected Provider on BOT Chain, Remix labels your balance as ETH. It is your BOT balance. Check that the environment says Custom (677) for mainnet or Custom (968) for testnet before you press Deploy.",
  },
];

async function main() {
  const address = process.env.CONTRACT;
  if (!address) throw new Error("Set CONTRACT=0x... (the BOTGuide address).");
  const guide = await hre.ethers.getContractAt("BOTGuide", address);
  const [signer] = await hre.ethers.getSigners();
  const owner = await guide.owner();
  if (owner.toLowerCase() !== signer.address.toLowerCase()) throw new Error(`The signer is not the owner (${owner}).`);

  const total = Number(await guide.tipCount());
  const existing = total ? (await guide.getTips(0, total)).map((t) => t.title) : [];

  for (const tip of TIPS) {
    if (existing.includes(tip.title)) {
      console.log(`skip (already there): ${tip.title}`);
      continue;
    }
    const tx = await guide.submitTip(tip.title, tip.body, tip.section);
    await tx.wait();
    const id = Number(await guide.tipCount()) - 1;
    const ok = await guide.approveTip(id);
    await ok.wait();
    console.log(`#${id} submitted and approved: ${tip.title}`);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exitCode = 1;
});
