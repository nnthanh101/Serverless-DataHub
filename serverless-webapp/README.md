# [CDK Pattern - SPA] Dynamic Serverless Website

This [CDK Pattern](https://cdkpatterns.com/patterns/) to make deploying a Dynamic Serverless Website.

### Architecture:
![Architecture](https://github.com/nnthanh101/modernapps/raw/main/README/images/serverless-webapp-architecture.png)

### Project Directory

```
/modernapps/serverless-webapp
├── README.md
├── bin
|  └── sserverless-webapp.ts
├── cdk.json
├── jest.config.js
├── lib
|  └── sserverless-webapp-stack.ts
├── package.json
├── test
|  └── sserverless-webapp.test.ts
└── tsconfig.json
```

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
