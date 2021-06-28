import * as cdk from "@aws-cdk/core";
import { IVpc, SecurityGroup } from "@aws-cdk/aws-ec2";
import {
  ApplicationLoadBalancer, ApplicationListener, ApplicationTargetGroup, IpAddressType,
  ApplicationProtocol, TargetType, ILoadBalancerV2, ListenerCertificate, ListenerAction
} from "@aws-cdk/aws-elasticloadbalancingv2";
import { Cluster } from "@aws-cdk/aws-ecs";

import * as route53 from "@aws-cdk/aws-route53";
import { LoadBalancerTarget } from '@aws-cdk/aws-route53-targets';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { Bucket } from '@aws-cdk/aws-s3';
import {StringParameter, ParameterType} from '@aws-cdk/aws-ssm';

/**
 * @description ecs.ClusterProps https://docs.aws.amazon.com/cdk/api/latest/typescript/api/aws-ecs/clusterprops.html#aws_ecs_ClusterProps
 */
export interface EcsFargateClusterConstructProps {
  readonly vpc: IVpc;
  readonly clusterName?: string;
  readonly containerInsights?: boolean;

  // readonly route53HostedZone: string;
  // readonly route53HostedZoneRecordName: string;
  // readonly loadBalancerName?: string;
  // readonly securityGrp: SecurityGroup;

  // readonly targetGroupName?: string;
  // readonly allowPort: number;
  // readonly listerPort: number;
  readonly tags?: {
    [key: string]: string;
  };

  // readonly acmArn: string;

}

/**
 * VPC >> ECS Cluster
 * Shared Load Balancer: create an empty TargetGroup in the Shared ALB, and register a Service into it in the ServiceStack.
 */
export class EcsFargateClusterConstruct extends cdk.Construct {
  public readonly cluster: Cluster;
  // public readonly alb: ApplicationLoadBalancer;
  // public readonly loadBalancerListener: ApplicationListener;
  // public readonly targetGroup: ApplicationTargetGroup;
  public readonly s3artifact: Bucket;

  constructor(parent: cdk.Construct, id: string, props: EcsFargateClusterConstructProps) {

    super(parent, id);

    /**
     * 1. ECS Cluster
     */
    this.cluster = new Cluster(parent, id + "-Cluster", {
      vpc: props.vpc,
      clusterName: props.clusterName ?? id + "-Cluster",
      containerInsights: props.containerInsights ?? true
    });

    // /**
    //  * 2. ApplicationLoadBalancer
    //  */
    // this.alb = new ApplicationLoadBalancer(
    //   parent,
    //   id + '-alb',
    //   {
    //     vpc: props.vpc,
    //     internetFacing: true,
    //     ipAddressType: IpAddressType.IPV4,
    //     securityGroup: props.securityGrp,
    //     // vpcSubnets: props.vpc.selectSubnets({
    //     //   subnetType: SubnetType.PUBLIC,
    //     // }),
    //     loadBalancerName: props.loadBalancerName ?? id + '-alb',
        
    //   }
    // );

    // /**
    //  * 3. Application TargetGroup
    //  */
    // // const targetGrp = new ApplicationTargetGroup(
    // //   parent,
    // //   id + '-TargetGroup',
    // //   {
    // //     vpc: props.vpc,
    // //     protocol: props.allowPort==80 ? ApplicationProtocol.HTTP : ApplicationProtocol.HTTPS,
    // //     port: props.allowPort,
    // //     targetType: TargetType.IP,
    // //     targetGroupName: props.targetGroupName ?? id + '-TargetGroup',
    // //   }
    // // );

    // /**
    //  * 4. CloudFormation Output
    //  */
    // new cdk.CfnOutput(parent, "ApplicationLoadBalancer DNS", {
    //   value: this.alb.loadBalancerDnsName,
    // });


    // if(props.route53HostedZone!=""){
    //    /**
    //    * 5. Route53
    //    */
    //   const zone = route53.HostedZone.fromLookup(parent, 'baseZone', {
    //     domainName: props.route53HostedZone + '',
    //   });


    //   let ialb: ILoadBalancerV2 = this.alb;
       
    //   /** @deprecated */
    //   // new route53.ARecord(parent, 'WWWAliasRecord', {
    //   //   zone,
    //   //   recordName: 'www.' + props.route53HostedZone,
    //   //   target: route53.RecordTarget.fromAlias(new LoadBalancerTarget(ialb)),
    //   // });

    //   new route53.ARecord(parent, id+ 'AliasRecord', {
    //     zone,
    //     recordName: props.route53HostedZoneRecordName + props.route53HostedZone,
    //     target: route53.RecordTarget.fromAlias(new LoadBalancerTarget(ialb)),
    //   });
    // }
     
    // /**
    //  * 7. Application addListener
    //  */
    // if (props.listerPort === 443) {
    //   /**
    //    * 7.1 ACM
    //    */
    //   const certificate = Certificate.fromCertificateArn(parent,id+ 'Certificate', props.acmArn);
    //   this.loadBalancerListener = this.alb.addListener("Listener", {
    //     protocol: ApplicationProtocol.HTTPS,
    //     port: props.listerPort,
    //     open: true,
    //     defaultAction: ListenerAction.redirect({protocol: 'HTTPS', port: '443',path:'/web/'}),
    //     // defaultTargetGroups: [targetGrp],
    //     certificates: [ListenerCertificate.fromCertificateManager(certificate)]
    //   });

    // } else {
    //   this.loadBalancerListener = this.alb.addListener("Listener", {
    //     protocol: ApplicationProtocol.HTTP,
    //     port: props.listerPort,
    //     open: true,
    //      defaultAction: ListenerAction.redirect({protocol: 'HTTPS', port: '443',path:'/web/' }),
    //     //defaultTargetGroups: [targetGrp], 
    //   });

    // }

    /**
     * 8. S3 artifact
     */ 
    this.s3artifact = new Bucket(parent,id+'artifactbucket');

    /**
     * 9. SSM Parameter store for dockerhub password
     */ 
    const dockerpasswordParamStore = new StringParameter(parent,id+"dockerpasswordStore",{
      parameterName:"ecs-dockerpassword",
      stringValue:"change me",
      type: ParameterType.STRING
    });

    new cdk.CfnOutput(this, id+"ClusterOuput", {
      value: this.cluster.clusterName,
      exportName: 'ClusterName'
    })

  }
}