import abi from "./src/utils/EquitiesPriceFeed.json";
import { ethers } from "ethers";

const provider = new ethers.providers.InfuraProvider("maticmum")
const dappAddress = "0xC728A789D4b698a916FD03E159d535b2984c92F8";
const contract = new ethers.Contract(dappAddress, abi, provider);

export default contract;
