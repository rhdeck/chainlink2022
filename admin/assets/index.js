// const createRequest = require("./index").createRequest;
//#region Set up Alpaca API Keys
require("dotenv").config();

//#region Express Server
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.EA_PORT || 8080;
const host = process.env.EA_HOST || "172.17.0.1";

app.use(bodyParser.json());

const endpoints = require("../app.js");

Object.entries(endpoints).forEach(([key, func]) => {
  if (typeof func === "function") {
    app.post(key, async (req, res) => {
      const { status, result } = await func(req.body);
      res.status(status).json(result);
    });
  }
});

app.listen(port, host, () => console.log(`Listening on port ${port}!`));
