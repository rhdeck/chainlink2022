import abi from "./src/utils/Keepers.json";
import { ethers } from "ethers";

const provider = new ethers.providers.AlchemyProvider("maticmum")
const dappAddress = "0x0ddFd0d1D2a31F3bE60ffD18882462EfE5882D71";
const contract = new ethers.Contract(dappAddress, abi, provider);

export default contract;
