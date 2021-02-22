# AWS S3 Website Pattern (React, Vue, Angular)

This [CDK Pattern](https://cdkpatterns.com/patterns/) to make deploying a SPA Website (React/Vue/Angular) to **AWS S3** behind **Cloudfront CDN**, **Route53 DNS**, **AWS Certificate Manager SSL** easier.

### Architecture:
![Architecture](../README/images/s3-website-architecture.png)

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
