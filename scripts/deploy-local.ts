import { ethers } from "hardhat";

async function main() {
  const myToken = await ethers.deployContract("MyToken");
  await myToken.waitForDeployment();
  console.log(`MyToken deployed to: ${myToken.target}`);

  const myERC20 = await ethers.deployContract("MyERC20");
  await myERC20.waitForDeployment();
  console.log(`MyERC20 deployed to: ${myERC20.target}`);

  const myERC721 = await ethers.deployContract("MyERC721", [
    "MyERC721",
    "MYERC721",
  ]);
  await myERC721.waitForDeployment();
  console.log(`MyERC721 deployed to: ${myERC721.target}`);

  const [owner] = await ethers.getSigners();
  const myTimelockController = await ethers.deployContract(
    "MyTimelockController",
    [60 * 2, [owner.getAddress()], [owner.getAddress()], owner.getAddress()]
  );
  await myTimelockController.waitForDeployment();
  console.log(`TimelockController deployed to: ${myTimelockController.target}`);

  const myGovernor = await ethers.deployContract("MyGovernor", [
    myERC20.target,
    myTimelockController.target,
  ]);
  await myGovernor.waitForDeployment();
  console.log(`MyGovernor deployed to: ${myGovernor.target}`);

  const proposalRole = await myTimelockController.PROPOSER_ROLE();
  const executorRole = await myTimelockController.EXECUTOR_ROLE();
  const adminRole = await myTimelockController.TIMELOCK_ADMIN_ROLE();

  await myTimelockController.grantRole(proposalRole, myGovernor.target);
  await myTimelockController.grantRole(executorRole, myGovernor.target);

  console.log(`MyGovernor granted to PROPOSER_ROLE and EXECUTOR_ROLE`);

  await myERC20.grantMinterRole(myTimelockController.target);

  console.log(`MyTimelockController granted to MINTER_ROLE`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
