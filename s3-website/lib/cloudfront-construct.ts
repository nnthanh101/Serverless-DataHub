import { Construct  } from '@aws-cdk/core';
import { PolicyStatement, Effect, AnyPrincipal } from '@aws-cdk/aws-iam';
import { CloudFrontWebDistribution, CloudFrontWebDistributionProps } from '@aws-cdk/aws-cloudfront';

export class CloudfrontConstruct extends Construct {
    newDistribution: CloudFrontWebDistribution;
    /** Define new bucket variables here: */

    constructor( scope: Construct, id: string, props:CloudFrontWebDistributionProps) {
        super(scope, id)
 
        const distribution = new CloudFrontWebDistribution(this, id+'CfDistribution',props );
  
        this.newDistribution=distribution;
    }
}