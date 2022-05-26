// Polynode's Alpaca Equities Price Feed
/*                                                                 
         .((((((((.                            
     ((((((((((((((((((                        
  (((((((.        ((((((((                     
  ((((.              (((((                     
  ((((               /(((,     #####           
  ((((                     ##############      
  ((((                .########## .##########  
  (((((((          ((#######(          ####### 
     ((((((((((((((((######              ##### 
         ((((((((((  /#####              ##### 
                     /#####              ##### 
                     /#####(            ###### 
                     *##########    ########## 
                          ################     
                              #######,         
                                               
                  PolyNodes    
                                               
                                               */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * THIS IS AN EXAMPLE CONTRACT WHICH USES HARDCODED VALUES FOR CLARITY.
 * PLEASE DO NOT USE THIS CODE IN PRODUCTION.
 */
contract EquitiesPriceFeed is ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;

    address public oracle;
    bytes32 public priceJobId;
    uint256 public fee;
    mapping(string => uint256) public prices;
    mapping(string => uint256) public blocks;
    // @TODO: Check if the increase in mapping size (more txns/requests) makes it more gassy
    mapping(bytes32 => string) private requests;
    mapping(address => bool) private requesters;

    constructor() {
        requesters[msg.sender] = true;
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB); // for mumbai network
        oracle = 0xE3a98D9FAAB4a4B338B40A6dF6273Ab520152b8c;
        priceJobId = "c7fbb7667ff6407d9c0e6e3a845efaaa";
        fee = 0.345 * 10**18; // (Varies by network and job)
    }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data, then multiply by 1000000000000000000 (to remove decimal places from data).
     */
    function setJobId(bytes32 _jobId) public onlyRequester {
        priceJobId = _jobId;
    }

    function setFee(uint256 _fee) public onlyRequester {
        fee = _fee;
    }

    function setOracle(address _oracle) public onlyRequester {
        oracle = _oracle;
    }

    function requestPrice(string memory _symbol)
        public
        onlyRequester
        returns (bytes32 requestId)
    {
        Chainlink.Request memory request = buildChainlinkRequest(
            priceJobId,
            address(this),
            this.fulfill.selector
        );

        request.add("symbol", _symbol);
        // Sends the request
        bytes32 _requestId = sendChainlinkRequestTo(oracle, request, fee);
        requests[_requestId] = _symbol;
        return _requestId;
    }

    /**
     * Receive the response in the form of uint256
     */
    function fulfill(bytes32 _requestId, uint256 _returnedPrice)
        public
        recordChainlinkFulfillment(_requestId)
    {
        // volume = _volume;

        string storage _symbol = requests[_requestId];

        prices[_symbol] = _returnedPrice;
        blocks[_symbol] = block.number;
    }

    function getPriceandBlock(string memory _symbol)
        external
        view
        returns (uint256, uint256)
    {
        return (prices[_symbol], blocks[_symbol]);
    }

    modifier onlyRequester() {
        require(
            requesters[_msgSender()] == true,
            "Only Requester: Caller is not a requester"
        );
        _;
    }

    function setRequester(address _requester) public onlyOwner {
        requesters[_requester] = true;
    }

    function isRequester(address _requester) public view returns (bool) {
        return requesters[_requester];
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}
