import {Vpc, IVpc, InstanceType, SubnetType} from '@aws-cdk/aws-ec2';
import {Construct, CfnOutput} from '@aws-cdk/core';
import {Ec2Environment} from '@aws-cdk/aws-cloud9';

export interface Cloud9ConstructProps {
  readonly vpc: IVpc;
  readonly tags?: {
    [key: string]: string;
  };
}

/**
 * 
 */
export class Cloud9Construct extends Construct {
  readonly vpc: IVpc;
  constructor(scope: Construct, id: string, props: Cloud9ConstructProps) {
    super(scope, id);
    this.vpc = props.vpc;
    
    const c9 = new Ec2Environment(this, id+'-Cloud9Env', {
		vpc: this.vpc,
		instanceType: new InstanceType('t3.large'),
		subnetSelection: {
    		subnetType: SubnetType.PUBLIC
    	}
	});
    
    new CfnOutput(this, 'URL-C9', { value: c9.ideUrl });
  }
}