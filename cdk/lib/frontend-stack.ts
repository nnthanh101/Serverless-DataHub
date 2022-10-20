import { StackProps, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CdkSpa } from 'cdk-spa';

interface Props extends StackProps {
  contentBucket: string;
}

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    /**
     * 1. Encrypted S3 Bucket
     * 2. Deploying a SPA-Website to AWS S3 behind CloudFront CDN
     * 3. Auto Deploy to/from Hosted Zone Name
     */
    new CdkSpa(this, 'CDK-SPA Website behind Cloudfront CDN', {
      bucketName: props.contentBucket,
      encryptBucket: true,
      // ipFilter: true,
      // ipList: ['1.1.1.1']
    })
      /* Option 1. Basic setup needed for a non-SSL, non vanity url, non cached S3 website. */
      .createSiteS3({
        // /* Option 2. S3 deployment will be created, which is fronted by a Cloudfront Distribution. */
        // .createSiteWithCloudfront({
        // /* Option 3. The deployment of S3, Cloudfront Distribution, ACM SSL certificates, and Route53 hosted zones. */
        // .createSiteFromHostedZone({
        //   zoneName: 'serverless.aws.oceansoft.io',
        indexDoc: 'index.html',
        websiteFolder: '../frontend'
      });

  }
}
