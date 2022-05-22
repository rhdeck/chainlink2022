const { task } = require("hardhat/config");

require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task(
  "deployOracle",
  "Deploys oracle contract, sets node fulfillment permission and transfers ownership to a user wallet"
)
  .addParam("nodeWallet", "Node's wallet address")
  .addParam("userWallet", "User's wallet address")
  .setAction(async (taskArgs, hre) => {
    const Oracle = await hre.ethers.getContractFactory("Oracle");
    const oracle = await Oracle.deploy(
      "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"
    ); //Polygon Mumbai Link token address
    await oracle.deployed();
    console.log("Oracle deployed to:", oracle.address);
    console.log(taskArgs);
    //Authorize the node wallet address to fulfill the Oracle requests
    const txn_setnode = await oracle.setFulfillmentPermission(
      taskArgs.nodeWallet,
      true
    );
    const receipt_setnode = await txn_setnode.wait();
    console.log(
      "Fulfillment persmissions set for node address:",
      taskArgs.nodeWallet
    );

    //Authorize the node wallet address to fulfill the Oracle requests
    const txn_setOwner = await oracle.transferOwnership(taskArgs.userWallet);
    const receipt_setOwner = await txn_setOwner.wait();
    console.log("Ownership transferred to user wallet:", taskArgs.userWallet);
  });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: { compilers: [{ version: "0.6.6" }, { version: "0.8.7" }] },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    // polygonMumbai: {
    //   url: process.env.ALCHEMY_MUMBAI,
    //   accounts: [process.env.PK],
    // },
    // kovan: {
    //   url: process.env.ALCHEMY_KOVAN,
    //   accounts: [process.env.PK],
    // },
    // polygon:{
    //   url: process.env.ALCHEMY_POLYGON,
    //   accounts: [process.env.PK],
    // }
  },
  contractSizer: {
    runOnCompile: true,
  },
  // etherscan: {
  //   apiKey: {
  //     polygonMumbai: process.env.POLYGON_API,
  //     kovan: process.env.KOVAN_API,
  //     polygon: process.env.POLYGON_API,
  //   },
  // },
};
