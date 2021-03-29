import * as cdk from '@aws-cdk/core';
import { Config } from '../config/config';
import { VpcConstruct } from './vpc-construct';
import { VpcNoNatConstruct } from './vpc-no-nat-construct';

/**
 * ECS-Fargate
 * 
 * VPC0: 0 NAT-Gateway, Public/Isolated Subnets ONLY
 * VPC1: 2 NAT-Gateway, Public/Private/Isolated Subnets
 * 
 * /web        ==> React.js Frontend 1      <-- fargateAutoscalerStack(Connection) + CodePineline 1
 * /crawl      ==> Crawl Node.js Backend 1  <-- fargateAutoscalerStack(RAM)        + CodePineline 2
 * /sync       ==> Sync  Node.js Backend 2  <-- fargateAutoscalerStack(RAM)        + CodePineline 2
 */
export class EcsFargateStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    /** VpcConstruct: NAT-Gateway >= 1 */
    const vpc = new VpcConstruct(this, Config.vpcConstructId, {
      maxAzs:         Config.maxAzs,
      cidr:           Config.cidr,
      ports:          Config.publicPorts,
      natGateways:    Config.natGateways,
      useDefaultVpc:  Config.useDefaultVpc,
      vpcId:          Config.vpcId,
      useExistVpc:    Config.useExistVpc
    });

    /** VpcNoNatConstruct: NAT-Gateway == 0 */
    // const vpc = new VpcNoNatConstruct(this, Config.vpcConstructId, {
    //     maxAzs: Config.maxAzs,
    //     cidr: Config.cidr,
    //     ports: Config.publicPorts,
    //     natGateways: Config.natGateways,
    //     useDefaultVpc: Config.useDefaultVpc,
    //     vpcId: Config.vpcId,
    //     useExistVpc: Config.useExistVpc
    // }); 

  }
}
