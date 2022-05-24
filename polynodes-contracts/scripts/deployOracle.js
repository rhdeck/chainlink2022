// import { ethers } from "ethers" assert {type: "module"};
// import {bytecode} from '../config.json';
// import {ethers} from 'ethers';
// import '../config.json';
const config = require("../config.json");
// const abi_file = require("../Oracle_abi2.json");
const ethers = require('ethers');
require('dotenv').config();

// 1. Import the contract file
// import { bytecode, abi } from '../config.js';
// import {abi} from '../Oracle_abi.json';
// const config = require('../config.json');
// const ethers = require('ethers');

// 2. Add the Ethers provider logic here:
// {...}
// console.log(config);
// provider = new ethers.AlchemyProvider("maticmum", process.env.ALCHEMY_MUMBAI_KEY);
// console.log(bytecode_file.bytecode);
bytecode = config.bytecode;
abi = config.abi;
console.log(bytecode);
console.log(abi);
const provider = new ethers.providers.AlchemyProvider("maticmum", process.env.ALCHEMY_MUMBAI_KEY);
// console.log(provider);

// 3. Create account variables
const account_from = {
  privateKey: process.env.PK,
};

// console.log(config);
// 4. Save the bytecode and ABI
// const bytecode = config.bytecode;
// const abi = config.abi;
// console.log(bytecode);
// 5. Create wallet
let wallet = new ethers.Wallet(account_from.privateKey, provider);

// 6. Create contract instance with signer
const oracle = new ethers.ContractFactory(abi, bytecode, wallet);

// const dappAddress = "0xdDFBCE490Afda6a4B952609216CB8E3bA64CD261";
// const contract = new ethers.Contract(dappAddress, abi, wallet);

// 7. Create deploy function
const deploy = async () => {
  console.log(`Attempting to deploy from account: ${wallet.address}`);

  // 8. Send tx (initial value set to 5) and wait for receipt
  const contract = await oracle.deploy("0x326C977E6efc84E512bB9C30f76E30c160eD06FB");
  await contract.deployed();
  console.log(`Contract deployed at address: ${contract.address}`);

  // Authorize the node wallet address to fulfill the Oracle requests
  // console.log(process.argv[2]);
  //   const txn_setnode = await contract.setFulfillmentPermission(
  //     process.argv[2],
  //     true,{gasLimit: 250000});
  //   const receipt_setnode = await txn_setnode.wait();
  //   console.log(
  //     "Fulfillment persmissions set for node address:",
  //     process.argv[2]
  //   );

  //   //Authorize the node wallet address to fulfill the Oracle requests
  //   const txn_setOwner = await contract.transferOwnership(process.argv[3]);
  //   const receipt_setOwner = await txn_setOwner.wait();
  //   console.log("Ownership transferred to user wallet:", process.argv[3]);

};

// 9. Call the deploy function
deploy();