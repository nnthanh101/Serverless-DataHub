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
import { RDSConstruct }                     from "../constructs/rds-construct";
import { Cloud9Construct }                  from "../constructs/cloud9-construct";

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

    /** Step 1. VpcConstruct: NAT-Gateway >= 1 */
    const vpc = new VpcConstruct(this, Config.vpcConstructId, {
      maxAzs:         Config.maxAzs,
      cidr:           Config.cidr,
      ports:          Config.publicPorts,
      natGateways:    Config.natGateways,
      useDefaultVpc:  Config.useDefaultVpc,
      vpcId:          Config.vpcId,
      useExistVpc:    Config.useExistVpc
    });

    // /** Step 1*. VpcNoNatConstruct: NAT-Gateway == 0 */
    // const vpc = new VpcNoNatConstruct(this, Config.vpcConstructId, {
    //     maxAzs:        Config.maxAzs,
    //     cidr:          Config.cidr,
    //     ports:         Config.publicPorts,
    //     natGateways:   Config.natGateways,
    //     useDefaultVpc: Config.useDefaultVpc,
    //     vpcId:         Config.vpcId,
    //     useExistVpc:   Config.useExistVpc
    // // }).vpc;
    // });

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
    /** Step 2. Cloud9 Development Environment  */
    const c9Env = new Cloud9Construct(this, id + '-C9', {
          vpc: vpc.vpc
    });
    
    /** Step 3. Application Load Balancer */
    const applicationLoadBalancer = new ApplicationLoadBalancerConstruct(this,Config.loadBalancerConstructName,{
      listerPort:                  Config.listenerPort,
      publicLoadBalancer:          Config.publicLoadBalancer,
      vpc:                         vpc.vpc,
      securityGrp:                 vpc.securityGrp,
      route53HostedZone:           Config.route53HostedZone,
      route53HostedZoneRecordName: Config.route53HostedZoneRecordName,
      acmArn:                      Config.acmArn,
    })
    
    /** Step 4. RDS MySQL */
    const rdsmysql =  new RDSConstruct(this, id + '-MysqlRDS', {
      vpc:                 vpc.vpc,
      rdsType:             'MYSQL',
      rdsInstanceName:     Config.RDS_MYSQL_INSTANCE_NAME,
      rdsCredentiallUser:  Config.RDS_MYSQL_CREDENTIAL_USERNAME,
      rdsCredentialPass:   Config.RDS_MYSQL_CREDENTIAL_PAWSSWORD,
      rdsDatabaseName:     Config.RDS_MYSQL_DATABASE_NAME,
      allocatedStorage:    Config.RDS_MYSQL_ALLOCATED_STORAGE,
      maxAllocatedStorage: Config.RDS_MYSQL_MAX_ALLOCATED_STORAGE,
      port:                Config.RDS_MYSQL_PORT
    });

    /** Step 5.1. ECS Cluster */
    const ecsFargateCluster = new EcsFargateClusterConstruct(this, Config.ecsClusterConstructName, {
      vpc:         vpc.vpc,
      // allowPort:   Config.TgrAllowPort,
      clusterName: Config.clusterName, 
      containerInsights:           true
    });
    
    
    const environmentECS = {
        'MYSQL_PASS'                      :Config.RDS_MYSQL_CREDENTIAL_PAWSSWORD,
        'MYSQL_USER'                      :Config.RDS_MYSQL_CREDENTIAL_USERNAME,
        'MYSQL_URL'                       :rdsmysql.jdbcConnection,
        'spring.datasource.initialize'    :'yes',
        'spring.profiles.active'          :'mysql'
    }

    /** Step 5.2. ECS Service & Task */
    const petstoreWeb = new EcsFargateServiceConstruct(this,"Petstore-Web"+ Config.ecsServiceConstructName, {
      alb: applicationLoadBalancer.alb,
      vpc: vpc.vpc,
      loadBalancerListener: applicationLoadBalancer.loadBalancerListener,
      cluster:              ecsFargateCluster.cluster,
      codelocation:         Config.petstoreWebCodeLocation,
      containerPort:        Config.containerPort,
      hostPort:             Config.TgrAllowPort,
      desiredCount:         Config.desiredCount,
      healthCheckPath:      Config.petstoreWebHealthCheckPath,
      healthyCheckTimeout:  Config.petstoreWebHealthCheckTimeout,
      healthyCheckInterval: Config.petstoreWebHealthCheckInterval,
      healthyThresholdCount:Config.petstoreWebHealthCheckCount,
      unhealthyThresholdCount:Config.petstoreWebUnhealthCheckCount,
      priority: 1,          /* => root path must have lowest priority */
      pathPattern:          Config.petstoreWebPathPattern, 
      // noNatVpc:false /** => set to true if use VpcNoNatConstruct for service's vpc */
      noNatVpc:false,     /** Provision the EcsFargateService in Public Subnet */
      environmentECS:       environmentECS
    });

    /** Step 6. CI/CD Pipeline */
    const petstoreWebCicdPipeline = new CiCdPipelineConstruct(this,"Petstore-Web" + Config.CicdPipelineConstructId,{
        clusterName:    ecsFargateCluster.cluster.clusterName,
        ecsService:     petstoreWeb.fgservice,
        containerName:  petstoreWeb.containerName,
        dockerUsername: Config.dockerUsername,
        // dockerCredentialSecretArn: Config.dockerCredentialSecretArn,
        // runtimeEnv:                Config.runtimeEnv,
        s3artifact:     ecsFargateCluster.s3artifact,
        repoName:       Config.petstoreWebRepoName
    });

    /** Step 7. ECS AutoScaler */
     const petstoreWebAutoScaler = new FargateAutoscalerConstruct(this,"Petstore-Web"+Config.FargateAutoscalerConstructId,{
      cluster:   ecsFargateCluster.cluster,
      ecsService:petstoreWeb.fgservice,  
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
