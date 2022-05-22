import { ChainlinkVariable } from "./chainlinkvariable";
import { escape } from "./utils";
//#region DOT Notation
export type ChainlinkDOTGraphDefinitionBase = Record<
  string,
  | string
  | number
  | boolean
  | ChainlinkVariable
  | Record<
      string,
      string | number | boolean | ChainlinkVariable | Record<string, any>
    >
>;
export type ChainlinkDOTGraphDefinition = ChainlinkDOTGraphDefinitionBase & {
  type: string;
  escape?: true;
};
export type ChainlinkDOTGraphDefinitionObject = {
  name: string;
  data: ChainlinkDOTGraphDefinition;
};
export class ChainlinkDOTGraph {
  definitions: Record<string, ChainlinkDOTGraphDefinition> = {};
  steps: string[][] = [[]];
  constructor(
    definitions: ChainlinkDOTGraph["definitions"] = {},
    steps: ChainlinkDOTGraph["steps"] = [[]]
  ) {
    this.definitions = definitions;
    this.steps = steps;
  }
  addWithName(name: string, data: ChainlinkDOTGraphDefinition) {
    return addToGraph(this, name, data);
  }
  add(
    data:
      | ((graph: ChainlinkDOTGraph) => ChainlinkDOTGraph)
      | ChainlinkDOTGraphDefinitionObject
  ) {
    if (typeof data === "function") return data(this);
    else return addToGraph(this, data.name, data.data);
  }
  toString() {
    return compileDOTGraph(this);
  }
  static Steps: typeof Steps;
}
export function addToGraph(
  graph: ChainlinkDOTGraph,
  name: string,
  data: ChainlinkDOTGraphDefinition
) {
  graph.definitions[name] = data;
  graph.steps[0].push(name);
  return graph;
}
export function stringifyDOTJSON(src: Record<string, any>) {
  // return JSON.stringify(src, null, 2);
  //let's instead iterate over them
  return (
    "{" +
    Object.entries(src).map(([key, value]) => {
      let newValue: string = "null";
      switch (typeof value) {
        case "string":
          newValue = value.startsWith("$")
            ? escape(value)
            : `"${escape(value)}"`;
          break;
        case "number":
        case "boolean":
          newValue = value.toString();
          break;
        case "object":
          if (value instanceof ChainlinkVariable) {
            newValue = value.toString();
          } else {
            newValue = stringifyDOTJSON(value);
          }
          break;
        default:
          console.warn("Hit a type I don't know how to manage", value);
      }
      return `"${key}": ${newValue}`;
    }) +
    "}"
  );
}
export function stringifyDOTDefinition(
  src: ChainlinkDOTGraphDefinition,
  padding: number
) {
  const attrs = Object.entries(src).map(([key, value]) => {
    const stringVal =
      typeof value === "object"
        ? value instanceof ChainlinkVariable
          ? value.toString()
          : `"${escape(stringifyDOTJSON(value))}"`
        : typeof value === "string"
        ? `"${escape(value.toString())}"`
        : value.toString();
    // console.log("RHD", key, stringVal, stringVal.startsWith("$"));
    return `${key}=${stringVal}`;
  });
  const totalLength = attrs.reduce((acc, cur) => acc + cur.length, 0);
  if (totalLength < 70 - padding) {
    return `[${attrs.join(" ")}]`;
  } else {
    return `[${attrs.join("\n".padEnd(padding + 2, " "))}\n${" ".padEnd(
      padding,
      " "
    )}]`;
  }
}
export function compileDOTGraph(graph: ChainlinkDOTGraph) {
  const padding =
    Math.max(...Object.keys(graph.definitions).map((key) => key.length)) + 2;
  const definitions = Object.entries(graph.definitions).map(([key, value]) => {
    return `${key.padEnd(padding, " ")}${stringifyDOTDefinition(
      value,
      padding
    )}`;
  });
  const steps = graph.steps.map((innerSteps) => innerSteps.join(" -> "));
  return [definitions.join("\n"), steps.join("\n")].join("\n\n") + "\n";
}
//#endregion
//#region Prebuilt Steps
const decodeLogDOT: ChainlinkDOTGraphDefinition = {
  type: "ethabidecodelog",
  abi: "OracleRequest(bytes32 indexed specId, address requester, bytes32 requestId, uint256 payment, address callbackAddr, bytes4 callbackFunctionId, uint256 cancelExpiration, uint256 dataVersion, bytes data)",
  data: "$(jobRun.logData)",
  topics: "$(jobRun.logTopics)",
};
const decodeLogObj: ChainlinkDOTGraphDefinitionObject = {
  name: "decode_log",
  data: decodeLogDOT,
};

