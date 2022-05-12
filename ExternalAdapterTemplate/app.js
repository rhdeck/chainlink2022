// const createRequest = require("./index").createRequest;

const fetch = require("cross-fetch");
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
const host = process.env.EA_HOST || "172.17.0.1";

app.use(bodyParser.json());

app.post("/cryptoaskingsize", async (req, res) => {
  const { status, result } = await getCryptoAskingSize(req.body);
  res.status(status).json(result);
});
app.post("/cryptoprice", async (req, res) => {
  const { status, result } = await getCryptoPrice(req.body);
  res.status(status).json(result);
});

app.listen(port, host, () => console.log(`Listening on port ${port}!`));
//#endregion
//#region requests
const getCryptoAskingSize = async (input) => {
  const jobRunId = typeof input.id === "undefined" ? 1 : input.id;  
  try {
    const { exchange, symbol } = input.data;
    if (!exchange) throw new Error("Data is required");
    if (!symbol) throw new Error("Symbol is required");
    const url = `https://data.alpaca.markets/v1beta1/crypto/${symbol}/quotes/latest?exchange=${exchange}`;

    const response = await fetch(url, { headers });
    const data = await response.json();
    return {
      status: response.status,
      result: {jobRunId, askingSize:data.quote.as},
    };
  } catch (error) {
    return {
      status: 500,
      result: { jobRunId, status: "errored", error:"AdapterError", message: error.message , statusCode: 500,
      },
};}};
//Return asking price of the symbol on the exchange given
const getCryptoPrice = async (input) => {
  const jobRunId = typeof input.id === "undefined" ? 1 : input.id;
  try {
    const { exchange, symbol } = input.data;
    if (!exchange) throw new Error("Data is required");
    if (!symbol) throw new Error("Symbol is required");
    const url = `https://data.alpaca.markets/v1beta1/crypto/${symbol}/quotes/latest?exchange=${exchange}`;
    const response = await fetch(url, { headers });
    const data = await response.json();
    const price = Math.floor(data.quote.ap * 100);
    return {
      status: response.status,
      result: {jobRunId, price},
    };
  } catch (error) {
    return {
      status: 500,
      result: { jobRunId, status: "errored", error:"AdapterError", message: error.message , statusCode: 500,
      }
    }
  }
};
//#endregion
