// Deploys BOTGuide.
//   npx hardhat run scripts/deploy.js --network botTestnet
//   npx hardhat run scripts/deploy.js --network botMainnet
const hre = require("hardhat");

const EXPLORERS = {
  968: "https://scan.bohr.life",
  677: "https://scan.botchain.ai",
};

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) throw new Error("No deployer account. Put PRIVATE_KEY=0x... in contracts/.env first.");

  const { chainId, name } = await hre.ethers.provider.getNetwork();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Network   ${hre.network.name} (chain ID ${chainId}${name && name !== "unknown" ? `, ${name}` : ""})`);
  console.log(`Deployer  ${deployer.address}`);
  console.log(`Balance   ${hre.ethers.formatEther(balance)} BOT`);
  if (balance === 0n) throw new Error("The deployer has no BOT for gas. On testnet, claim tBOT from the faucet first.");

  const factory = await hre.ethers.getContractFactory("BOTGuide");
  const contract = await factory.deploy();
  const tx = contract.deploymentTransaction();
  console.log(`\nDeploying... tx ${tx.hash}`);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const explorer = EXPLORERS[Number(chainId)];
  console.log(`\nBOTGuide deployed to ${address}`);
  if (explorer) console.log(`Explorer  ${explorer}/address/${address}`);
  console.log(`Owner     ${await contract.owner()}`);
  console.log(`\nNext: put the address in lib/config.ts (${Number(chainId) === 677 ? "MAINNET_CONTRACT_ADDRESS" : "TESTNET_CONTRACT_ADDRESS"}).`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exitCode = 1;
});
