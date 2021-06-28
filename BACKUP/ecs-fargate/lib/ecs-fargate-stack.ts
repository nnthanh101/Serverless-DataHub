import { Stack, Construct, StackProps } from "@aws-cdk/core";

import { InterfaceVpcEndpoint, InterfaceVpcEndpointAwsService, SubnetType }   from '@aws-cdk/aws-ec2';
import { Config }                           from '../config/config';
import { ApplicationLoadBalancerConstruct } from '../constructs/alb-construct';
import { CiCdPipelineConstruct }            from '../constructs/cicd-pipeline-construct';
import { EcsFargateClusterConstruct }       from '../constructs/ecs-fargate-cluster-construct';
import { EcsFargateServiceConstruct }       from '../constructs/ecs-fargate-service-construct';
import { FargateAutoscalerConstruct }       from '../constructs/fargate-autoscaler-construct';
import { VpcConstruct }                     from '../constructs/vpc-construct';
import { VpcNoNatConstruct }                from '../constructs/vpc-no-nat-construct';
import { VpcEndpointConstruct }             from "../constructs/vpc-endpoint-construct";

/**
 * ECS-Fargate
 * 
 * VPC0: 0 NAT-Gateway, Public/Isolated Subnets ONLY
 * VPC1: 2 NAT-Gateway, Public/Private/Isolated Subnets
 * 
 * /web   ==> React.js Micro-Frontend  <-- fargateAutoscalerStack(Connection) + CodePineline 1
 * /data  ==> Node.js BYOD Backend     <-- fargateAutoscalerStack(RAM)        + CodePineline 2
 */
