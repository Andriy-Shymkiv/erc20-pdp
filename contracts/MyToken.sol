// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MyToken is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    constructor(address[] memory admin) ERC20("MyToken", "MTK") {
        for (uint256 i = 0; i < admin.length; i++) {
            _grantRole(ADMIN_ROLE, admin[i]);
        }
    }

    function mint(address to, uint256 amount) public onlyRole(ADMIN_ROLE) {
        _mint(to, amount);
    }

    function burn(uint256 amount) public virtual override onlyRole(ADMIN_ROLE) {
        super.burn(amount);
    }
}
