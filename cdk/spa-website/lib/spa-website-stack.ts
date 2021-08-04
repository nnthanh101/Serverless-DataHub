import * as cdk from '@aws-cdk/core';
import { SpaWebsite } from 'spa-website';

export class SpaWebsiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    /** Deploying a Website to AWS S3 */
    new SpaWebsite(this, 'SPA-Website-S3')
      .createBasicSite({
        indexDoc: 'index.html',
        websiteFolder: '../../../../startup-blueprint'
      });

    /** Deploying a SPA-Website to AWS S3 behind CloudFront CDN */
    new SpaWebsite(this, 'SPA-Website-Cloudfront')
      .createSiteWithCloudfront({
        indexDoc: 'index.html',
        websiteFolder: '../../../../admin-dashboard'
      });

  }
}
