import { Construct  } from 'constructs';
import { aws_cloudfront as cloudfront } from 'aws-cdk-lib';

export class CloudfrontConstruct extends Construct {
    newDistribution: cloudfront.CloudFrontWebDistribution;
    /** Define new bucket variables here: */

    constructor( scope: Construct, id: string, props:cloudfront.CloudFrontWebDistributionProps) {
        super(scope, id)
 
        const distribution = new cloudfront.CloudFrontWebDistribution(this, id+'CFDistribution',props );
  
        this.newDistribution=distribution;
    }
}