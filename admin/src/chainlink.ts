import { stringify } from "@iarna/toml";
import { v4 } from "uuid";
//#region Chainlink interface
function escape(src: string) {
  return src.replace('"', '"');
}
export type ChainlinkDOTGraph = {
  definitions: Record<string, Record<string, any>>;
  steps: string[][];
};
export function command(commands: string[]) {
  const prepend = `docker exec chainlink /bin/bash -c "\
    chainlink admin login --file /chainlink/.api &&`;
  const append = '"';
  return [
    prepend,
    commands.map((command) => command.replace('"', '"')).join(" ; "),
    append,
  ].join(" ");
}
export default command;
export function createEVMNode({
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
}) {
  return `chainlink nodes evm create \
        --name ${name} \
        --type ${type} \
        --chain-id ${chainId} \
        --ws-url ${wsUrl} \
        --http-url ${httpUrl}`;
}
export function createBridge({ name, url }: { name: string; url: string }) {
  return `chainlink bridges create \
        --name ${name} \
        --url ${url} \
  `;
}
export function compileDOTGraph(graph: ChainlinkDOTGraph) {}
export function createJobToml({
  type = "directrequest",
  contractAddress,
  evmChainId,
  externalJobId = v4(),
  requesters,
  graph,
  minContractPaymentLinkJuels,
}: {
  type?: string;
  name: string;
  evmChainId: number;
  contractAddress: string;
  externalJobId?: string;
  requesters?: string[];
  graph: ChainlinkDOTGraph;
  minContractPaymentLinkJuels?: number;
}) {
  const observationSource = compileDOTGraph(graph);
  const obj: Record<string, any> = {
    type,
    schemaVersion: 1,
    evmChainId,
    contractAddress,
    externalJobId,
    minContractPaymentLinkJuels,
    observationSource,
  };
  const toml = stringify(obj);
  return toml;
}
export function createJob(o: {
  type?: string;
  name: string;
  evmChainId: number;
  contractAddress: string;
  externalJobId?: string;
  requesters?: string[];
  graph: ChainlinkDOTGraph;
  minContractPaymentLinkJuels?: number;
}) {
  const toml = createJobToml(o);
  return `chainlink nodes job create --toml ${escape(toml)}`;
}
//#endregion
