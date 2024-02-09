import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('deploying contracts with the account:', deployer.address);

  const token = await ethers.deployContract('MyToken');
  console.log('token address:', await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
