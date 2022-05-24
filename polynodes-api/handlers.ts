import "./core";
import {
  httpSuccess,
  makeAPIGatewayLambda,
} from "@raydeck/serverless-lambda-builder";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { Agent } from "https";
import { QldbDriver, RetryConfig } from "amazon-qldb-driver-nodejs";
import { v4 as uuid } from "uuid";
import {
  getDroplets,
  getDropletByKey,
  sshTo,
  setGetPrivateKey,
  destroyDroplet,
  createDroplet,
} from "@polynodes/core/lib/do";
import { Jobs, Bridges } from "@polynodes/core/lib/chainlink";
import { uploadTemplate } from "@polynodes/core/lib/externalAdapters";
import DOTGraph from "@polynodes/core/lib/dotgraph";
import { compileTemplate, deploy } from "@polynodes/core/lib/externalAdapters";
import { ChainlinkVariable } from "@polynodes/core/lib/chainlinkvariable";
import { getAssetPath } from "@raydeck/local-assets";
//#region QLDB intialization
const maxConcurrentTransactions = 10;
const retryLimit = 4;
//Reuse connections with keepAlive
const agentForQldb: Agent = new Agent({
  keepAlive: true,
  maxSockets: maxConcurrentTransactions,
});

const serviceConfigurationOptions = {
  region: process.env.region || process.env.AWS_REGION,
  httpOptions: {
    agent: agentForQldb,
  },
};
const retryConfig: RetryConfig = new RetryConfig(retryLimit);
const ledgerName = process.env.ledgerName || "myLedger";
const qldbDriver: QldbDriver = new QldbDriver(
  ledgerName,
  serviceConfigurationOptions,
  maxConcurrentTransactions,
  retryConfig
);
//#endregion
//#region Helper Functions
const makeTables = async () => {
  const tableNames = await qldbDriver.getTableNames();
  console.log(tableNames);
  if (!tableNames.includes("Nodes")) {
    //Build transmissions table
    await qldbDriver.executeLambda(async (txn) => {
      await txn.execute(`CREATE TABLE Nodes`);
      await txn.execute(`CREATE INDEX ON Nodes (id)`);
      await txn.execute(`CREATE INDEX ON Nodes (owner)`);
    });
  }
  if (!tableNames.includes("Jobs")) {
    //Build transmissions table
    await qldbDriver.executeLambda(async (txn) => {
      await txn.execute(`CREATE TABLE Jobs`);
      await txn.execute(`CREATE INDEX ON Jobs (id)`);
      await txn.execute(`CREATE INDEX ON Jobs (nodeId)`);
    });
  }
};
const isAuthenticated = (
  event: APIGatewayProxyEvent,
  apiKey?: string
): boolean => {
  if (!apiKey) apiKey = process.env.internalKey;
  if (event.headers.Authorization == "Bearer " + apiKey) {
    return true;
  }
  return false;
};
const makeAPIFunc = (
  func: Handler<APIGatewayProxyEvent, APIGatewayProxyResult>,
  apiKey?: string
) => <Handler<APIGatewayProxyEvent, APIGatewayProxyResult>>(async (
    event,
    context,
    callback
  ) => {
    if (!isAuthenticated(event, apiKey)) {
      return {
        statusCode: 401,
        body: "Unauthorized",
      };
    }
    await makeTables();
    return func(event, context, callback);
  });
const getNodeRecord = async (key: string) => {
  const rxResult = await qldbDriver.executeLambda(async (txn) => {
    const result = await txn.execute(`SELECT * from Nodes WHERE id = '${key}'`);
    return result.getResultList();
  });
  if (!rxResult) throw new Error("no key found");
  const record = rxResult[0];
  return record;
};
const getPrivateKey = async (key: string) => {
  const record = await getNodeRecord(key);
  const privateKey = record.get("privateKey")?.stringValue();
  if (!privateKey) throw new Error("no private key found");
  return privateKey;
};
setGetPrivateKey(getPrivateKey);
//#endregion
//#region API Endpoints
export const listNodes = makeAPIGatewayLambda({
  path: "/nodes",
  method: "get",
  func: makeAPIFunc(async (event) => {
    //list them all
    const droplets = await getDroplets();
    const nodes = droplets
      .map((droplet) => {
        const network = droplet.networks.v4.find(
          ({ type }: { type: string }) => type === "public"
        );
        if (network)
          return { key: droplet.key, ip: network.ip_address, status: "" };
        else return { key: droplet.key, ip: "", status: "" };
      })
      .filter(({ ip }) => ip !== "");
    for (const node of nodes) {
      try {
        const record = await getNodeRecord(node.key);
        node.status = record.get("status")?.stringValue() || "";
      } catch (e) {}
    }
    return httpSuccess(nodes);
  }),
});

