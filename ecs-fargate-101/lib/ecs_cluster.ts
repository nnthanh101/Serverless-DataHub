import core = require("@aws-cdk/core");
import ecs = require("@aws-cdk/aws-ecs");
import ec2 = require("@aws-cdk/aws-ec2");

export interface EcsClusterStackProps {
  readonly vpc: ec2.Vpc;
  readonly clusterName: string;
  readonly tags?: {
    [key: string]: string;
  };
}

/**
 * Creating ECS cluster
 */
export class EcsClusterStack extends core.Stack {
  readonly cluster: ecs.ICluster;

  constructor(parent: core.App, name: string, props: EcsClusterStackProps) {
    super(parent, name, {
      tags: props.tags,
    });

    this.cluster = new ecs.Cluster(this, "Cluster", {
      vpc: props.vpc,
      clusterName: props.clusterName,
    });
  }
}
