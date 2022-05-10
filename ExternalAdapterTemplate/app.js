// const createRequest = require("./index").createRequest;

const fetch = require("cross-fetch");
const { Requester, Validator } = require("@chainlink/external-adapter");
//#region Set up Alpaca API Keys
require("dotenv").config();
const APCA_API_KEY_ID = process.env.APCA_API_KEY_ID;
const APCA_API_SECRET_KEY = process.env.APCA_API_SECRET_KEY;

const headers = {
  "APCA-API-KEY-ID": APCA_API_KEY_ID,
  "APCA-API-SECRET-KEY": APCA_API_SECRET_KEY,
};
//#endregion

//#region Express Server
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.EA_PORT || 8080;

app.use(bodyParser.json());

app.post("/askingsize", async (req, res) => {
  const { status, result } = await getAskingSize(req.body);
  res.status(status).json(result);
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
//#endregion
//#region createRequest
const getAskingSize = async (input) => {
  const jobId = typeof input.id === "undefined" ? 1 : input.id;
  const exchange = input.data.exchange;
  if (!exchange) throw new Error("Data is required");
  const symbol = input.data.symbol;
  if (!symbol) throw new Error("Symbol is required");
  const url = `https://data.alpaca.markets/v1beta1/crypto/${symbol}/quotes/latest?exchange=${exchange}`;
  try {
    const response = await fetch(url, { headers });
    const data = await response.json();
    return {
      status: response.status,
      result: data.quote.as,
      jobId,
    };
  } catch (error) {
    return {
      status: 500,
      jobId,
      status: "errored",
      statusCode: 500,
      error: { name: "AdapterError", message: "There was an error" },
    };
  }
};
//#endregion
