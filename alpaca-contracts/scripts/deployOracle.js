// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
// const {ethers} = require("ethers");

const showEvents = (receipt) => {
  if (receipt.events) {
    console.log(
      "events",
      receipt.events.map(({ eventSignature, args }) => ({
        eventSignature,
        args,
      }))
    );
  } else {
    console.log("No events");
    console.log(receipt);
  }
};

async function main(nodeWallet, userWallet) {
  
    // We get the Oracle contract to deploy and deploy it
    const Oracle = await hre.ethers.getContractFactory("Oracle");
    const oracle = await Oracle.deploy();
    await oracle.deployed();
    console.log("Oracle deployed to:", oracle.address);

    //Authorize the node wallet address to fulfill the Oracle requests
    const txn_setnode = await oracle.setFulfillmentPermission(nodeWallet, true);
    const receipt_setnode = await txn_setnode.wait();
    showEvents(receipt_setnode);

    //Authorize the node wallet address to fulfill the Oracle requests
    const txn_setOwner = await oracle.transferOwnership(userWallet);
    const receipt_setOwner = await txn_setOwner.wait();
    showEvents(receipt_setOwner);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
console.log(process.argv);
const nodeWallet = process.argv[2];
const userWallet = process.argv[3];

main(nodeWallet, userWallet)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