const decodeCborDOT: ChainlinkDOTGraphDefinition = {
  type: "cborparse",
  data: new ChainlinkVariable("decode_log.data", true),
};
const dcodeCborObj: ChainlinkDOTGraphDefinitionObject = {
  name: "decode_cbor",
  data: decodeCborDOT,
};

const fetchDOT: ChainlinkDOTGraphDefinition = {
  type: "http",
  method: "GET",
  url: "$(decode_cbor.url)",
};
const fetchObj: ChainlinkDOTGraphDefinitionObject = {
  name: "fetch",
  data: fetchDOT,
};

function bridgeDOT(
  name: string,
  requestData: Record<string, any>
): ChainlinkDOTGraphDefinition {
  return { type: "bridge", name, requestData };
}

function bridgeObj(
  name: string,
  requestData: Record<string, any>
): ChainlinkDOTGraphDefinitionObject {
  return { name, data: bridgeDOT(name, requestData) };
}
function friendlyBridgeDOT(
  name: string,
  requestData: Record<string, any>
): ChainlinkDOTGraphDefinition {
  return {
    type: "bridge",
    name,
    requestData: {
      id: new ChainlinkVariable("jobSpec.externalJobId"),
      data: requestData,
    },
  };
}
function friendlyBridgeObj(
  name: string,
  requestData: Record<string, any>
): ChainlinkDOTGraphDefinitionObject {
  return { name, data: friendlyBridgeDOT(name, requestData) };
}

function parseDOT(previousStep: string): ChainlinkDOTGraphDefinition {
  return {
    type: "jsonparse",
    path: "$(decode_cbor.path)",
    data: `$(${previousStep})`,
  };
}
function parseObj(
  previousStep: string = "fetch"
): ChainlinkDOTGraphDefinitionObject {
  return {
    name: "parse",
    data: parseDOT(previousStep),
  };
}

const multiplyDOT = (previous: string): ChainlinkDOTGraphDefinition => ({
  type: "multiply",
  input: "$(" + previous + ")",
  times: 100,
});
const multiplyObj = (previous: string): ChainlinkDOTGraphDefinitionObject => ({
  name: "multiply",
  data: multiplyDOT(previous),
});

const encodeDataUintDOT = (
  previousKey: string
): ChainlinkDOTGraphDefinition => ({
  type: "ethabiencode",
  abi: "(uint256 value)",
  data: { value: "$(" + previousKey + ")" },
});
const encodeDataUintObj = (
  previousKey: string
): ChainlinkDOTGraphDefinitionObject => ({
  name: "encode_data",
  data: encodeDataUintDOT(previousKey),
});

const encodeTxDOT: ChainlinkDOTGraphDefinition = {
  type: "ethabiencode",
  abi: "fulfillOracleRequest(bytes32 requestId, uint256 payment, address callbackAddress, bytes4 callbackFunctionId, uint256 expiration, bytes32 data)",
  data: {
    requestId: "$(decode_log.requestId)",
    payment: "$(decode_log.payment)",
    callbackAddress: "$(decode_log.callbackAddr)",
    callbackFunctionId: "$(decode_log.callbackFunctionId)",
    expiration: "$(decode_log.cancelExpiration)",
    data: "$(encode_data)",
  },
};
const encodeTxObj: ChainlinkDOTGraphDefinitionObject = {
  name: "encode_tx",
  data: encodeTxDOT,
};

const submitTxDOT = (oracleAddr: string): ChainlinkDOTGraphDefinition => ({
  type: "ethtx",
  to: oracleAddr,
  data: new ChainlinkVariable("encode_tx", true),
});
const submitTxObj = (
  oracleAddr: string
): ChainlinkDOTGraphDefinitionObject => ({
  name: "submit_tx",
  data: submitTxDOT(oracleAddr),
});

export const Steps = {
  decode_log: decodeLogObj,
  decode_cbor: dcodeCborObj,
  fetch: fetchObj,
  bridgeBase: bridgeObj,
  friendlyBridge: friendlyBridgeObj,
  parse: parseObj,
  multiply: multiplyObj,
  encode_data_uint: encodeDataUintObj,
  encode_tx: encodeTxObj,
  submit_tx: submitTxObj,
};
ChainlinkDOTGraph.Steps = Steps;
export default ChainlinkDOTGraph;
//#endregion
