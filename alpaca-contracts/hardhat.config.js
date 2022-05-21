
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

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {compilers: [{version:"0.6.6"}, {version:"0.8.7"}]},
  networks: {
    hardhat: {
      chainId: 1337,
    },
    polygonMumbai: {
      url: process.env.ALCHEMY_MUMBAI,
      accounts: [process.env.PK],
    },
    kovan: {
      url: process.env.ALCHEMY_KOVAN,
      accounts: [process.env.PK],
    },
    polygon:{
      url: process.env.ALCHEMY_POLYGON,
      accounts: [process.env.PK],
    }
  },
  contractSizer: {
    runOnCompile: true,
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGON_API,
      kovan: process.env.KOVAN_API,
      polygon: process.env.POLYGON_API,
    },
  },
};