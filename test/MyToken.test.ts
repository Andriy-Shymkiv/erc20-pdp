import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

const NAME = 'MyToken';
const SYMBOL = 'MTK';
const DECIMALS = 18;

enum Roles {
  ADMIN = 'ADMIN_ROLE',
}
const ROLES: Record<Roles, string> = {
  [Roles.ADMIN]: ethers.keccak256(ethers.toUtf8Bytes(Roles.ADMIN)),
};

describe(NAME, () => {
  async function deploy() {
    const [deployer] = await ethers.getSigners();
    const contract = await ethers.deployContract(NAME, [[deployer.address]]);
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

  describe('Roles', () => {
    for (const role of Object.values(Roles)) {
      it(`has ${role} role`, async () => {
        const { contract, deployer } = await loadFixture(deploy);
        expect(await contract.hasRole(ROLES[role], deployer.address)).to.be.true;
      });
    }
  });

  describe('Mint and Burn', () => {
    it('admin can mint', async () => {
      const { contract, deployer } = await loadFixture(deploy);
      const amount = 100;
      await contract.mint(deployer.address, amount);
      expect(await contract.balanceOf(deployer.address)).to.equal(amount);
    });

    it('user cannot mint', async () => {
      const { contract } = await loadFixture(deploy);
      const [_, user] = await ethers.getSigners();
      const amount = 100;
      await expect(contract.connect(user).mint(user.address, amount)).to.be.reverted;
    });

    it('admin can burn', async () => {
      const { contract, deployer } = await loadFixture(deploy);
      const amount = 100;
      await contract.mint(deployer.address, amount);
      await contract.burn(amount);
      expect(await contract.balanceOf(deployer.address)).to.equal(0);
    });

    it('user cannot burn', async () => {
      const { contract } = await loadFixture(deploy);
      const [_, user] = await ethers.getSigners();
      const amount = 100;
      await expect(contract.connect(user).burn(amount)).to.be.reverted;
    });
  });
});
