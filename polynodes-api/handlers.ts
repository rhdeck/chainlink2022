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
const makeAPIFunc = (
  func: Handler<APIGatewayProxyEvent, APIGatewayProxyResult>
) => <Handler<APIGatewayProxyEvent, APIGatewayProxyResult>>(async (
    event,
    context,
    callback
  ) => {
    if (!isAuthenticated(event)) {
      return {
        statusCode: 401,
        body: "Unauthorized",
      };
    }
    return func(event, context, callback);
  });
const isAuthenticated = (event: APIGatewayProxyEvent): boolean => {
  if (event.headers.Authorization == "Bearer " + process.env.internalKey) {
    return true;
  }
  return false;
};
setGetPrivateKey(async (key) => {
  const rxResult = await qldbDriver.executeLambda(async (txn) => {
    const result = await txn.execute(`SELECT * from Nodes WHERE id = '${key}'`);
    return result.getResultList();
  });
  if (!rxResult) throw new Error("no key found");
  const record = rxResult[0];
  const privateKey = record.get("privateKey")?.stringValue();
  if (!privateKey) throw new Error("no private key found");
  return privateKey;
});
//#endregion
//#region API Endpoints
export const listNodes = makeAPIGatewayLambda({
  path: "/nodes",
  method: "get",
  func: makeAPIFunc(async (event) => {
    if (!isAuthenticated(event)) {
      return {
        statusCode: 401,
        body: "Unauthorized",
      };
    }
    //list them all
    const droplets = await getDroplets();
    const nodes = droplets
      .map((droplet) => {
        const network = droplet.networks.v4.find(
          ({ type }: { type: string }) => type === "public"
        );
        if (network) return { key: droplet.key, ip: network.ip_address };
      })
      .filter(Boolean);
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
    return httpSuccess(droplet);
  }),
});
export const ls = makeAPIGatewayLambda({
  path: "/ls/{nodeId}",
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
    const result = await ssh.execCommand(`ls -l`);
    close();
    return httpSuccess(result.stdout);
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
    const body = <{ key: string }>JSON.parse(event.body);
    const key = body.key;

    if (!key) {
      return {
        statusCode: 400,
        body: "Missing key",
      };
    }
    const { id, privateKey, ...rest } = await createDroplet(key);
    //create new node with the key
    await qldbDriver.executeLambda(async (txn) => {
      await txn.execute(
        `INSERT INTO Nodes (id, privateKey, nodeId) VALUES ('${key}', '${privateKey}', ${id})`
      );
    });
    return httpSuccess({ key, id });
  }),
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
    return httpSuccess("OK");
  }),
});
// export const getCid = makeAPIGatewayLambda({
//   path: "/cid/{cid}",
//   method: "get",
//   func: <Handler<APIGatewayProxyEvent, APIGatewayProxyResult>>(async (
//     event: APIGatewayProxyEvent
//   ) => {
//     if (!isAuthenticated(event))
//       return { statusCode: 401, body: "Unauthorized" };
//     await makeTables();
//     const cid = event.pathParameters?.cid;
//     if (!cid) return { statusCode: 400, body: "No cid provided" };
//     const txResult = await qldbDriver.executeLambda(async (txn) => {
//       const result = txn.execute(
//         `SELECT * from Transmissions WHERE cid = '${cid}'`
//       );
//       return (await result).getResultList();
//     });
//     const rxResult = await qldbDriver.executeLambda(async (txn) => {
//       const result = await txn.execute(
//         `SELECT * from Receipts WHERE cid = '${cid}'`
//       );
//       return result.getResultList();
//     });
//     const uploadResult = await qldbDriver.executeLambda(async (txn) => {
//       const result = await txn.execute(
//         `SELECT * from Uploads WHERE cid = '${cid}'`
//       );
//       return result.getResultList();
//     });
//     const result = {
//       transmissions: txResult,
//       receipts: rxResult,
//       uploads: uploadResult.length ? uploadResult[0] : undefined,
//     };
//     return { statusCode: 200, body: JSON.stringify(result) };
//   }),
// });
// export const getUser = makeAPIGatewayLambda({
//   path: "/user/{user}",
//   method: "get",
//   func: <Handler<APIGatewayProxyEvent, APIGatewayProxyResult>>(async (
//     event: APIGatewayProxyEvent
//   ) => {
//     if (!isAuthenticated(event))
//       return { statusCode: 401, body: "Unauthorized" };
//     await makeTables();
//     const user = event.pathParameters?.user;
//     if (!user) return { statusCode: 400, body: "No user provided" };
//     const txResult = await qldbDriver.executeLambda(async (txn) => {
//       const result = await txn.execute(
//         `SELECT * from Transmissions WHERE sender = '${user}' OR recipient = '${user}'`
//       );
//       return result.getResultList();
//     });
//     const rxResult = await qldbDriver.executeLambda(async (txn) => {
//       const result = await txn.execute(
//         `SELECT * from Receipts WHERE recipient = '${user}'`
//       );
//       return result.getResultList();
//     });
//     const cids = [
//       ...rxResult.map((v) => v.get("cid")),
//       ...txResult.map((v) => v.get("cid")),
//     ];
//     const uploadResult = await qldbDriver.executeLambda(async (txn) => {
//       const result = await txn.execute(
//         `SELECT * from Uploads WHERE cid IN ('${cids.join(
//           "','"
//         )}') OR sender='${user}'`
//       );
//       return result.getResultList();
//     });
//     const result = {
//       user: user,
//       transmissions: txResult,
//       receipts: rxResult,
//       uploads: uploadResult,
//     };
//     return { statusCode: 200, body: JSON.stringify(result) };
//   }),
// });

