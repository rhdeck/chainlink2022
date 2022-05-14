// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./EquitiesPriceFeed.sol";

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * THIS IS AN EXAMPLE CONTRACT WHICH USES HARDCODED VALUES FOR CLARITY.
 * PLEASE DO NOT USE THIS CODE IN PRODUCTION.
 */
contract EquitiesKeeper is ChainlinkClient, KeeperCompatibleInterface, Ownable {
    using Chainlink for Chainlink.Request;

    uint256 public volume;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    bool public isActive;

    mapping(address => bool) private requesters;
    string[] public equities;

    uint256 public counter;

    address private priceFeedContract;

    /**
     * Use an interval in seconds and a timestamp to slow execution of Upkeep
     */
    uint256 public immutable interval = 10;
    uint256 public lastTimeStamp;

    /**
     * Network: Kovan
     * Oracle: 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8 (Chainlink Devrel
     * Node)
     * Job ID: d5270d1c311941d0b08bead21fea7747
     * Fee: 0.1 LINK
     */
    constructor() {
        requesters[msg.sender] = true;
        // setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB); // for mumbai network
        // oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8; // returns bytes32
        // jobId = "d5270d1c311941d0b08bead21fea7747"; //returns bytes32
        // fee = 0.1 * 10**18; // (Varies by network and job)
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        upkeepNeeded = isActive && (block.timestamp - lastTimeStamp) > interval;
        // We don't use the checkData in this example. The checkData is defined when the Upkeep was registered.
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override onlyRequester {
        //We highly recommend revalidating the upkeep in the performUpkeep function
        if (isActive && (block.timestamp - lastTimeStamp) > interval) {
            lastTimeStamp = block.timestamp;
            counter = counter + 1;
            EquitiesPriceFeed priceFeed = EquitiesPriceFeed(priceFeedContract);
            for (uint256 i = 0; i < equities.length; i++) {
                priceFeed.requestPrice(equities[i]);
            }
        }
        // We don't use the performData in this example. The performData is generated by the Keeper's call to your checkUpkeep function
    }

    function setActive(bool newValue) external onlyOwner {
        isActive = newValue;
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

    function addEquity(string memory _equity) public onlyOwner {
        equities.push(_equity);
    }

    function setPriceFeedContract(address _priceFeedContract) public onlyOwner {
        priceFeedContract = _priceFeedContract;
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}