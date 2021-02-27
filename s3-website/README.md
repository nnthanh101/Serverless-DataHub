# [CDK Pattern - SPA] AWS S3 Website Pattern (React / Vue / Angular)

This [CDK Pattern](https://cdkpatterns.com/patterns/) provides a step-by-step guidence for hosting or migrating the **SPA** `Static Website` (`React`/`Vue`/`Angular`) or `[Dynamic Website](../README/serverless-webapp/README.md)` from any _HTTP servers_ to **Amazon S3** and **Cloudfront-CDN**, **Route53-DNS**, **ACM-SSL**.

### Architecture:
![Architecture](https://github.com/nnthanh101/modernapps/raw/main/README/images/s3-website-architecture.png)

> Limit: The websites built using PHP, JSP, or APS.NET are not supported as Amazon s3 doesn't support server-side scripts.

### Project Directory

```
/modernapps/s3-website
├── README.md
├── bin
|  └── s3-website.ts
├── cdk.json
├── jest.config.js
├── lib
|  └── s3-website-stack.ts
├── package.json
├── test
|  └── s3-website.test.ts
└── tsconfig.json
```

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
