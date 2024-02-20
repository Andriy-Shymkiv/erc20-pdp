// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./errors.sol";

contract MyToken is ERC20, ERC20Burnable, AccessControl, MyTokenErrors {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    mapping(address => bool) public blackList;

    event AddedToBlackList(address indexed _address);
    event RemovedFromBlackList(address indexed _address);

    constructor(address[] memory admins) ERC20("MyToken", "MTK") {
        for (uint256 i = 0; i < admins.length; i++) {
            _grantRole(ADMIN_ROLE, admins[i]);
        }
    }

    function addToBlackList(
        address[] memory _addresses
    ) external onlyRole(ADMIN_ROLE) {
        for (uint256 i = 0; i < _addresses.length; i++) {
            address _address = _addresses[i];
            if (hasRole(ADMIN_ROLE, _address)) {
                revert CannotBlackListAdmin(_address);
            }
            if (blackList[_address]) {
                revert AlreadyBlackListed(_address);
            }
            blackList[_address] = true;
            emit AddedToBlackList(_address);
        }
    }

    function removeFromBlackList(
        address[] memory _addresses
    ) external onlyRole(ADMIN_ROLE) {
        for (uint256 i = 0; i < _addresses.length; i++) {
            address _address = _addresses[i];
            if (!blackList[_address]) {
                revert NotBlackListed(_address);
            }
            blackList[_address] = false;
            emit RemovedFromBlackList(_address);
        }
    }

    function mint(address to, uint256 amount) external onlyRole(ADMIN_ROLE) {
        super._mint(to, amount);
    }

    function burnFrom(
        address account,
        uint256 amount
    ) public override onlyRole(ADMIN_ROLE) {
        super.burnFrom(account, amount);
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        if (blackList[from]) {
            revert SenderIsBlackListed();
        }
        if (blackList[to]) {
            revert RecipientIsBlackListed();
        }
        super._update(from, to, value);
    }
}
