import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('MyToken', () => {
  async function deploy() {
    const [deployer] = await ethers.getSigners();
    const contract = await ethers.deployContract('MyToken');
    return { contract, deployer };
  }

  it('is deployed', async () => {
    await loadFixture(deploy);
  });

  it('has MTK symbol', async () => {
    const { contract } = await loadFixture(deploy);
    expect(await contract.symbol()).to.equal('MTK');
  });

  it('has MyToken name', async () => {
    const { contract } = await loadFixture(deploy);
    expect(await contract.name()).to.equal('MyToken');
  });

  it('has 18 decimals', async () => {
    const { contract } = await loadFixture(deploy);
    expect(await contract.decimals()).to.equal(18);
  });
});
