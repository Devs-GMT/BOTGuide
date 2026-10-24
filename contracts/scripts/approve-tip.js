// Owner only: approve a tip so it joins the knowledge base.
//   CONTRACT=0x... TIP_ID=0 npx hardhat run scripts/approve-tip.js --network botTestnet
// Add LIST=1 to print every tip first (and skip the approval).
const hre = require("hardhat");

async function main() {
  const address = process.env.CONTRACT;
  if (!address) throw new Error("Set CONTRACT=0x... (the BOTGuide address).");
  const guide = await hre.ethers.getContractAt("BOTGuide", address);

  const total = Number(await guide.tipCount());
  if (process.env.LIST) {
    const tips = await guide.getTips(0, total);
    tips.forEach((t, i) =>
      console.log(`#${i} [${t.approved ? "approved" : "pending"}] ${t.title} (${t.section}, ${t.upvotes} upvotes)\n   ${t.body}\n   by ${t.author}\n`),
    );
    return;
  }

  const id = Number(process.env.TIP_ID);
  if (!Number.isInteger(id) || id < 0 || id >= total) throw new Error(`Set TIP_ID to a number from 0 to ${total - 1}.`);
  const tip = await guide.tips(id);
  console.log(`Approving #${id}: ${tip.title}\n${tip.body}\n`);
  const tx = await guide.approveTip(id);
  console.log(`tx ${tx.hash}`);
  await tx.wait();
  console.log("Approved.");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exitCode = 1;
});
