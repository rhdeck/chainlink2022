const config = require("./config.js");
const ethers = require("ethers");
require("dotenv").config();

rotateFunds = async () => {
  const provider = new ethers.providers.AlchemyProvider(
    "maticmum",
    process.env.ALCHEMY_MUMBAI_KEY
  );
  const account_from = {
    privateKey: process.env.PK,
  };
  let wallet = new ethers.Wallet(account_from.privateKey, provider);
  // Initialize the contract
  const oracle = new ethers.Contract(
    "0xE3a98D9FAAB4a4B338B40A6dF6273Ab520152b8c",
    config.abi,
    wallet
  );
  // Get the current withdrawable LINK balance of the contract
  const txn = await oracle.withdrawable();
  const withdrawableLink = ethers.utils.formatEther(
    ethers.BigNumber.from(txn.toString())
  );
  console.log(
    "Withdrawable LINK tokens are:",
    ethers.utils.formatEther(ethers.BigNumber.from(txn.toString()))
  );

  // Withdraw LINK tokens from the contract to the owner
  if (withdrawableLink > 2) {
    const txn_withdraw = await oracle.withdraw(
      wallet.address,
      ethers.utils.parseEther(withdrawableLink.toString())
    );
    const receipt_withdraw = await txn_withdraw.wait();
    console.log(
      "Link Tokens trasnffered to owner's Address: ",
      ethers.utils.formatEther(
        ethers.BigNumber.from(withdrawableLink.toString())
      )
    );
  } else {
    console.log("Not enough LINK tokens to withdraw (<2)");
  }

  // Transfer LINK tokens to PriceFeed contract
  const linkTokenAddress = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
  const priceFeedContract = "0xC728A789D4b698a916FD03E159d535b2984c92F8";
  const linkContract = new ethers.Contract(
    linkTokenAddress,
    config.linkABI,
    wallet
  );
  // Checking Link balance in our wallet
  var accountBalance = await linkContract.balanceOf(wallet.address);
  accountBalance = ethers.utils.formatEther(ethers.BigNumber.from(accountBalance.toString()))
  console.log("Link Balance in our Wallet: ", accountBalance);

  if (accountBalance > 5) {

    const transferAmount = ethers.utils.parseEther(
      ((accountBalance -10).toString())
    );
    console.log("Transfer Amount: ", transferAmount);

    const txn_transfer = await linkContract.transfer(
      priceFeedContract,
      transferAmount
    );
    const receipt_transfer = await txn_transfer.wait();
    console.log(
      "Link Tokens transferred to PriceFeed contract: ",
      ethers.utils.formatEther(transferAmount)
    );
  }
  else{
      console.log("Not enough LINK tokens to transfer (<5)");
  }
};

rotateFunds();
