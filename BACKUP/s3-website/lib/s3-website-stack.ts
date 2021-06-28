import * as cdk from '@aws-cdk/core';
import { S3WebsiteConstruct } from '../constructs/s3-website-construct';
import { CloudFrontAllowedMethods, CloudFrontAllowedCachedMethods } from '@aws-cdk/aws-cloudfront';

export class S3WebsiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    /** Create Basic Site */
    new S3WebsiteConstruct(this, 'spaDeploy')
      .createBasicSite({
        indexDoc: 'index.html',
        websiteFolder: '../projects/job4u-web/build/',
      });

    /** Create Site with Cloudfront */
    new S3WebsiteConstruct(this, 'cfDeploy')
      .createSiteWithCloudfront({
        indexDoc: 'index.html',
        websiteFolder: '../projects/job4u-web/build/',
        cfBehaviors: [
          {
            isDefaultBehavior: true,
            allowedMethods: CloudFrontAllowedMethods.ALL,
            forwardedValues: {
              queryString: true,
              cookies: { forward: 'all' }, /** cookies cant set to all because this make the CF not caching anything, need to refactor base on project needs */
              // headers: ['*'],  /** header cant set to all because this make the CF not caching anything */
            },
          },
          {
            pathPattern: '/',
            allowedMethods:  CloudFrontAllowedMethods.GET_HEAD,
            cachedMethods:  CloudFrontAllowedCachedMethods.GET_HEAD,
          },
        ],
      });

    /** Create Site with Cloudfront
     * 
     * You will need to have your own domain to run this example
     * 
     */
    // new S3WebsiteConstruct(this, 'hzDeploy')
    //   .createSiteFromHostedZone({
    //     indexDoc: 'index.html',
    //     websiteFolder: 'static-website/website2',
    //     zoneName: 'findajob4me.xyz', /** this zonename must have ACM cert validated */ 
    //   });

  }
}
