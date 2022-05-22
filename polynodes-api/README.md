# Polynodes API

Serverless API for managing Chainlink nodes managed on Polynodes service. Uses [Serverless Framework](https://serverless.com) for deployment. 

## Installing
```
yarn # Install dependencies
yarn deploy # Send to AWS Lambda service
```

## API
The API is deployed to an AWS API Gateway endpoint, secured by the key listed in the INTERNAL_KEY environment variable. 

### Major endpoints
```
 GET - https://my-api-gateway-id.execute-api.my-api-region.amazonaws.com/dev/nodes
  GET - https://my-api-gateway-id.execute-api.my-api-region.amazonaws.com/dev/nodes/{nodeId}
  GET - https://my-api-gateway-id.execute-api.my-api-region.amazonaws.com/dev/nodes/{nodeId}/ip
  GET - https://my-api-gateway-id.execute-api.my-api-region.amazonaws.com/dev/nodes/{nodeId}/ls
  GET - https://my-api-gateway-id.execute-api.my-api-region.amazonaws.com/dev/nodes/{nodeId}/privateKey
  POST - https://my-api-gateway-id.execute-api.my-api-region.amazonaws.com/dev/nodes
  GET - https://my-api-gateway-id.execute-api.my-api-region.amazonaws.com/dev/nodes/{nodeId}/completed
  DELETE - https://my-api-gateway-id.execute-api.my-api-region.amazonaws.com/dev/nodes/{nodeId}
  GET - https://my-api-gateway-id.execute-api.my-api-region.amazonaws.com/dev/nodes/{nodeId}/jobs/{jobId}
  GET - https://my-api-gateway-id.execute-api.my-api-region.amazonaws.com/dev/nodes/{nodeId}/jobs/{jobId}/runs
  GET - https://my-api-gateway-id.execute-api.my-api-region.amazonaws.com/dev/nodes/{nodeId}/jobs/{jobId}/runs/{runId}
  POST - https://my-api-gateway-id.execute-api.my-api-region.amazonaws.com/dev/nodes/{nodeId}/jobs
```

## Next Steps
This API is not currently user-secured, which makes it pretty open and single-user. ALl easy to solve in the context of this code - was not a priority for the initial build. 

