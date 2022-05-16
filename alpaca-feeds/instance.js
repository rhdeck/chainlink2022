import abi from "./src/utils/EquitiesPriceFeed.json";
import { ethers } from "ethers";

const provider = new ethers.providers.AlchemyProvider("maticmum")
const dappAddress = "0xe934b71053845886a5F400E8ad289aA0B3E7B602";
const contract = new ethers.Contract(dappAddress, abi, provider);

export default contract;