export const getNode = makeAPIGatewayLambda({
  path: "/nodes/{nodeId}",
  method: "get",
  func: makeAPIFunc(async (event) => {
    const nodeId = event.pathParameters?.nodeId;
    if (!nodeId) {
      return {
        statusCode: 400,
        body: "Missing nodeId",
      };
    }
    const droplet = await getDropletByKey(nodeId);
    const record = await getNodeRecord(nodeId);
    const fields = record
      .allFields()
      .reduce((o, [field, value]) => ({ ...o, [field]: value }), {});
    delete (fields as { privateKey: any }).privateKey;
    return httpSuccess({
      ...fields,
      droplet,
    });
  }),
});

export const ip = makeAPIGatewayLambda({
  path: "/nodes/{nodeId}/ip",
  method: "get",
  func: makeAPIFunc(async (event) => {
    const nodeId = event.pathParameters?.nodeId;
    if (!nodeId) {
      return {
        statusCode: 400,
        body: "Missing nodeId",
      };
    }
    const droplet = await getDropletByKey(nodeId);
    if (!droplet) return { statusCode: 404, body: "Node not found" };
    const network = droplet.networks.v4.find(
      ({ type }: { type: string }) => type === "public"
    );
    if (!network) return { statusCode: 404, body: "Network IP not found" };

    return { statusCode: 200, body: network.ip_address };
  }),
});

export const ls = makeAPIGatewayLambda({
  path: "/nodes/{nodeId}/ls",
  method: "get",
  func: makeAPIFunc(async (event) => {
    const nodeId = event.pathParameters?.nodeId;
    if (!nodeId) {
      return {
        statusCode: 400,
        body: "Missing nodeId",
      };
    }
    // const droplet = await getDropletByKey(nodeId);
    const { ssh, close } = await sshTo(nodeId);
    const result = await ssh.execCommand(`ls -mF`);
    const files = result.stdout.split(", ");
    close();
    return httpSuccess(files);
  }),
});

export const privateKey = makeAPIGatewayLambda({
  path: "/nodes/{nodeId}/privateKey",
  method: "get",
  func: makeAPIFunc(async (event) => {
    const nodeId = event.pathParameters?.nodeId;
    if (!nodeId) {
      return {
        statusCode: 400,
        body: "Missing nodeId",
      };
    }
    const privateKey = await getPrivateKey(nodeId);
    return { statusCode: 200, body: privateKey };
  }),
});

export const build = makeAPIGatewayLambda({
  path: "/nodes",
  method: "post",
  func: makeAPIFunc(async (event) => {
    if (!event.body) {
      return {
        statusCode: 400,
        body: "Missing body",
      };
    }
    const { key, defaultChainId = 80001 } = <
      { key: string; defaultChainId?: number }
    >JSON.parse(event.body);

    if (!key) {
      return {
        statusCode: 400,
        body: "Missing key",
      };
    }
    console.log("Creating droplet");
    const { id, privateKey, ...rest } = await createDroplet(key);
    console.log("I created the droplet, making query");
    //create new node with the key

    await qldbDriver.executeLambda(async (txn) => {
      const data = {
        id: key,
        nodeId: id,
        privateKey,
        status: "uninitialized",
        defaultChainId,
      };
      const query = `INSERT INTO Nodes ?`;
      console.log("Running query", query);
      await txn.execute(query, data);
    });
    return httpSuccess({ key, id });
  }),
});

