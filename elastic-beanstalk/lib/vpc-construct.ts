import {Stack, Construct, StackProps, Environment} from '@aws-cdk/core';
import {Vpc, SubnetType, IVpc}  from '@aws-cdk/aws-ec2';

/**
 * FIXME 
 * vpc-construct.ts
 * vpc-no-nat-construct.js
 */
 
 export interface VpcConstructProps   {
  readonly cidr?: string;
  readonly maxAzs?: number;
  readonly natGateways?: number;
  readonly cidrPublic?: number;
  readonly cidrPrivate?: number;
  readonly cidrIsolated?: number;
  readonly vpcName: string;
  readonly tags?: {
    [key: string]: string;
  };
  readonly useDefaultVpc: string;
  readonly useExistVpc: string;
  readonly vpcId: string;
}
 
export class VpcConstruct extends Construct {
	readonly vpc : IVpc;
  constructor(scope: Construct, id: string, props: VpcConstructProps) {
    super(scope, id);

    /** Use an existing VPC or create a new one */
	if (props.useExistVpc === '1') {
      if (props.useDefaultVpc === '1') {
        this.vpc =  Vpc.fromLookup(scope, id + props.vpcName, { isDefault: true });
      } else {
        if (props.vpcId) {
         this.vpc = Vpc.fromLookup(scope, id + props.vpcName, { isDefault: false, vpcId: props.vpcId });
        } 
      }
    } else {
    	this.vpc =  new Vpc(scope, id + props.vpcName, 
		{
			cidr: props.cidr,
			maxAzs: props.maxAzs,
			natGateways: props.natGateways,
			subnetConfiguration: [
				{
					// Using isolated subnet instead of a private subnet to saves cost of a NAT-Gateway inside our VPC.
					cidrMask: props.cidrIsolated,
					name: 'isolated',
					subnetType: SubnetType.ISOLATED, //No resources will be created for this subnet, but the IP range will be kept available for future creation of this subnet
				},
				{
					cidrMask: props.cidrPublic,
					name: 'public',
					subnetType: SubnetType.PUBLIC,
				},
				{
					cidrMask: props.cidrPrivate,
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
