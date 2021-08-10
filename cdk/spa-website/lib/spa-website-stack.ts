import * as cdk from '@aws-cdk/core';
import { SpaWebsite } from 'spa-website';

export class SpaWebsiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    /** Deploying a Website to AWS S3 */
    // new SpaWebsite(this, 'SPA-Website-S3')
    //   .createBasicSite({
    //     indexDoc:        'index.html',
    //     websiteFolder:   '../../projects/startup-blueprint'
    //   });

    /** Deploying a SPA-Website to AWS S3 behind CloudFront CDN */
    new SpaWebsite(this, 'SPA-Website-Cloudfront', { encryptBucket: true })
      .createSiteWithCloudfront({
        indexDoc:       'index.html',
        websiteFolder:  '../../projects/admin-dashboard/build',
        /** Deploying a SPA-Website to AWS S3 behind CloudFront CDN + Custom Domain and SSL Certificates */
        // certificateARN: 'arn:aws:acm:us-east-1:XXX:certificate/XXX',
        // cfAliases:      ['spa-website.devax.job4u.vn']
      });

  }
}
