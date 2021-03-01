import {Stack, Construct, StackProps, Environment} from '@aws-cdk/core';
import {Vpc, SubnetType, IVpc}  from '@aws-cdk/aws-ec2';
import { envVars } from '../config/config';

/**
 * FIXME 
 * vpc-construct.ts
 * vpc-no-nat-construct.js
 */
export class VpcStack extends Stack {
	readonly vpc : IVpc;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /** Use an existing VPC or create a new one */
	if (envVars.USE_EXIST_VPC === '1') {
      if (envVars.USE_DEFAULT_VPC === '1') {
        this.vpc =  Vpc.fromLookup(this, id + envVars.VPC_NAME, { isDefault: true });
      } else {
        if (envVars.VPC_ID) {
         this.vpc = Vpc.fromLookup(this, id + envVars.VPC_NAME, { isDefault: false, vpcId: envVars.VPC_ID });
        } 
      }
    } else {
    	this.vpc =  new Vpc(this, id + envVars.VPC_NAME, 
		{
			cidr: envVars.VPC_CIDR,
			maxAzs: envVars.VPC_MAX_AZ,
			natGateways: envVars.VPC_NAT_GW,
			subnetConfiguration: [
				{
					// Using isolated subnet instead of a private subnet to saves cost of a NAT-Gateway inside our VPC.
					cidrMask: envVars.VPC_ISOLATED_CIDRMASK,
					name: 'isolated',
					subnetType: SubnetType.ISOLATED, //No resources will be created for this subnet, but the IP range will be kept available for future creation of this subnet
				},
				{
					cidrMask: envVars.VPC_PUBLIC_CIDRMASK,
					name: 'public',
					subnetType: SubnetType.PUBLIC,
				},
				{
					cidrMask: envVars.VPC_PRIVATE_CIDRMASK,
					name: 'private',
					subnetType: SubnetType.PRIVATE,
				}, 
			],
			enableDnsHostnames:true,
			enableDnsSupport:true,
		}
	)
    }
  }
}
