// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * THIS IS AN EXAMPLE CONTRACT WHICH USES HARDCODED VALUES FOR CLARITY.
 * PLEASE DO NOT USE THIS CODE IN PRODUCTION.
 */
contract CryptoPriceFeed is ChainlinkClient {
    using Chainlink for Chainlink.Request;

    address private oracle;
    bytes32 private priceJobId;
    uint256 private fee;
    mapping(string => uint256) public prices;
    mapping(string => uint256) public blocks;
    // @TODO: Check if the increase in mapping size (more txns/requests) makes it more gassy
    mapping(bytes32 => string) private requests;

    constructor() {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB); // for mumbai network
        oracle = 0xE3a98D9FAAB4a4B338B40A6dF6273Ab520152b8c;
        priceJobId = "f2d37f55b72245128ef2d4ea421cd766";
        fee = 0.1 * 10**18; // (Varies by network and job)
    }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data, then multiply by 1000000000000000000 (to remove decimal places from data).
     */
    function requestPrice(string memory _symbol, string memory _exchange)
        public
        returns (bytes32 requestId)
    {
        Chainlink.Request memory request = buildChainlinkRequest(
            priceJobId,
            address(this),
            this.fulfill.selector
        );

        request.add("symbol", _symbol);
        request.add("exchange", _exchange);

        requests[request.id] = _symbol;
        // Sends the request
        return sendChainlinkRequestTo(oracle, request, fee);
    }

    /**
     * Receive the response in the form of uint256
     */
    function fulfill(bytes32 _requestId, uint256 _returnedPrice)
        public
        recordChainlinkFulfillment(_requestId)
    {
        // volume = _volume;
        string memory _symbol = requests[_requestId];
        prices[_symbol] = _returnedPrice;
        blocks[_symbol] = block.number;
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}
