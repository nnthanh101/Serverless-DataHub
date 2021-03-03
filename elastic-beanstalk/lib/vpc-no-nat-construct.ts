import * as cdk from "@aws-cdk/core";
import {Vpc ,IVpc,SecurityGroup,SubnetType,GatewayVpcEndpointAwsService } from "@aws-cdk/aws-ec2";

export interface VpcConstructProps  {
  readonly cidr?: string;
  readonly maxAzs?: number;
  readonly natGateways?: number;
  readonly ports: number[];
  readonly tags?: {
    [key: string]: string;
  };
  readonly useDefaultVpc: string;
  readonly useExistVpc: string;
  readonly vpcId: string;
}

/** 
 * Creating VPC Without NAT Gateway 
 * 
 * This required only use PublicSubnet because PrivateSubnet and IsolatedSubnet automatically create NAT Gateway
 * 
 */
export class VpcNoNatConstruct extends cdk.Construct {
  public readonly vpc: IVpc;
  readonly securityGrp: SecurityGroup;
 
  constructor(parent: cdk.Construct, id: string, props: VpcConstructProps) {
    super(parent, id );

    if (props.useExistVpc === '1') {
      if (props.useDefaultVpc === '1') {
        this.vpc = Vpc.fromLookup(parent, id+'VPC', { isDefault: true });
      } else {
        if (props.vpcId) {
          this.vpc = Vpc.fromLookup(parent, id+'VPC', { isDefault: false, vpcId: props.vpcId });
        }  
      }
    } else {
      this.vpc = new Vpc(parent, id+'VPC', {
        cidr: props.cidr, 
        maxAzs: props.maxAzs,
        natGateways: props.natGateways,
        natGatewaySubnets: { subnets: [] },
        subnetConfiguration: [
          {
            name: 'PUBLIC',
            subnetType: SubnetType.PUBLIC,
            cidrMask: 24, 
            
          }, 
        ],
        gatewayEndpoints: {
          S3: {
            service: GatewayVpcEndpointAwsService.S3,
          },
          DynamoDB: {
            service: GatewayVpcEndpointAwsService.DYNAMODB,
          }
        },
      });
    }

    /** Get Elastic IP */
    // FIXME: If natGateways=0 
    // this.vpc.publicSubnets.forEach((subnet, index) => {
    //   // Find the Elastic IP
    //   const EIP = subnet.node.tryFindChild('EIP') as CfnEIP
    //   new cdk.CfnOutput(parent, `VPC-EIP-${index}`, { value: EIP.ref });
    // });

    /**
     * Security Group  => THIS AUTOMATICALLY CREATE NATGW
     */
    // this.securityGrp = new SecurityGroup(parent, id + '-SecurityGroup', {
    //   allowAllOutbound: true,
    //   securityGroupName: 'HttpPublicSecurityGroup',
    //   vpc: this.vpc, 
    // });

    // var self = this;
    // props.ports.forEach(function (val) { 
    //   if (val != 0) {
    //     self.securityGrp.connections.allowFromAnyIpv4(Port.tcp(val));
    //   }
    // });

    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      exportName: 'VpcId'
    })
    
  }
 
}