// export const getTransaction = makeAPIGatewayLambda({
//   path: "/transaction/{id}",
//   method: "get",
//   func: <Handler<APIGatewayProxyEvent, APIGatewayProxyResult>>(async (
//     event: APIGatewayProxyEvent
//   ) => {
//     if (!isAuthenticated(event))
//       return { statusCode: 401, body: "Unauthorized" };
//     await makeTables();
//     const id = event.pathParameters?.id;
//     if (!id) return { statusCode: 400, body: "No id provided" };
//     const [type] = id.split("-");
//     const result = await qldbDriver.executeLambda(async (txn) => {
//       switch (type) {
//         case "transmit":
//           const txResult = await txn.execute(
//             `SELECT * from Transmissions WHERE id = '${id}'`
//           );
//           const tlist = txResult.getResultList();
//           return tlist.length
//             ? {
//                 statusCode: 200,
//                 body: JSON.stringify({ type: "transmit", data: tlist[0] }),
//               }
//             : { statusCode: 404, body: "Not found" };
//           break;
//         case "receive":
//           const rxResult = await txn.execute(
//             `SELECT * from Receipts WHERE id = '${id}'`
//           );
//           const rlist = rxResult.getResultList();
//           return rlist.length
//             ? {
//                 statusCode: 200,
//                 body: JSON.stringify({ type: "receive", data: rlist[0] }),
//               }
//             : { statusCode: 404, body: "Not found" };
//           break;
//         case "upload":
//           const uploadResult = await txn.execute(
//             `SELECT * from Uploads WHERE id = '${id}'`
//           );
//           const ulist = uploadResult.getResultList();
//           return ulist.length
//             ? {
//                 statusCode: 200,
//                 body: JSON.stringify({ type: "upload", data: ulist[0] }),
//               }
//             : { statusCode: 404, body: "Not found: " + id };
//           break;
//         default:
//           return { statusCode: 400, body: "Invalid type" };
//       }
//     });
//     return result;
//   }),
// });

// export const postUpload = makeAPIGatewayLambda({
//   path: "/upload",
//   method: "post",
//   func: <Handler<APIGatewayProxyEvent, APIGatewayProxyResult>>(async (
//     event: APIGatewayProxyEvent
//   ) => {
//     if (!isAuthenticated(event))
//       return { statusCode: 401, body: "Unauthorized" };
//     const { body } = event;
//     if (!body) return { statusCode: 400, body: "No body provided" };
//     await makeTables();
//     const { cid: _cid, sender: _sender, name: _name } = <
//       { cid: string; sender: string; name: string }
//     >JSON.parse(body);
//     if (!_sender) return { statusCode: 400, body: "No sender provided" };
//     if (!_cid) return { statusCode: 400, body: "No cid provided" };