export class EcsFargateStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // /** Step 1. VpcConstruct: NAT-Gateway >= 1 */
    // const vpc = new VpcConstruct(this, Config.vpcConstructId, {
    //   maxAzs:         Config.maxAzs,
    //   cidr:           Config.cidr,
    //   ports:          Config.publicPorts,
    //   natGateways:    Config.natGateways,
    //   useDefaultVpc:  Config.useDefaultVpc,
    //   vpcId:          Config.vpcId,
    //   useExistVpc:    Config.useExistVpc
    // });

    /** Step 1*. VpcNoNatConstruct: NAT-Gateway == 0 */
    const vpc = new VpcNoNatConstruct(this, Config.vpcConstructId, {
        maxAzs:        Config.maxAzs,
        cidr:          Config.cidr,
        ports:         Config.publicPorts,
        natGateways:   Config.natGateways,
        useDefaultVpc: Config.useDefaultVpc,
        vpcId:         Config.vpcId,
        useExistVpc:   Config.useExistVpc
    // }).vpc;
    });

    /**
     * FIXME: Interface VPC Endpoint: SSM, API-Gateway, ...
     * @see InterfaceVpcEndpointAwsService
     */

    // /** [Interface VPC Endpoint] >> SSM */
    // const ssmVPCEndpoint = new VpcEndpointConstruct(this, id + "ssmvpce", {
    //   service: {
    //     name:             `com.amazonaws.${Stack.of(this).region}.ssm`,
    //     port:             22
    //   },
    //   vpc:                vpc,
    //   lookupSupportedAzs: true,
    //   open:               true,
    //   privateDnsEnabled:  true,
    //   subnets: {
    //     subnetType:       SubnetType.ISOLATED,
    //     onePerAz:         true
    //   }
    // });

    // /** [Interface VPC Endpoint] >> SSM Messages */
    // const ssmMessagesVPCE = new VpcEndpointConstruct(this, id + "ssmmessagesvpce", {
    //   service: {
    //     name:             `com.amazonaws.${Stack.of(this).region}.ssmmessages`,
    //     port:             22
    //   },
    //   vpc:                vpc,
    //   lookupSupportedAzs: true,
    //   open:               true,
    //   privateDnsEnabled:  true,
    //   subnets: {
    //     subnetType:       SubnetType.ISOLATED,
    //     onePerAz:         true
    //   }
    // });

    // /** [Interface VPC Endpoint] >> API-Gateway */
    // const vpce = new InterfaceVpcEndpoint(this, 'VPC Private Interface Endpoint', {
    //   service: InterfaceVpcEndpointAwsService.APIGATEWAY,
    //   vpc: vpc,
    //   privateDnsEnabled: true,
    //   subnets: vpc.selectSubnets({
    //       subnetType: SubnetType.ISOLATED
    //   })
    // })
    
    /** Step 2. Application Load Balancer */
    const applicationLoadBalancer = new ApplicationLoadBalancerConstruct(this,Config.loadBalancerConstructName,{
      listerPort:                  Config.listenerPort,
      publicLoadBalancer:          Config.publicLoadBalancer,
      vpc:                         vpc.vpc,
      securityGrp:                 vpc.securityGrp,
      route53HostedZone:           Config.route53HostedZone,
      route53HostedZoneRecordName: Config.route53HostedZoneRecordName,
      acmArn:                      Config.acmArn,
    })

    /** Step 3.1. ECS Cluster */
    const ecsFargateCluster = new EcsFargateClusterConstruct(this, Config.ecsClusterConstructName, {
      vpc:         vpc.vpc,
      // allowPort:   Config.TgrAllowPort,
      clusterName: Config.clusterName, 
      containerInsights:           true
    });

    /** Step 3.2. ECS Service & Task */
    const job4UWeb = new EcsFargateServiceConstruct(this,"Job4U-Web"+ Config.ecsServiceConstructName, {
      alb: applicationLoadBalancer.alb,
      vpc: vpc.vpc,
      loadBalancerListener: applicationLoadBalancer.loadBalancerListener,
      cluster:              ecsFargateCluster.cluster,
      codelocation:         Config.job4uWebCodeLocation,
      containerPort:        Config.containerPort,
      hostPort:             Config.TgrAllowPort,
      desiredCount:         Config.desiredCount,
      healthCheckPath:      Config.job4uWebHealthCheckPath,
      priority: 1,          /* => root path must have lowest priority */
      pathPattern:          Config.job4uWebPathPattern, 
      // noNatVpc:false /** => set to true if use VpcNoNatConstruct for service's vpc */
      noNatVpc:true     /** Provision the EcsFargateService in Public Subnet */
    });

    /** Step 4. CI/CD Pipeline */
    const job4UWebCicdPipeline = new CiCdPipelineConstruct(this,"Job4U-Web" + Config.CicdPipelineConstructId,{
        clusterName:    ecsFargateCluster.cluster.clusterName,
        ecsService:     job4UWeb.fgservice,
        containerName:  job4UWeb.containerName,
        dockerUsername: Config.dockerUsername,
        // dockerCredentialSecretArn: Config.dockerCredentialSecretArn,
        // runtimeEnv:                Config.runtimeEnv,
        s3artifact:     ecsFargateCluster.s3artifact,
        repoName:       Config.job4uWebRepoName
    });

    /** Step 5. ECS AutoScaler */
     const job4UWebAutoScaler = new FargateAutoscalerConstruct(this,"Job4U-Web"+Config.FargateAutoscalerConstructId,{
      cluster:   ecsFargateCluster.cluster,
      ecsService:job4UWeb.fgservice,  
      maxCapacity:      Config.maxCapacity,
      minCapacity:      Config.minCapacity,
      cpuTargetValue:   Config.cpuTargetValue,
      memoryTargetValue:Config.memoryTargetValue,
      scaleInCooldown:  Config.scaleInCooldown,
      scaleOutCooldown: Config.scaleOutCooldown,
      alb:              applicationLoadBalancer.alb,
      scaleOutAvgPeriod:Config.scaleOutAvgPeriod,
      scaleOutAvgNumber:Config.scaleOutAvgNumber,
      scaleInAvgPeriod: Config.scaleInAvgPeriod,
      scaleInAvgNumber: Config.scaleInAvgNumber
    });

  }
}
