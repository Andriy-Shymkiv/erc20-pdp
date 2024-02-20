import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

const NAME = 'MyToken';

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

  describe('Roles', () => {
    for (const role of Object.values(Roles)) {
      it(`has ${role} role`, async () => {
        const { contract, deployer } = await loadFixture(deploy);
        expect(await contract.hasRole(ROLES[role], deployer.address)).to.be.true;
      });
    }
  });

  describe('Mint and Burn', () => {
    it('should mint and burn', async () => {
      const { contract, deployer } = await loadFixture(deploy);
      const amount = 100;
      await contract.mint(deployer.address, amount);
      expect(await contract.balanceOf(deployer.address)).to.equal(amount);
      await contract.approve(deployer.address, amount);
      await contract.burnFrom(deployer.address, amount);
      expect(await contract.balanceOf(deployer.address)).to.equal(0);
    });
    it('only admin can mint', async () => {
      const { contract, deployer } = await loadFixture(deploy);
      const [_, user] = await ethers.getSigners();
      const amount = 100;
      await contract.mint(deployer.address, amount);
      await expect(contract.connect(user).mint(user.address, amount)).to.be.reverted;
    });
    it('only admin can burnFrom', async () => {
      const { contract, deployer } = await loadFixture(deploy);
      const [_, user] = await ethers.getSigners();
      const amount = 100;
      await contract.mint(deployer.address, amount);
      await contract.approve(user.address, amount);
      await expect(contract.connect(user).burnFrom(deployer.address, amount)).to.be.reverted;
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
    it('cannot add admin to blacklist', async () => {
      const { contract, deployer } = await loadFixture(deploy);
      await expect(contract.addToBlackList([deployer.address])).to.be.revertedWithCustomError(
        contract,
        'CannotBlackListAdmin'
      );
    });
    it('cannot add already blacklisted user to blacklist', async () => {
      const { contract, deployer } = await loadFixture(deploy);
      const [_, user] = await ethers.getSigners();
      await contract.addToBlackList([user.address]);
      await expect(contract.addToBlackList([user.address])).to.be.revertedWithCustomError(
        contract,
        'AlreadyBlackListed'
      );
    });
    it('cannot remove not blacklisted user from blacklist', async () => {
      const { contract, deployer } = await loadFixture(deploy);
      const [_, user] = await ethers.getSigners();
      await expect(contract.removeFromBlackList([user.address])).to.be.revertedWithCustomError(
        contract,
        'NotBlackListed'
      );
    });
    it('blacklisted user cannot transfer', async () => {
      const { contract, deployer } = await loadFixture(deploy);
      const [_, user] = await ethers.getSigners();
      const amount = 100;
      await contract.mint(deployer.address, amount);
      await contract.addToBlackList([user.address]);
      await expect(contract.connect(user).transfer(deployer.address, amount)).to.be.revertedWithCustomError(
        contract,
        'SenderIsBlackListed'
      );
    });
    it('blacklisted user cannot transferFrom', async () => {
      const { contract, deployer } = await loadFixture(deploy);
      const [_, user] = await ethers.getSigners();
      const amount = 100;
      await contract.mint(deployer.address, amount);
      await contract.approve(user.address, amount);
      await contract.addToBlackList([user.address]);
      await expect(
        contract.connect(user).transferFrom(deployer.address, user.address, amount)
      ).to.be.revertedWithCustomError(contract, 'RecipientIsBlackListed');
    });
  });
});
