import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CdkSpa } from 'cdk-spa';

interface Props extends cdk.StackProps {
  contentBucket: string;
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    // The code that defines your stack goes here

    /**
     * Encrypted S3 Bucket
     * Deploying a SPA-Website to AWS S3 behind CloudFront CDN
     * Auto Deploy to/from Hosted Zone Name
     */
    new CdkSpa(this, 'CDK-SPA Website behind Cloudfront CDN', {
      bucketName: props.contentBucket,
      encryptBucket: true,
      // ipFilter: true,
      // ipList: ['1.1.1.1']
    })
      .createSiteWithCloudfront({
        // .createSiteFromHostedZone({
        //   zoneName: 'dashboard.aws.oceansoft.io',
        indexDoc: 'index.html',
        websiteFolder: '../frontend'
      });

  }
}
