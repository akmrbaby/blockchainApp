import { ethers } from "hardhat";

async function main() {
  const myToken = await ethers.deployContract("MyToken");
  myToken.waitForDeployment();
  console.log(`MyToken deployed to: ${myToken.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
