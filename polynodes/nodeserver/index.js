// const createRequest = require("./index").createRequest;
//#region Set up Alpaca API Keys
require("dotenv").config();

//#region Express Server
const express = require("express");
const bodyParser = require("body-parser");
const { writeFileSync, readdirSync } = require("fs");
const app = express();
const port = process.env.EA_PORT || 8080;
const host = process.env.EA_HOST || "172.17.0.1";

app.use(bodyParser.json());
const endpointDir = "./endpoints";
const endpoints = readdirSync(endpointDir);
endpoints.forEach((filename) => {
  const fullpath = `${endpointDir}/${filename}`;
  const endpoint = require(fullpath);
  app.post(
    "/" + filename.substring(0, filename.length - 3),
    async (req, res) => {
      const input = req.body;
      const jobRunId = typeof input.id === "undefined" ? 1 : input.id;
      const output = await endpoint(req.body);
      const result = { jobRunId, output };
      console.log("were back from ", filename, result);
      res.status(200).json(result);
    }
  );
});
// const endpoints = require("../app.js");

// Object.entries(endpoints).forEach(([key, func]) => {
//   if (typeof func === "function") {
//     app.post(key, async (req, res) => {
//       const { status, result } = await func(req.body);
//       res.status(status).json(result);
//     });
//   }
// });

app.listen(port, host, () => console.log(`Listening on port ${port}!`));

writeFileSync("./started", new Date().toLocaleString());
