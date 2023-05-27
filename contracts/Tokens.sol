//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract Token is ERC20, Ownable, ERC20Permit {
    constructor(
        string memory _symbol,
        string memory _name
    ) ERC20(_name, _symbol) ERC20Permit(_name) {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
