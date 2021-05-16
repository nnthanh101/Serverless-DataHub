# S3Website CDK Construct >> Omni-Channel

This is an AWS CDK Construct to make deploying a single page website (React/Vue/Angular SPA) to AWS S3 behind SSL/Cloudfront as easy as 5 lines of code.

## Installation and Usage

```typescript
import cdk = require('@aws-cdk/core');
import { S3WebsiteConstruct } from './s3-website-construct';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new S3WebsiteConstruct(this, 'spaDeploy')
      .createBasicSite({
        indexDoc: 'index.html',
        websiteFolder: '../blog/dist/blog'
      });

    new S3WebsiteConstruct(this, 'cfDeploy')
      .createSiteWithCloudfront({
        indexDoc: 'index.html',
        websiteFolder: '../blog/dist/blog'
      });
  }
}
```

## Advanced Usage

### Auto Deploy From Hosted Zone Name

If you purchased your domain through route 53 and already have a hosted zone then just use the name to deploy your site behind cloudfront. This handles the SSL cert and everything for you.

```typescript
new S3WebsiteConstruct(this, 'spaDeploy', { encryptBucket: true })
  .createSiteFromHostedZone({
    zoneName: 'cdkpatterns.com',
    indexDoc: 'index.html',
    websiteFolder: '../website/dist/website'
  });

```

### Custom Domain and SSL Certificates

You can also pass the ARN for an SSL certification and your alias routes to cloudfront

```typescript
import cdk = require('@aws-cdk/core');
import { S3WebsiteConstruct } from './s3-website-construct';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new SPADeploy(this, 'cfDeploy')
      .createSiteWithCloudfront({
        indexDoc: '../blog/dist/blog',
        certificateARN: 'arn:...',
        cfAliases: ['www.alias.com']
      });
  }  
}

```

### Encrypted S3 Bucket

Pass in one boolean to tell SPA Deploy to encrypt your website bucket

```typescript
new S3WebsiteConstruct(this, 'cfDeploy', {encryptBucket: true}).createBasicSite({
    indexDoc: 'index.html',
    websiteFolder: 'website'
});

```

### Custom Origin Behaviors

Pass in an array of CloudFront Behaviors 

```typescript
new S3WebsiteConstruct(this, 'cfDeploy').createSiteWithCloudfront({
  indexDoc: 'index.html',
  websiteFolder: 'website',
  cfBehaviors: [
    {
      isDefaultBehavior: true,
      allowedMethods: cf.CloudFrontAllowedMethods.ALL,
      forwardedValues: {
        queryString: true,
        cookies: { forward: 'all' },
        headers: ['*'],
      },
    },
    {
      pathPattern: '/virtual-path',
      allowedMethods: cf.CloudFrontAllowedMethods.GET_HEAD,
      cachedMethods: cf.CloudFrontAllowedCachedMethods.GET_HEAD,
    },
  ],
});
```

### Restrict Access to Known IPs

Pass in a boolean and an array of IP addresses and your site is locked down!

```typescript
new S3WebsiteConstruct(stack, 'spaDeploy', { 
  encryptBucket: true, 
  ipFilter: true, 
  ipList: ['1.1.1.1']
}).createBasicSite({
    indexDoc: 'index.html',
    websiteFolder: 'website'
  })
```

### Modifying S3 Bucket Created in Construct

An object is now returned containing relevant artifacts created if you need to make any further modifications:
  * The S3 bucket is present for all of the methods
  * When a CloudFront Web distribution is created it will be present in the return object

```typescript
export interface SPADeployment {
  readonly websiteBucket: s3.Bucket,
}

export interface SPADeploymentWithCloudFront extends SPADeployment {
  readonly distribution: CloudFrontWebDistribution,
}
```