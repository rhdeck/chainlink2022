import abi from "./src/utils/Keepers.json";
import { ethers } from "ethers";

const provider = new ethers.providers.InfuraProvider("maticmum")
const dappAddress = "0xe9139B9A048cf97d792aed5e1546A73f1594A86e";
const contract = new ethers.Contract(dappAddress, abi, provider);

export default contract;
