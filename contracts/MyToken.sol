// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MyToken is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    mapping(address => bool) public blackList;

    event AddedToBlackList(address indexed _address);
    event RemovedFromBlackList(address indexed _address);

    constructor(address[] memory admin) ERC20("MyToken", "MTK") {
        for (uint256 i = 0; i < admin.length; i++) {
            _grantRole(ADMIN_ROLE, admin[i]);
        }
    }

    function addToBlackList(
        address[] memory _addresses
    ) public onlyRole(ADMIN_ROLE) {
        for (uint256 i = 0; i < _addresses.length; i++) {
            require(
                _addresses[i] != msg.sender,
                "You can't add yourself to the blacklist"
            );
            require(
                !hasRole(ADMIN_ROLE, _addresses[i]),
                "You can't add an admin to the blacklist"
            );
            require(
                !blackList[_addresses[i]],
                "Address is already in the blacklist"
            );
            blackList[_addresses[i]] = true;
            emit AddedToBlackList(_addresses[i]);
        }
    }

    function removeFromBlackList(
        address[] memory _addresses
    ) public onlyRole(ADMIN_ROLE) {
        for (uint256 i = 0; i < _addresses.length; i++) {
            require(
                blackList[_addresses[i]],
                "Address is not in the blacklist"
            );
            blackList[_addresses[i]] = false;
            emit RemovedFromBlackList(_addresses[i]);
        }
    }

    function mint(address to, uint256 amount) public onlyRole(ADMIN_ROLE) {
        _mint(to, amount);
        emit Transfer(address(0), to, amount);
    }

    function burn(uint256 amount) public virtual override onlyRole(ADMIN_ROLE) {
        super.burn(amount);
    }

    function transfer(
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        require(!blackList[recipient], "Recipient is blacklisted");
        return super.transfer(recipient, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        require(!blackList[recipient], "Recipient is blacklisted");
        return super.transferFrom(sender, recipient, amount);
    }
}
