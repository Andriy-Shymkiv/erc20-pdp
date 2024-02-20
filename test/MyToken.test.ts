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
    it('only admin can mint', async () => {
      const { contract, deployer } = await loadFixture(deploy);
      const [_, user] = await ethers.getSigners();
      const amount = 100;
      await contract.mint(deployer.address, amount);
      await expect(contract.connect(user).mint(user.address, amount)).to.be.reverted;
    });

    it('only admin can burn', async () => {
      const { contract, deployer } = await loadFixture(deploy);
      const [_, user] = await ethers.getSigners();
      const amount = 100;
      await contract.mint(deployer.address, amount);
      await contract.burn(amount);
      await expect(contract.connect(user).burn(amount)).to.be.reverted;
    });
  });

  describe('Blacklist', () => {
    it('only admin can manage blacklist', async () => {
      const { contract, deployer } = await loadFixture(deploy);
      const [_, user] = await ethers.getSigners();
      await contract.addToBlackList([user.address]);
      await contract.removeFromBlackList([user.address]);
      await expect(contract.connect(user).addToBlackList([user.address])).to.be.reverted;
      await expect(contract.connect(user).removeFromBlackList([user.address])).to.be.reverted;
    });
    it('blacklisted user cannot transfer', async () => {
      const { contract, deployer } = await loadFixture(deploy);
      const [_, user] = await ethers.getSigners();
      await contract.addToBlackList([user.address]);
      await expect(contract.connect(user).transfer(deployer.address, 100)).to.be.reverted;
    });
    it('blacklisted user cannot transferFrom', async () => {
      const { contract, deployer } = await loadFixture(deploy);
      const [_, user] = await ethers.getSigners();
      await contract.addToBlackList([user.address]);
      await contract.approve(user.address, 100);
      await expect(contract.connect(user).transferFrom(user.address, deployer.address, 100)).to.be.reverted;
    });
  });
});
