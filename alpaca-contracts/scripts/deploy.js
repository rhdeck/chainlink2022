// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

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

async function main() {
  const new_signer = await hre.ethers.getSigners();
  console.log("Signer is :",new_signer.address);
  // We get the contract to deploy
  const PriceFeed = await hre.ethers.getContractFactory("EquitiesKeeper");
  const priceFeed = await PriceFeed.deploy();

  await priceFeed.deployed();

  console.log("EquitiesKeeper deployed to:", priceFeed.address);

  // const txn = await priceFeed.requestPrice("MATICUSD", "FTXU");
  // //   console.log("we here",txn);
  // const receipt = await txn.wait();
  // showEvents(receipt);    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
