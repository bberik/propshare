//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "./Tokens.sol";

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Investment {
    address public nftAddress;

    struct NftData {
        address payable owner;
        address inspector;
        bool inspectionPassed;
        uint256 numberOfTotalTokens;
        bool isListed;
        uint256 totalPrice;
        uint256 tokenPrice;
        uint256 numberOfAvailableTokens;
        Token tokenCollection;
    }

    mapping(uint256 => NftData) public nftData;
    mapping(uint256 => mapping(address => uint256)) public investors;

    constructor(address _nftAddress) {
        nftAddress = _nftAddress;
    }

    function list(
        uint256 _nftID,
        uint256 _totalPrice,
        uint256 _sharedPersentage,
        string memory _name,
        string memory _symbol,
        address _inspector
    ) public payable {
        require(
            _sharedPersentage <= 75 && _sharedPersentage >= 20,
            "Owner should keep at least 25% of the property, while offering at least 20% of property shares"
        ); // hardcoded

        require(
            _totalPrice > 0,
            "Total value of the property should be greater than 0"
        );

        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);

        nftData[_nftID].isListed = true;
        nftData[_nftID].inspector = _inspector;
        nftData[_nftID].owner = payable(msg.sender);
        nftData[_nftID].totalPrice = _totalPrice;
        nftData[_nftID].numberOfTotalTokens = _sharedPersentage * 100; //hardcoded number of tokens (have to make it either input or global variable)
        nftData[_nftID].numberOfAvailableTokens = nftData[_nftID]
            .numberOfTotalTokens;
        nftData[_nftID].tokenPrice = _totalPrice / 10000; // hardcoded (each token is 0.01% of the property value)

        Token newTokenCollection = new Token(_symbol, _name);
        nftData[_nftID].tokenCollection = newTokenCollection;
    }

    function invest(
        uint256 _nftID,
        uint256 _numberOfTokensInvested
    ) public payable {
        require(
            nftData[_nftID].inspectionPassed == true,
            "The property didn't pass the inspection check yet, cannot be invested"
        );
        require(
            _numberOfTokensInvested > 0 &&
                _numberOfTokensInvested <=
                nftData[_nftID].numberOfAvailableTokens,
            "Number of tokens should be greater than zero and less than number of available tokens"
        );
        require(
            msg.value == _numberOfTokensInvested * nftData[_nftID].tokenPrice,
            "Not exact amount of Ether transfered to purchase tokens"
        );
        investors[_nftID][msg.sender] = _numberOfTokensInvested;
        nftData[_nftID].numberOfAvailableTokens -= _numberOfTokensInvested;
        nftData[_nftID].tokenCollection.mint(
            msg.sender,
            _numberOfTokensInvested
        );

        (bool success, ) = payable(nftData[_nftID].owner).call{
            value: msg.value
        }("");
        require(success);
    }

    function updateInspectionStatus(uint256 _nftID, bool _passed) public {
        require(
            msg.sender == nftData[_nftID].inspector,
            "Only inspector can update the inspection status"
        );
        nftData[_nftID].inspectionPassed = _passed;
    }

    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
