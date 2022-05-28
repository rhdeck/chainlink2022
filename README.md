# PolyNodes
![alt text](assets/Polynodes%20logo.png)
Chainlink Nodes - On Easy. 

We make running Chainlink Oracle Nodes easy and inexpensive for use on L2 Chains. 
## Our Mission
Off-chain communication is one of the more challenging parts of working with smart contracts. Chainlink does a lot to standardize how we can make those work. But still, building a node on chainlink is hard and somewhat expensive. But neither needs to be the case!  

We see an opportunity to make building and working with chainlink nodes inexpensive and easy, especially when serving L2 chains like Polygon. Polynodes makes it easy to add your own nodes to talk to the external services that will help your project. We make advanced structures easy. 

We would like to see 10,000 nodes that could serve various chains on a variety of useful applications. We want it to be as easy as click, click, and provide just enough Javascript to run your request. 

## Usage

To get started with polynodes, one can just access via Polynodes.xyz to build a new node. Or you can roll your own polynodes service using our source code. 

To create a new node:
1. Navigate to https://polynodes.xyz
2. Click "Nodes"
3. Click "Create Node"
4. Provide a valid name (alphanumeric only please) and the public key/address of the wallet you would like to be the owner of your oracle
5. Get a sandwich. In around five minutes, you have a node, an oracle on Mumbai that is attached to that node, and that oracle address belongs to you! 
6. Click the node to view its details
7. Click "Create Job"
8. Give the job a name and some valid code to run. We load fetch into memory so you can have something as simple as:
```javascript
const response = await fetch("https://My_service.com"); // Add whatever header or other info in the second argument
const obj = await response.json();
const retvalue = obj.price; // or whatever the value is
return retvalue;
```

## Reference Implementation
[alpaca.polynodes.xyz](https://alpaca.polynodes.xyz) is a DeFi [keeper](https://docs.chain.link/docs/chainlink-keepers/introduction/)-enabled price feed for equities pulled from [Alpaca](https://alpaca.markets). We use the keeper for regular price updates, and allow people to add the price feeds they would like to see in there for a small fee that helps pay for the feed on an ongoing basis. This decentralized contract allows people to make informed decisions based on offchain data with very low fees because the gas is so cheap on L2.

The reference implementation shows how much power there is in using the simplified keepers network plus the simplified Polynodes interface for making the regular requests. We're quite excited at how this could make real DAOs work much more effectively and efficiently on Polygon. 

## Limitations
1. Currently the full service is only for Mumbai, but we have the code ready for Polygon Mainnet - just didn't want to activate that with 'real money' while the reference is open to the public and unauthenticated. 
2. The node is setup is for Mumbai and Polygon, but there's no reason it cannot be extended to other chains, like Avalanche or Mainnet. 
3. Since this is on a trial DigitalOcean account, we can only have under 10 live nodes at a time. 

The reference implementation our service connecting financial data from [Alpaca](https://alpaca.market) to Polygon via price feeds managed by keepers as well as on-demand data available via a useful library implemented on both Mumbai and Polygon.

We will show how this implementation works to the community to make it easy to deploy inexpensive Chainlink nodes that can serve interesting applications in these low-gas-cost environments. 

## Our challenges
1. Making nodes is complicated! And managing them securely is involved. Getting both of these pieces going was a significant technical challenge. 
2. We wanted to make the [reference implementation](https://alpaca.polynodes.xyz) as easy as possible to use. This focused us on UX issues that benefited both the main polynodes site. We are grateful to the [Finity project](https://finity.polygon.technology) for giving us a design direction so we could focus on engineering. 
3. We used the Chainlink CLI for this prototype, but this is limited compared the GraphQL API the Operator UI uses under the hood. For example, getting task run information is exposed through the GraphQL but not the CLI. (We're doing something about it! See next steps below)

## What We're Proud Of
This was a complicated, multi-part product that required expertise from blockchain to devops. We learned a ton from each other and the community. This initiative can make Chainlink and blockchain technology in general a lot more accessible and usable to a wider audience of people. For under a dollar ([or even a MATIC at prices as of this writing](https://coinmarketcap.com/currencies/polygon/)) per day, one can have a chainlink node of one's own, and make managing it easy. 

## Components
This project is designed as a monorepo. Key components:

### Core Polynodes
1. `polynodes` is the core library for the Polynodes node deployment and management API. 
2. `polynodes-api` is the serverless deployment of that API as REST endpoints using Serverless Framework and AWS Lambda
3. `polynodes-contracts` contains source code to create the Oracle contract as part of generating a Polynode. 
4. `polynodes-site` is a Finity-enabled Nextjs interface for deploying and managing Polynode oracle servers and jobs. (deployed via [Fleek](https://fleek.co))

### Reference Implementation with Alpaca
1. `alpaca-contracts` The on-chain code for the alpaca price feed. Note that the list of equities to track is managed in the keeper. The price feed itself submits requests to the oracle.
2. `alpaca-site` is a Finity-enabled Nextjs interface for viewing current prices and keeping it all alive. (deployed via [Fleek](https://fleek.co))

## Where we're going
1. There are too few Chainlink nodes on L2. We plan to make interchain and offchain communication easy for everyone - maybe the easiest part of the process. 
2. We will move more into making the system low-code and potentially no-code. 
3. Currently we only support direct request jobs, but there's awesome opportunity to enable cron-based and external initiation so contracts can respond to events. 
4. We will move to the GraphQL API for deep integration with the Chainlink subsystems so we can surface the full control plane and reporting - like showing task runs.
5. The nodes are set up to be inexpensive at the price of redundancy. We can make the system more resilient and decentralized by extending to other data centers at Digital Ocean, and other virtual server vendors (looking at you, [linode](https://linode.com))
## Thanks
We are grateful to the Chainlink team for putting together the hackathon that gave us the opportunity and inspiration to work on this project! 

## The Polynodes Team
* [Akshay](https://github.com/akshay-rakheja)
* [Ray](https://github.com/rhdeck)
* [Rishabh](https://github.com/rishbruh)
* [Robert](https://github.com/robertreinhart)