export const completedNode = makeAPIGatewayLambda({
  path: "/nodes/{nodeId}/completed",
  method: "get",
  timeout: 25,
  func: makeAPIFunc(async (event) => {
    const nodeId = event.pathParameters?.nodeId;
    if (!nodeId) {
      return {
        statusCode: 400,
        body: "Missing nodeId",
      };
    }
    const droplet = await getDropletByKey(nodeId);
    if (!droplet) return { statusCode: 404, body: "Node not found" };
    try {
      const nodeRecord = await getNodeRecord(nodeId);
      if (nodeRecord.get("status")?.stringValue() !== "uninitialized") {
        return { statusCode: 400, body: "Node is not in uninitialized state" };
      }
    } catch (e) {
      return { statusCode: 404, body: "Node not found" };
    }
    await qldbDriver.executeLambda(async (txn) => {
      console.log("Running completing query");
      const query = `UPDATE Nodes SET status = 'completing' WHERE id = '${nodeId}'`;
      await txn.execute(query);
      console.log("Ran completing query");
    });
    //Let's upload that code state
    const { ssh, close } = await sshTo(nodeId);
    await deploy(ssh, getAssetPath("nodeserver"), "nodeserver");
    await ssh.execCommand(
      "cd nodeserver && yarn && yarn start > out.log 2>&1 &"
    );
    console.log("Closing");
    close();
    console.log("Closed");
    await qldbDriver.executeLambda(async (txn) => {
      const query = `UPDATE Nodes SET status = 'completed' WHERE id = '${nodeId}'`;
      console.log("Running completed query");
      await txn.execute(query);
      console.log("Ran completed query");
    });
    console.log("Returning success");
    return { statusCode: 200, body: "completed" };
  }, process.env.COMPLETED_KEY),
});

export const deleteNode = makeAPIGatewayLambda({
  path: "/nodes/{nodeId}",
  method: "delete",
  func: makeAPIFunc(async (event) => {
    const nodeId = event.pathParameters?.nodeId;
    if (!nodeId) {
      return {
        statusCode: 400,
        body: "Missing nodeId",
      };
    }
    const droplet = await getDropletByKey(nodeId);
    if (!droplet) {
      return {
        statusCode: 404,
        body: "Node not found",
      };
    }
    await destroyDroplet(droplet.id);
    await qldbDriver.executeLambda(async (txn) => {
      const query = `DELETE FROM Nodes WHERE id = '${nodeId}'`;
      await txn.execute(query);
    });

    return httpSuccess("OK");
  }),
});
export const getJobs = makeAPIGatewayLambda({
  path: "/nodes/{nodeId}/jobs",
  method: "get",
  func: makeAPIFunc(async (event) => {
    const nodeId = event.pathParameters?.nodeId;
    if (!nodeId) {
      return {
        statusCode: 400,
        body: "Missing nodeId",
      };
    }
    const droplet = await getDropletByKey(nodeId);
    if (!droplet) {
      return {
        statusCode: 404,
        body: "Node not found",
      };
    }
    const results = await qldbDriver.executeLambda(async (txn) => {
      const query = `SELECT * FROM Jobs WHERE nodeId = '${nodeId}'`;
      console.log("Running query", query);
      const result = await txn.execute(query);
      console.log("Ran query");
      return result;
    });
    return httpSuccess(results.getResultList());
  }),
});

export const getJob = makeAPIGatewayLambda({
  path: "/nodes/{nodeId}/jobs/{jobId}",
  method: "get",
  func: makeAPIFunc(async (event) => {
    const nodeId = event.pathParameters?.nodeId;
    if (!nodeId) {
      return {
        statusCode: 400,
        body: "Missing nodeId",
      };
    }
    const jobId = event.pathParameters?.jobId;
    if (!jobId) {
      return {
        statusCode: 400,
        body: "Missing jobId",
      };
    }
    const results = await qldbDriver.executeLambda((txn) => {
      const query = `SELECT * FROM Jobs WHERE id = '${nodeId}-${jobId}'`;
      return txn.execute(query);
    });
    const record = results.getResultList()[0];

    //Get the job
    return httpSuccess(record);
  }),
});

export const getJobRuns = makeAPIGatewayLambda({
  path: "/nodes/{nodeId}/jobs/{jobId}/runs",
  method: "get",
  func: makeAPIFunc(async (event) => {
    const nodeId = event.pathParameters?.nodeId;
    if (!nodeId) {
      return {
        statusCode: 400,
        body: "Missing nodeId",
      };
    }
    const jobId = event.pathParameters?.jobId;
    if (!jobId) {
      return {
        statusCode: 400,
        body: "Missing jobId",
      };
    }
    const { ssh, close } = await sshTo(nodeId);
    close();
    //Get the job
    return httpSuccess({});
  }),
});

