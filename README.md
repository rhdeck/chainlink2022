# PolyNodes
![alt text](assets/Polynodes%20logo.png)
Chainlink Nodes - On Easy. 

We make running Chainlink Oracle Nodes easy and inexpensive for use on L2 Chains. 
## Mission
Currently building a node on chainlink is hard and somewhat expensive. But neither needs to be the case, especially when serving L2 chains like Polygon. Polynodes makes it easy to add your own nodes to talk to the external services that will help your project. We make advanced structures easy. The goal is 10,000 nodes that could serve the chain on a variety of useful applications.

The reference implementation our service connecting financial data from [Alpaca](https://alpaca.market) to Polygon via price feeds managed by keepers as well as on-demand data available via a useful library implemented on both Mumbai and Polygon.

We will show how this implementation works to the community to make it easy to deploy inexpensive Chainlink nodes that can serve interesting applications in these low-gas-cost environments. 
## Usage

## Components
This project is designed as a monorepo. Key projects:
1. Documentation for building an inexpensive Chainlink node using digital ocean
2. Our reference external adapter that maximizes simplification
3. Our library that makes it easy to talk with our oracles to get the data both in the price feeds as well as on-demand
4. A sample dapp for viewing the alpaca price feeds.

## Development notes

<https://mumbai.polygonscan.com/address/0xA47bD6B65B7081F42101112472e9F4cdBE71d999#events> - has keepers counter
<https://mumbai.polygonscan.com/address/0xB142232e8839DEaBA6DFd1285061B590a2545Ca3#events> -- without keepers just apiconsumer
