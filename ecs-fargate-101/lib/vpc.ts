import core = require("@aws-cdk/core");
import { Vpc as EC2Vpc, SubnetType } from "@aws-cdk/aws-ec2";

export interface VpcProps {
  readonly maxAzs: number;
  readonly cidr: string;
  readonly tags?: {
    [key: string]: string;
  };
}

/** 
 * Creating VPC
 */
export class Vpc extends core.Stack {
  public readonly vpc: EC2Vpc;
  constructor(parent: core.App, name: string, props: VpcProps) {
    super(parent, name, {
      ...props,
    });
    this.vpc = new EC2Vpc(this, 'MyVpc', { 
      maxAzs: props.maxAzs,
      cidr: props.cidr,
      subnetConfiguration: [
        {
          name: 'ingress',
          cidrMask: 24,
          subnetType: SubnetType.PUBLIC,
        },
        {
          name: 'application',
          cidrMask: 24,
          subnetType: SubnetType.PRIVATE,
        }
     ]});
  }
}