export const getJobRun = makeAPIGatewayLambda({
  path: "/nodes/{nodeId}/jobs/{jobId}/runs/{runId}",
  method: "get",
  func: makeAPIFunc(async (event) => {
    const nodeId = event.pathParameters?.nodeId;
    if (!nodeId) {
      return {
        statusCode: 400,
        body: "Missing nodeId",
      };
    }
    const jobId = event.pathParameters?.jobId;
    if (!jobId) {
      return {
        statusCode: 400,
        body: "Missing jobId",
      };
    }
    const runId = event.pathParameters?.runId;
    if (!runId) {
      return {
        statusCode: 400,
        body: "Missing runId",
      };
    }
    const { ssh, close } = await sshTo(nodeId);
    close();
    //Get the job
    return httpSuccess({});
  }),
});
type PolyNodesJobRequest = {
  name: string;
  oracleAddress?: string;
  chainId?: number;
  allowedRequesters?: string[];
  source: string;
  minPayment: number;
  language?: "javascript" | "python";
  parameters?: string[];
  confirmations?: number;
};
export const createJob = makeAPIGatewayLambda({
  path: "/nodes/{nodeId}/jobs",
  method: "post",
  func: makeAPIFunc(async (event) => {
    const nodeId = event.pathParameters?.nodeId;
    if (!nodeId) {
      return {
        statusCode: 400,
        body: "Missing nodeId",
      };
    }
    if (!event.body) {
      return {
        statusCode: 400,
        body: "Missing body",
      };
    }
    console.log("Getting noderecord", nodeId);
    const nodeRecord = await getNodeRecord(nodeId);
    console.log("checking status on noderecord", nodeRecord.allFields());
    const completed = nodeRecord.get("status")?.stringValue() === "completed";
    if (!completed) {
      return {
        statusCode: 400,
        body: "Node is not ready to receive jobs",
      };
    }
    console.log("I am completed, let's ride");
    const defaultChainId =
      nodeRecord.get("defaultChainId")?.numberValue() || 80001;
    console.log("Got default chain id", defaultChainId);
    const defaultOracle =
      nodeRecord.get("oracles")?.get(defaultChainId)?.stringValue() || "";
    console.log("Got default oracle address", defaultOracle);
    const {
      name,
      oracleAddress = defaultOracle,
      chainId = defaultChainId,
      allowedRequesters = [],
      source,
      minPayment = 0,
      parameters = [],
      confirmations = 0,
      // language = "javascript", // Not using this yet
    } = <PolyNodesJobRequest>JSON.parse(event.body);
    console.log("I got the body parsed");
    if (!name) return { statusCode: 400, body: "Missing name" };
    if (!oracleAddress)
      return { statusCode: 400, body: "Missing oracleAddress" };
    if (!chainId) return { statusCode: 400, body: "Missing chainId" };
    if (!source) return { statusCode: 400, body: "Missing source" };
    console.log("I made it past these checks");
    //Compile the code
    compileTemplate(name, source);
    await qldbDriver.executeLambda(async (txn) => {
      const data = {
        id: `${nodeId}-${name}`,
        nodeId,
        name,
        chainId,
        oracleAddress,
        allowedRequesters,
        minPayment: 0,
        status: "uninitialized",
      };
      const query = `INSERT INTO Jobs ?`;
      await txn.execute(query, data);
    });
    const externalJobID = uuid();
    //great, now let's ride
    const { ssh, close } = await sshTo(nodeId);
    //Upload the compiled code
    //Restart the node server
    await uploadTemplate(ssh, name, source);
    await //Add the bridge
    await Bridges.create(ssh, {
      name,
      url: `http://1727.0.1:8080/${name}`,
      confirmations,
    });
    //Add the job
    const requestData = parameters.reduce(
      (o, key) => ({ ...o, [key]: new ChainlinkVariable(key) }),
      {}
    );
    const graph = new DOTGraph()
      .add(DOTGraph.Steps.decode_log)
      .add(DOTGraph.Steps.decode_cbor)
      .add(DOTGraph.Steps.friendlyBridge(name, requestData))
      .add(DOTGraph.Steps.encode_data_uint(name))
      .add(DOTGraph.Steps.encode_tx);

    const _ = await Jobs.create(ssh, {
      externalJobID,
      contractAddress: oracleAddress,
      evmChainID: chainId,
      name,
      requesters: allowedRequesters,
      type: "directrequest",
      graph,
      minContractPaymentLinkJuels: Math.floor(minPayment * 10 ** 18),
    });
    close();
    //Finish by updating the database with status
    await qldbDriver.executeLambda(async (txn) => {
      const query = `UPDATE Jobs set status = 'ready'  WHERE id = '${nodeId}-${name}'`;
      await txn.execute(query);
    });
    return httpSuccess({ key: nodeId, name });
  }),
});
//#endregion
