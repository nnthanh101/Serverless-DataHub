import core = require("@aws-cdk/core");
import * as ec2 from "@aws-cdk/aws-ec2";

export interface BastonHostProps {
  readonly vpc: ec2.Vpc;
  readonly openSSHfrom: string;
  readonly tags?: {
    [key: string]: string;
  };
}

/**
 * Creating Bastion Host
 */
export class BastonHostStack extends core.Stack {
  constructor(parent: core.App, name: string, props: BastonHostProps) {
    super(parent, name, {
      ...props,
    });
    
    /** 
     * EC2 AMI: Amazon Linux 2 vs. Ubuntu 
     * EC2 instance type: t3.small
     */
    const host = new ec2.BastionHostLinux(this, 'BastionHost', {
        vpc: props.vpc,
        subnetSelection: { subnetType: ec2.SubnetType.PUBLIC },
      });
      host.allowSshAccessFrom(ec2.Peer.ipv4(props.openSSHfrom));
  }
}





  