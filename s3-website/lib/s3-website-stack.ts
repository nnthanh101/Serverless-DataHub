import * as cdk from '@aws-cdk/core';
import { S3WebsiteConstruct } from './s3-website-construct';

export class S3WebsiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    /** Create Basic Site */
    new S3WebsiteConstruct(this, 'spaDeploy')
    .createBasicSite({
      indexDoc: 'index.html',
      websiteFolder: '../blog/dist/blog'
    });

    /** Create Site with Cloudfront */
    new S3WebsiteConstruct(this, 'cfDeploy')
      .createSiteWithCloudfront({
        indexDoc: 'index.html',
        websiteFolder: '../blog/dist/blog'
      });

  }
}
