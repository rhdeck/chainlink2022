# Polynodes API

Serverless API for managing Chainlink nodes managed on Polynodes service. Uses [Serverless Framework](https://serverless.com) for deployment to AWS Lambda. 

## Prerequisite
1. [Install the AWS CLI](
Installing or updating the latest version of the AWS CLIhttps://docs.aws.amazon.com › cli › getting-started-install))
2. Be logged in to your/an AWS Account
3. Environment variables or a `.env` file with the keys provided in `.env.template`

## Installing
```bash
# 1. Install dependencies
yarn 
# 2. Send to AWS Lambda service
yarn deploy 
```

## API
The API is deployed to an AWS API Gateway endpoint, secured by the key listed in the INTERNAL_KEY environment variable. 

## Major endpoints
### GET - /nodes
### GET - /nodes/{nodeId}
### GET - /nodes/{nodeId}/ip
### GET - /nodes/{nodeId}/ls
### GET - /nodes/{nodeId}/privateKey
### POST - /nodes
### GET - /nodes/{nodeId}/completed
### DELETE - /nodes/{nodeId}
### GET - /nodes/{nodeId}/jobs/{jobId}
### GET - /nodes/{nodeId}/jobs/{jobId}/runs
### GET - /nodes/{nodeId}/jobs/{jobId}/runs/{runId}
### GET - /nodes/{nodeId}/jobs
### POST - /nodes/{nodeId}/jobs

## Next Steps
This API is not currently user-secured, which makes it pretty open and single-user. ALl easy to solve in the context of this code - was not a priority for the initial build. 

