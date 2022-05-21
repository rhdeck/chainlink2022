import abi from "./src/utils/Keepers.json";
import { ethers } from "ethers";

const provider = new ethers.providers.InfuraProvider("maticmum")
const dappAddress = "0x577079b8E3562FEa524Dc99Ea31Abbd58dd5e57a";
const contract = new ethers.Contract(dappAddress, abi, provider);

export default contract;
