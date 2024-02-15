import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

const NAME = 'MyToken';
const SYMBOL = 'MTK';
const DECIMALS = 18;

describe(NAME, () => {
  async function deploy() {
    const [deployer] = await ethers.getSigners();
    const contract = await ethers.deployContract(NAME);
    return { contract, deployer };
  }

  it('is deployed', async () => {
    await loadFixture(deploy);
  });

  it(`has ${SYMBOL} symbol`, async () => {
    const { contract } = await loadFixture(deploy);
    expect(await contract.symbol()).to.equal(SYMBOL);
  });

  it(`has ${NAME} name`, async () => {
    const { contract } = await loadFixture(deploy);
    expect(await contract.name()).to.equal(NAME);
  });

  it(`has ${DECIMALS} decimals`, async () => {
    const { contract } = await loadFixture(deploy);
    expect(await contract.decimals()).to.equal(DECIMALS);
  });
});
