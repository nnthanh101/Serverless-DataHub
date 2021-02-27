# [CDK Pattern - SPA] Dynamic Serverless Website

This [CDK Pattern](https://cdkpatterns.com/patterns/) to make deploying a Dynamic Serverless Website.

* [ ] [S3 Website Pattern](../README/s3-website/README.md) `React / Vue / Angular` Production build 
* [ ] Setting up CloudFront to serve HTTPS requests for S3 Bucket
* [ ] The Website executes on the client-side to display and/or fetch data (RESTful services << API-Gateway, Lambda, DynamoDB).

### Architecture:
![Architecture](https://github.com/nnthanh101/modernapps/raw/main/README/images/serverless-webapp-architecture.png)

### Project Directory

```
/modernapps/serverless-webapp
├── README.md
├── bin
|  └── serverless-webapp.ts
├── cdk.json
├── jest.config.js
├── lib
|  └── serverless-webapp-stack.ts
├── package.json
├── test
|  └── serverless-webapp.test.ts
└── tsconfig.json
```

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
