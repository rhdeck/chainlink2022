import config from "./config";
import ethers from "ethers";

export const deployMumbai = async (nodeWallet: string, userWallet: string) => {
  const bytecode = config.bytecode;
  const abi = config.abi;
  const provider = new ethers.providers.AlchemyProvider(
    "maticmum",
    process.env.ALCHEMY_MUMBAI_KEY
  );
  if (!process.env.PK) throw new Error("PK env var not set");
  const account_from = {
    privateKey: process.env.PK,
  };
  let wallet = new ethers.Wallet(account_from.privateKey, provider);
  const oracle = new ethers.ContractFactory(abi, bytecode, wallet);
  console.log(`Attempting to deploy from account: ${wallet.address}`);
  const contract = await oracle.deploy(
    "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"
  ); //Polygon Mumbai Link token address
  await contract.deployed();
  console.log(`Contract deployed at address: ${contract.address}`);

  // Authorize the node wallet address to fulfill the Oracle requests
  const txn_setnode = await contract.setFulfillmentPermission(
    nodeWallet,
    true,
    { gasLimit: 250000 }
  );
  const receipt_setnode = await txn_setnode.wait();
  console.log("Fulfillment persmissions set for node address:", nodeWallet);

  //Authorize the node wallet address to fulfill the Oracle requests
  const txn_setOwner = await contract.transferOwnership(userWallet);
  const receipt_setOwner = await txn_setOwner.wait();
  console.log("Ownership transferred to user wallet:", userWallet);
  return contract.address;
};

export const deployMatic = async (nodeWallet: string, userWallet: string) => {
  console.log("Hi i m deployMatic!");
  const bytecode = config.bytecodeMatic;
  const abi = config.abi;
  const provider = new ethers.providers.AlchemyProvider(
    "matic",
    process.env.ALCHEMY_MATIC_KEY
  );
  if (!process.env.PK) throw new Error("PK env var not set");
  const account_from = {
    privateKey: process.env.PK,
  };
  let wallet = new ethers.Wallet(account_from.privateKey, provider);
  const oracle = new ethers.ContractFactory(abi, bytecode, wallet);
  console.log(`Attempting to deploy from account: ${wallet.address}`);
  const maxPriorityFeePerGas = ethers.BigNumber.from(100 * 10 ** 9);
  const maxFeePerGas = ethers.BigNumber.from(100 * 10 ** 9);
  const gasLimit = ethers.BigNumber.from(2500000);
  const linkAddress = "0xb0897686c545045aFc77CF20eC7A532E3120E0F1";
  console.log(`Deploying the Link address": ${linkAddress}`);
  const contract = await oracle.deploy(linkAddress, {
    maxFeePerGas,
    gasLimit,
    maxPriorityFeePerGas,
  }); //Polygon Mainnet Link token address
  await contract.deployed();
  console.log(`Contract deployed at address: ${contract.address}`);

  // Authorize the node wallet address to fulfill the Oracle requests
  const txn_setnode = await contract.setFulfillmentPermission(
    nodeWallet,
    true,
    { gasLimit, maxFeePerGas, maxPriorityFeePerGas }
  );
  const receipt_setnode = await txn_setnode.wait();
  console.log("Fulfillment persmissions set for node address:", nodeWallet);

  //Authorize the node wallet address to fulfill the Oracle requests
  const txn_setOwner = await contract.transferOwnership(userWallet, {
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
  });
  const receipt_setOwner = await txn_setOwner.wait();
  console.log("Ownership transferred to user wallet:", userWallet);

  return contract.address;
};
