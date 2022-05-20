import { stringify } from "@iarna/toml";
import { writeFileSync } from "fs";
import { NodeSSH } from "node-ssh";
import { basename } from "path";
import { v4 } from "uuid";
import { ChainlinkDOTGraph } from "./dotgraph";
function escape(src: string) {
  return src.replace(/"/g, '\\"');
}

//#region Chainlink interface
export async function login(ssh: NodeSSH) {
  const cmd = "admin login --file /chainlink/.api";
  const { stdout: result, stderr: err } = await command(ssh, cmd);
  if (err) console.error("error from login", err);
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
  const { stdout: jsonOut } = await command(ssh, `bridges create '${json}'`);
  console.log("Raw output from bridge", jsonOut);
  const bridge = <ChainlinkBridge>JSON.parse(jsonOut);
  return bridge;
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
  const obj = <ChainlinkBridge[]>JSON.parse(jsonOut);
  return obj;
}
//#endregion
//#region Jobs
export type ChainlinkJobDefinition = {
  type?: string;
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
    type?: string;
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
  return JSON.parse(json);
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
//#endregion
