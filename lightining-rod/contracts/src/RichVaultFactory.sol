// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./RichVault.sol";

contract RichVaultFactory is Ownable {
    uint256 public vaultId;

    struct VaultInfo {
        address vaultAddress;
        string  name;
        address creator;
    }

    mapping(uint256 => VaultInfo) public vaults;
    mapping(address => address[]) public createdVaults;
    mapping(address => address[]) public userVaults;

    event RichVaultCreated(address indexed vaultAddress, address indexed creator);

    constructor(address _initialOwner) Ownable(_initialOwner) { }

    function createVault(
        string   memory name,
        address[] memory participants
    ) external returns (address) {
        RichVault v = new RichVault(name, msg.sender, participants);

        vaultId++;
        vaults[vaultId] = VaultInfo({
            vaultAddress: address(v),
            name:         name,
            creator:      msg.sender
        });

        createdVaults[msg.sender].push(address(v));
        for (uint i = 0; i < participants.length; i++) {
            userVaults[participants[i]].push(address(v));
        }
        return address(v);
    }

    function getCreatedVaults(address user) external view returns (address[] memory) {
        return createdVaults[user];
    }

    function getUserVaults(address user) external view returns (address[] memory) {
        return userVaults[user];
    }
}