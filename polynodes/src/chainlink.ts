import { stringify } from "@iarna/toml";
import { writeFileSync } from "fs";
import { NodeSSH } from "node-ssh";
import { basename } from "path";
import { v4 } from "uuid";
import { ChainlinkDOTGraph } from "./dotgraph";

//#region Chainlink core functions
export async function login(ssh: NodeSSH) {
  const cmd = "admin login --file /chainlink/.api";
  const { stdout: result, stderr: err } = await command(ssh, cmd);
  if (err.includes("[ERROR]")) console.error("error from login", err);
  return result;
}
export function command(ssh: NodeSSH, command: string) {
  const prefix = "docker exec chainlink chainlink --json ";
  const fullCommand = `${prefix} ${command}`;
  console.log("Running chainlink command", fullCommand);
  return ssh.execCommand(fullCommand);
}
export async function copy(
  ssh: NodeSSH,
  sourcePath: string,
  targetName?: string
) {
  if (!targetName) targetName = basename(sourcePath);
  const temppath = `/chainlink/${targetName}`;
  await ssh.putFile(sourcePath, temppath);
  const cpCommand = `docker cp ${temppath} chainlink:${temppath}`;
  await ssh.execCommand(cpCommand);
  return temppath;
}
//#endregion
//#region Chains
export async function createEVMChain(
  ssh: NodeSSH,
  chainId: string,
  options: Record<string, any> = {}
) {
  const { stdout: json } = await command(
    ssh,
    `chains evm create -id ${chainId} '${JSON.stringify(options)}'`
  );
  try {
    return JSON.parse(json);
  } catch (e) {
    throw new Error(json);
  }
}
export const Chains = {
  evm: { create: createEVMChain },
};
//#endregion
//#region Nodes
export async function createEVMNode(
  ssh: NodeSSH,
  {
    name,
    type,
    chainId,
    wsUrl,
    httpUrl,
  }: {
    name: string;
    type: "primary" | "secondary";
    chainId: number;
    wsUrl: string;
    httpUrl?: string;
  }
) {
  const { stdout: json } = await command(
    ssh,
    `nodes evm create \
        --name ${name} \
        --type ${type} \
        --chain-id ${chainId} \
        --ws-url ${wsUrl} \
        --http-url ${httpUrl}`
  );
  const obj = JSON.parse(json);
  return obj;
}
export const Nodes = {
  evm: {
    create: createEVMNode,
  },
};
//#endregion
//#region Bridges
export type ChainlinkBridge = {
  name: string;
  url: string;
  confirmations: number;
  incomingToken: string;
  outgoingToken: string;
  minimumContractPayment: string;
  createdAt: string;
};
export async function createBridge(
  ssh: NodeSSH,
  {
    name,
    url,
    confirmations = 0,
    minimumContractPayment = "0",
  }: {
    name: string;
    url: string;
    confirmations?: number;
    minimumContractPayment?: string;
  }
) {
  const json = JSON.stringify({
    name,
    url,
    confirmations,
    minimumContractPayment,
  });
  const { stdout: jsonOut, stderr: errorOut } = await command(
    ssh,
    `bridges create '${json}'`
  );
  try {
    const bridge = <ChainlinkBridge>JSON.parse(jsonOut);
    return bridge;
  } catch (e) {
    console.log("Error parsing bridge", e);
    console.log("Raw output from bridge", jsonOut);
    console.log("Raw error from bridge", errorOut);
  }
}
export async function getBridge(ssh: NodeSSH, id: number) {
  const { stdout: jsonOut } = await command(ssh, `bridges show ${id}`);
  const obj = <ChainlinkBridge>JSON.parse(jsonOut);
  return obj;
}
export async function deleteBridge(ssh: NodeSSH, id: number) {
  const { stdout: jsonOut } = await command(ssh, `bridges delete ${id}`);
  const obj = <ChainlinkBridge>JSON.parse(jsonOut);
  return obj;
}
export async function listBridges(ssh: NodeSSH) {
  const { stdout: jsonOut } = await command(ssh, `bridges list`);
  try {
    const obj = <ChainlinkBridge[]>JSON.parse(jsonOut);
    return obj;
  } catch (e) {
    console.error("Error output", jsonOut);
    throw e;
  }
}
export const Bridges = {
  list: listBridges,
  create: createBridge,
  get: getBridge,
  delete: deleteBridge,
};
//#endregion
//#region Jobs
export type ChainlinkJobDefinition = {
  type: "directrequest";
  name: string;
  evmChainID: number;
  contractAddress: string;
  externalJobID?: string;
  requesters?: string[];
  graph: ChainlinkDOTGraph;
  minContractPaymentLinkJuels?: number;
  minIncomingConfirmations?: number;
  maxTaskDuration?: string;
};
export function createJobToml({
  type = "directrequest",
  contractAddress,
  evmChainID,
  externalJobID = v4(),
  requesters,
  name,
  graph,
  minContractPaymentLinkJuels,
  minIncomingConfirmations,
  maxTaskDuration,
}: ChainlinkJobDefinition) {
  const observationSource = graph.toString();
  const obj: Record<string, any> = {
    type,
    name,
    schemaVersion: 1,
    evmChainID, //: new Number(evmChainID).toString(),
    contractAddress,
    externalJobID,
    minContractPaymentLinkJuels,
    observationSource,
    minIncomingConfirmations,
    maxTaskDuration,
    requesters,
  };
  const toml = stringify(obj);
  return toml;
}
export async function createJob(
  ssh: NodeSSH,
  o: {
    type: ChainlinkJobDefinition["type"];
    name: string;
    evmChainID: number;
    contractAddress: string;
    externalJobID?: string;
    requesters?: string[];
    graph: ChainlinkDOTGraph;
    minContractPaymentLinkJuels?: number;
  }
) {
  const toml = createJobToml(o);
  console.log("Creating job with toml", toml);
  const jobFile = `/tmp/${o.name}.toml`;
  writeFileSync(jobFile, toml);
  const temppath: string = await copy(ssh, jobFile);
  const createCommand = `jobs create ${temppath}`;
  const createResult = await command(ssh, createCommand);
  const { stdout: json, stderr: err } = createResult;
  if (json.startsWith("Response")) {
    //That's not good
    const pieces = json.split("', ");
    //turn into object
    const resultObject = pieces.reduce((o, piece) => {
      const key = piece.substring(0, piece.indexOf(":"));
      const value = piece.substring(piece.indexOf(":") + 2, piece.length);
      o[key] = value.replace(/^'/, "").trim();
      return o;
    }, {} as Record<string, any>);
    const errorObj = JSON.parse(resultObject.Response);
    const message = errorObj.errors
      .map(({ detail }: { detail: string }) => detail)
      .join("; ");
    throw new Error(message);
  }

  const obj = <{ id: string }>JSON.parse(json);
  return obj.id;
  // const { externalJobID } = <{ externalJobID: string }>JSON.parse(json);
  // return externalJobID.replace(/-/g, "");
}
export async function deleteJob(ssh: NodeSSH, id: string) {
  const { stdout: jsonOut } = await command(ssh, `jobs delete ${id}`);
  const _ = JSON.parse(jsonOut);
  return;
}
export async function listJobs(ssh: NodeSSH) {
  const { stdout: jsonOut } = await command(ssh, `jobs list`);
  const obj = JSON.parse(jsonOut);
  return obj;
}
export async function getJob(ssh: NodeSSH, id: string) {
  const { stdout: jsonOut } = await command(ssh, `jobs show ${id}`);
  const obj = JSON.parse(jsonOut);
  return obj;
}
export const Jobs = {
  list: listJobs,
  get: getJob,
  create: createJob,
  delete: deleteJob,
};
export type ChainlinkKeyObject = {
  evmChainID: string;
  address: string;
  ethBalance: string;
  linkBalance: string;
  isFunding: boolean;
  createdAt: string;
  updatedAt: string;
  maxGasPriceWei: string;
};
export const listEthKeys = async (ssh: NodeSSH) => {
  const { stdout: jsonOut, stderr } = await command(ssh, `keys eth list`);
  try {
    const obj = <ChainlinkKeyObject[]>JSON.parse(jsonOut);
    return obj;
  } catch (e) {
    console.log(
      "I could not parse the output from the keys eth list command",
      jsonOut,
      stderr
    );
    throw e;
  }
};
export const Keys = {
  listEth: listEthKeys,
};
//#endregion