//     if (!_name) return { statusCode: 400, body: "No name provided" };
//     const sender = _sender.toString();
//     const cid = _cid.toString();
//     const name = _name.toString();
//     const date = new Date().toISOString();
//     const id = "upload-" + uuid();
//     const result = await qldbDriver.executeLambda(async (txn) => {
//       const dupCheck = await txn.execute(
//         `SELECT * FROM Uploads WHERE id = '${id}'`
//       );
//       if (dupCheck.getResultList().length === 0) {
//         const doc = { id, cid, sender, name, date };
//         await txn.execute(`INSERT INTO Uploads ?`, doc);
//         return {
//           statusCode: 200,
//           body: JSON.stringify({ id, cid, sender, name, date }),
//         };
//       } else {
//         return {
//           statusCode: 400,
//           body: "Document with this already uploaded",
//         };
//       }
//     });
//     return result;
//   }),
// });
// export const getUpload = makeAPIGatewayLambda({
//   path: "/upload/{id}",
//   method: "get",
//   func: <Handler<APIGatewayProxyEvent, APIGatewayProxyResult>>(async (
//     event: APIGatewayProxyEvent
//   ) => {
//     if (!isAuthenticated(event))
//       return { statusCode: 401, body: "Unauthorized" };
//     const id = event.pathParameters?.id;
//     if (!id) return { statusCode: 400, body: "No id provided" };
//     const result = await qldbDriver.executeLambda(async (txn) => {
//       const uploadResult = await txn.execute(
//         `SELECT * from Uploads WHERE id = '${id}'`
//       );
//       const ulist = uploadResult.getResultList();
//       return ulist.length
//         ? {
//             statusCode: 200,
//             body: JSON.stringify(ulist[0]),
//           }
//         : { statusCode: 404, body: "Not found: " + id };
//     });

//     return result;
//   }),
// });
// export const postTransmit = makeAPIGatewayLambda({
//   path: "/transmit",
//   method: "post",
//   func: <Handler<APIGatewayProxyEvent, APIGatewayProxyResult>>(async (
//     event: APIGatewayProxyEvent
//   ) => {
//     if (!isAuthenticated(event))
//       return { statusCode: 401, body: "Unauthorized" };
//     const { body } = event;
//     if (!body) return { statusCode: 400, body: "No body provided" };
//     await makeTables();
//     const { cid: _cid, sender: _sender, recipient: _recipient } = <
//       { cid: string; sender: string; recipient: string }
//     >JSON.parse(body);
//     if (!_sender) return { statusCode: 400, body: "No sender provided" };
//     if (!_cid) return { statusCode: 400, body: "No cid provided" };
//     if (!_recipient) return { statusCode: 400, body: "No recipient provided" };
//     const sender = _sender.toString();
//     const cid = _cid.toString();
//     const recipient = _recipient.toString();
//     const date = new Date().toISOString();
//     const id = "transmit-" + uuid();

