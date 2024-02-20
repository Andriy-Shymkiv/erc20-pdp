// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface MyTokenErrors {
    /**
     * @dev Indicates an error when the address is blacklisted
     * @param _address Address to be blacklisted
     */
    error BlackListed(address _address);

    /**
     * @dev Indicates an error when the address is not blacklisted
     * @param _address Address to be not blacklisted
     */
    error NotBlackListed(address _address);

    /**
     * @dev Indicates an error when the address is already blacklisted
     * @param _address Address to be blacklisted
     */
    error AlreadyBlackListed(address _address);

    /**
     * @dev Indicates an error when the address is already blacklisted
     * @param _address Address to be blacklisted
     */
    error CannotBlackListAdmin(address _address);

    /**
     * @dev Indicates an error when the sender is blacklisted
     */
    error SenderIsBlackListed();

    /**
     * @dev Indicates an error when the recipient is blacklisted
     */
    error RecipientIsBlackListed();
}

/**
 * @dev Indicates an error related to the ownership over a particular token. Used in transfers.
 * @param sender Address whose tokens are being transferred.
 * @param tokenId Identifier number of a token.
 * @param owner Address of the current owner of a token.
 */
