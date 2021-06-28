import * as cdk from "@aws-cdk/core";
import {
  Vpc, IVpc, SecurityGroup, SubnetType, GatewayVpcEndpointAwsService,
  ISecurityGroup, SubnetSelection, IInterfaceVpcEndpointService, InterfaceVpcEndpoint, Peer, Port
} from "@aws-cdk/aws-ec2";

export interface VpcEndpointConstructProps {
  readonly service: IInterfaceVpcEndpointService,
  readonly vpc: IVpc,
  readonly lookupSupportedAzs?: boolean,
  readonly open?: boolean,
  readonly privateDnsEnabled?: boolean,
  readonly subnets?: SubnetSelection
}
 
export class VpcEndpointConstruct extends cdk.Construct {
  vpce: InterfaceVpcEndpoint;


  constructor(parent: cdk.Construct, id: string, props: VpcEndpointConstructProps) {
    super(parent, id);

    const endpointSecurityGroup = new SecurityGroup(parent, id + '-endpointSG', {
      allowAllOutbound: true,
      securityGroupName: id + 'endpointSG',
      vpc: props.vpc,
    });

    endpointSecurityGroup.addIngressRule(Peer.ipv4("0.0.0.0/0"), Port.allTcp(), "open end point");

    this.vpce = new InterfaceVpcEndpoint(parent, id + "ssmvpce", {
      service: props.service,
      vpc: props.vpc,
      lookupSupportedAzs: props.lookupSupportedAzs,
      open: props.open,
      privateDnsEnabled: props.privateDnsEnabled,
      securityGroups: [endpointSecurityGroup],
      subnets: props.subnets
    });

    new cdk.CfnOutput(parent, id + 'vpcEndpointId', {
      value: this.vpce.vpcEndpointId,
      exportName: id + 'vpcEndpointId'
    });

  }

}