//     const result = await qldbDriver.executeLambda(async (txn) => {
//       const uploadCheck = await txn.execute(
//         `SELECT * FROM Uploads WHERE cid = '${cid}'`
//       );
//       if (uploadCheck.getResultList().length === 0) {
//         return { statusCode: 400, body: "No such CID uploaded" };
//       }
//       const dupCheck = await txn.execute(
//         `SELECT * FROM Transmissions WHERE id='${id}'` //cid = '${cid}' AND sender = '${sender}' AND recipient = '${recipient}'`
//       );
//       if (dupCheck.getResultList().length > 0) {
//         return { statusCode: 400, body: "Duplicate transmission" }; //@TODO RHD Should we allow second transmissions maybe?
//       }
//       const doc = { id, cid, sender, recipient, date };
//       await txn.execute(`INSERT INTO Transmissions ?`, doc);
//       return {
//         statusCode: 200,
//         body: JSON.stringify({ id, cid, sender, recipient, date }),
//       };
//     });
//     return result;
//   }),
// });
// export const getTransmit = makeAPIGatewayLambda({
//   path: "/transmit/{id}",
//   method: "get",
//   func: <Handler<APIGatewayProxyEvent, APIGatewayProxyResult>>(async (
//     event: APIGatewayProxyEvent
//   ) => {
//     if (!isAuthenticated(event))
//       return { statusCode: 401, body: "Unauthorized" };
//     const id = event.pathParameters?.id;
//     if (!id) return { statusCode: 400, body: "No id provided" };
//     const result = await qldbDriver.executeLambda(async (txn) => {
//       const uploadResult = await txn.execute(
//         `SELECT * from Transmissions WHERE id = '${id}'`
//       );
//       const ulist = uploadResult.getResultList();
//       return ulist.length
//         ? {
//             statusCode: 200,
//             body: JSON.stringify(ulist[0]),
//           }
//         : { statusCode: 404, body: "Not found: " + id };
//     });

//     return result;
//   }),
// });
// export const postReceive = makeAPIGatewayLambda({
//   path: "/receive",
//   method: "post",
//   func: <Handler<APIGatewayProxyEvent, APIGatewayProxyResult>>(async (
//     event: APIGatewayProxyEvent
//   ) => {
//     if (!isAuthenticated(event))
//       return { statusCode: 401, body: "Unauthorized" };
//     const { body } = event;
//     if (!body) return { statusCode: 400, body: "No body provided" };
//     await makeTables();
//     const { cid: _cid, recipient: _recipient } = <
//       { cid: string; recipient: string }
//     >JSON.parse(body);
//     if (!_cid) return { statusCode: 400, body: "No cid provided" };
//     if (!_recipient) return { statusCode: 400, body: "No recipient provided" };
//     const recipient = _recipient.toString();
//     const cid = _cid.toString();
//     const date = new Date().toISOString();
//     const id = "receive-" + uuid();

//     const result = await qldbDriver.executeLambda(async (txn) => {
//       const txCheck = await txn.execute(
//         `SELECT * FROM Transmissions WHERE cid = '${cid}'`
//       );
//       if (txCheck.getResultList().length === 0) {
//         return { statusCode: 400, body: "No such transmission" };
//       }
//       const dupCheck = await txn.execute(
//         `SELECT * FROM Receipts WHERE id='${id}'` //`cid = '${cid}' AND recipient = '${recipient}'`
//       );
//       if (dupCheck.getResultList().length > 0) {
//         return { statusCode: 400, body: "Duplicate receipt" }; //@TODO RHD Should we allow second receipts maybe?
//       }
//       const doc = { id, cid, recipient, date };
//       await txn.execute(`INSERT INTO Receipts ?`, doc);
//       return {
//         statusCode: 200,
//         body: JSON.stringify({ id, cid, recipient, date }),
//       };
//     });
//     return result;
//   }),
// });
// export const getReceive = makeAPIGatewayLambda({
//   path: "/receive/{id}",
//   method: "get",
//   func: <Handler<APIGatewayProxyEvent, APIGatewayProxyResult>>(async (
//     event: APIGatewayProxyEvent
//   ) => {
//     if (!isAuthenticated(event))
//       return { statusCode: 401, body: "Unauthorized" };
//     const id = event.pathParameters?.id;
//     if (!id) return { statusCode: 400, body: "No id provided" };
//     const result = await qldbDriver.executeLambda(async (txn) => {
//       const uploadResult = await txn.execute(
//         `SELECT * from Receipts WHERE id = '${id}'`
//       );
//       const ulist = uploadResult.getResultList();
//       return ulist.length
//         ? {
//             statusCode: 200,
//             body: JSON.stringify(ulist[0]),
//           }
//         : { statusCode: 404, body: "Not found: " + id };
//     });

//     return result;
//   }),
// });
//#endregion
