require('dotenv').config();
const config = require("./config.js");
const {ethers} = require('ethers');

const {deployMumbai, deployMatic} = require('./deployOracle');
(async ()=>{
    // await deployMumbai(process.argv[2],process.argv[3]);
    const contractAddress = await deployMatic(process.argv[2],process.argv[3]);
    const provider = new ethers.providers.AlchemyProvider("matic", process.env.ALCHEMY_MATIC_KEY);
    const account_from = {
    privateKey: process.env.PK,
    };
    let wallet = new ethers.Wallet(account_from.privateKey, provider);
    const oracle = new ethers.Contract(contractAddress, config.abi, provider);

    // const txn = await oracle.getChainlinkToken();
    // const receipt_setOwner = await txn.wait();
    // console.log(txn);
})()


  

