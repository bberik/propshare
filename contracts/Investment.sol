//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./Tokens.sol";

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Investment {
    address public nftAddress;
    address payable public owner;
    address public inspector;

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this method");
        _;
    }

    mapping(uint256 => bool) public inspectionPassed;
    mapping(uint256 => uint256) public numberOfTotalTokens;
    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public totalPrice;
    mapping(uint256 => mapping(address => uint256)) public investors;
    mapping(uint256 => uint256) public tokenPrice;
    mapping(uint256 => uint256) numberOfAvailableTokens;
    mapping(uint256 => Token) public tokenCollections;

    constructor(
        address _nftAddress,
        address payable _owner,
        address _inspector
    ) {
        nftAddress = _nftAddress;
        owner = _owner;
        inspector = _inspector;
    }

    function list(
        uint256 _nftID,
        uint256 _totalPrice,
        uint256 _sharedPersentage,
        string memory _name,
        string memory _symbol
    ) public payable onlyOwner {
        require(
            _sharedPersentage <= 75 && _sharedPersentage >= 20,
            "Owner should keep at least 25% of the property, while offering at least 20% of property shares"
        ); // hardcoded

        require(
            _totalPrice > 0,
            "Total value of the property should be greater than 0"
        );

        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);

        isListed[_nftID] = true;
        totalPrice[_nftID] = _totalPrice;
        numberOfTotalTokens[_nftID] = _sharedPersentage * 100; //hardcoded number of tokens (have to make it either input or global variable)
        numberOfAvailableTokens[_nftID] = numberOfTotalTokens[_nftID];
        tokenPrice[_nftID] = _totalPrice / 10000; // hardcoded (each token is 0.01% of the property value)

        Token newTokenCollection = new Token(_symbol, _name);
        tokenCollections[_nftID] = newTokenCollection;
    }

    function invest(
        uint256 _nftID,
        uint256 _numberOfTokensInvested
    ) public payable {
        require(
            inspectionPassed[_nftID] == true,
            "The property didn't pass the inspection check yet, cannot be invested"
        );
        require(
            _numberOfTokensInvested > 0 &&
                _numberOfTokensInvested <= numberOfAvailableTokens[_nftID],
            "Number of tokens should be greater than zero and less than number of available tokens"
        );
        require(
            msg.value == _numberOfTokensInvested * tokenPrice[_nftID],
            "Not exact amount of Ether transfered to purchase tokens"
        );
        investors[_nftID][msg.sender] = _numberOfTokensInvested;
        numberOfAvailableTokens[_nftID] -= _numberOfTokensInvested;
        // To-do: Get the ERC20 tokens from Tokens.sol contract and send it to investors wallet
        tokenCollections[_nftID].mint(msg.sender, _numberOfTokensInvested);
    }

    function updateInspectionStatus(
        uint256 _nftID,
        bool _passed
    ) public onlyInspector {
        inspectionPassed[_nftID] = _passed;
    }

    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
