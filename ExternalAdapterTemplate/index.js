const { Requester, Validator } = require('@chainlink/external-adapter')
require('dotenv').config()

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  exchange: ['exchange'],
  symbol: ['symbol'],
  endpoint: false
}
const APCA_API_KEY_ID = process.env.APCA_API_KEY_ID
const APCA_API_SECRET_KEY = process.env.APCA_API_SECRET_KEY

const headers = {
  'APCA-API-KEY-ID': APCA_API_KEY_ID,
  'APCA-API-SECRET-KEY': APCA_API_SECRET_KEY
}

console.log(headers)

const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id

  const exchange = validator.validated.data.exchange
  const symbol = validator.validated.data.symbol
  // const endpoint = validator.validated.data.endpoint || 'price'
  const url = `https://data.alpaca.markets/v1beta1/crypto/${symbol}/quotes/latest?exchange=${exchange}`
  // const fsym = validator.validated.data.base.toUpperCase()
  // const tsyms = validator.validated.data.quote.toUpperCase()

  const params = {
    exchange,
    symbol
  }

  // This is where you would add method and headers
  // you can add method like GET or POST and add it to the config
  // The default is GET requests
  // method = 'get'
  // headers = 'headers.....'
  
  // console.log(headers)
  const config = {
    url,
    // params,
    headers
  }
  console.log({config})

  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  Requester.request(config, customError)
    .then(response => {
      // It's common practice to store the desired value at the top-level
      // result key. This allows different adapters to be compatible with
      // one another.
      // response.data.result = Requester.validateResultNumber(response.data, [tsyms])
      // console.log(JSON.stringify(response, null, 2))
      console.log(response.data)
      console.log({jobRunID: jobRunID})
      console.log({status: response.status})
      callback(response.status, Requester.success(jobRunID, { data: {ap:response.data.quote.ap}}))
    })
    .catch(error => {
      callback(500, Requester.errored(jobRunID, error))
    })
}

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest
