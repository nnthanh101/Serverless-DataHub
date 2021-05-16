import * as cdk from "@aws-cdk/core"; 
import { IVpc, SubnetType } from "@aws-cdk/aws-ec2";
import { AwsLogDriver } from "@aws-cdk/aws-ecs";
import { Cluster, FargateService,  FargateTaskDefinition, ContainerDefinition, ContainerImage, Protocol} from "@aws-cdk/aws-ecs";
import { ServicePrincipal, Role, Policy, PolicyStatement, Effect, ManagedPolicy} from "@aws-cdk/aws-iam";
import { ApplicationLoadBalancer, ApplicationListener,ApplicationTargetGroup, Protocol as elbProtocol,TargetType,ApplicationProtocol,ListenerAction} from "@aws-cdk/aws-elasticloadbalancingv2";
import { Duration } from "@aws-cdk/core";

export interface EcsFargateServiceConstructProps  {
  readonly cluster: Cluster;
  readonly alb: ApplicationLoadBalancer;
  readonly loadBalancerListener: ApplicationListener;
  readonly vpc : IVpc;
  // FIXME
  // targetGroup: ApplicationTargetGroup;
 
  
  readonly codelocation: string;
  readonly containerPort: number;
  readonly hostPort: number;
  readonly healthCheckPath: string;

  readonly roleNameFargate?: string;
  readonly policyNameFargate?: string;
  readonly memoryLimitMiB?: number;
  readonly cpu?: number;
  readonly desiredCount?: number;
  readonly maxHealthyPercent?: number;
  readonly minHealthyPercent?: number;
  readonly priority: number;
  readonly pathPattern: string;
  readonly subnetPrivate?: boolean;
  readonly tags?: {
    [key: string]: string;
  };

  readonly noNatVpc:boolean;
}
 
/**
 * ECS-Fargate Service Stack
 */
// export class EcsFargateServiceStack extends FargateService {
export class EcsFargateServiceConstruct extends cdk.Construct {
  readonly fgservice: FargateService;
  readonly containerName:string;
  constructor(parent: cdk.Construct, id: string, props: EcsFargateServiceConstructProps) {
    super(parent, id);
    
    /**
     * 1.ECS Task
     **/
    const taskRole = new Role(parent, id + "-Role", {
      assumedBy: new ServicePrincipal("ecs-tasks.amazonaws.com"),
      description: "Adds managed policies to ecs role for ecr image pulls and execution",
      roleName: props.roleNameFargate ?? id + "-Role",
    });
    
 
    const ecsPolicy: Policy = new Policy(parent,id+ "-Policy", {
      policyName: props.policyNameFargate ?? id + "-Policy",
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            "ecr:GetAuthorizationToken",
            "ecr:BatchCheckLayerAvailability",
            "ecr:GetDownloadUrlForLayer",
            "ecr:BatchGetImage",
            "logs:CreateLogStream",
            "logs:CreateLogGroup",
            "logs:PutLogEvents",
          ],
          resources: ["*"], 
        }),
      ],
    });

    taskRole.attachInlinePolicy(ecsPolicy);
    taskRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "AmazonEC2ContainerRegistryPowerUser"
      )
    );
    taskRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("AmazonECS_FullAccess")
    );
    taskRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess")
    );

    /**
     * 5. ECS Task
     */

    /** 5.1. Create ECS Task definition */
    const taskDef = new FargateTaskDefinition(
      parent,
      id + "-TaskDef",
      {
        memoryLimitMiB: props.memoryLimitMiB ,
        cpu: props.cpu ,
        executionRole: taskRole,
      }
    );

    /** 5.2. Add Container Docker-Image */
    const appContainer = new ContainerDefinition(
      parent,
      id + "-ContainerDef",
      { 
        image: ContainerImage.fromAsset(props.codelocation),
        // image: ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
        taskDefinition: taskDef,
        logging: new AwsLogDriver({
          streamPrefix: id,
        }),
      }
    );
    this.containerName=id + "-ContainerDef";

    /** 5.3. Port mapping */
    appContainer.addPortMappings({
      // hostPort: props.hostPort,
      containerPort: props.containerPort,
      protocol: Protocol.TCP,
    });

    /** 6. Create Fargate Service */ 
    if(props.noNatVpc){
      this.fgservice = new FargateService(parent, id + "-Service", {
        cluster: props.cluster,
        taskDefinition: taskDef,
        desiredCount: props.desiredCount ,
        maxHealthyPercent: props.maxHealthyPercent ,
        minHealthyPercent: props.minHealthyPercent , 
        assignPublicIp:   true ,
        vpcSubnets: {  
          subnetType:  SubnetType.PUBLIC 
        }
      });
    }else{
      this.fgservice = new FargateService(parent, id + "-Service", {
        cluster: props.cluster,
        taskDefinition: taskDef,
        desiredCount: props.desiredCount ,
        maxHealthyPercent: props.maxHealthyPercent ,
        minHealthyPercent: props.minHealthyPercent ,
        // securityGroup: props.securityGrp,
        assignPublicIp: props.subnetPrivate ?  false : true ,
        vpcSubnets: {  
          subnetType: props.subnetPrivate ? SubnetType.PRIVATE: SubnetType.PUBLIC 
        }
      });
    }

   

    /**
     * FIXME Connect service to TargetGroup
     * NOTE: This does not introduce a cycle because ECS Services are self-registering.
     * (they point to the TargetGroup instead of the other way around).
     */ 
    // props.targetGroup.addTarget(this.fgservice);

    // props.loadBalancerListener.addTargets(id + "-TargetGroup", {
    //   port: props.hostPort,
    //   targets: [this.fgservice],
    //   priority: props.priority,
    //   pathPattern: props.pathPattern,
    // });

    // const httpsListener = props.alb.addListener('HttpListener', {
    //   port: props.hostPort,
    //   protocol: ApplicationProtocol.HTTP,
    //   defaultAction: ListenerAction.redirect({protocol: 'HTTP', port: props.hostPort.toString()})
    // });

    // const ecsFargateServiceTargetGroup = new ApplicationTargetGroup(parent,id+'TargetGroup',{
    //   port: props.hostPort, 
    //   healthCheck:{
    //     enabled: true,
    //     path: props.pathPattern,
    //     port: props.hostPort.toString(),
    //     protocol: elbProtocol.HTTP,
    //     unhealthyThresholdCount:5,
    //     timeout:cdk.Duration.seconds(45), 
    //     interval:cdk.Duration.seconds(60),
    //     healthyHttpCodes:'200,301,302'
    //   },
    //   stickinessCookieDuration:cdk.Duration.seconds(604800), 
    //   targetType: TargetType.IP,
    //   vpc: props.vpc,
 
    // });
    // props.loadBalancerListener.addTargetGroups(id+'TgGroupListener', {targetGroups: [ecsFargateServiceTargetGroup]}); 
     
    // ecsFargateServiceTargetGroup.addTarget(this.fgservice); 
      
    // this.fgservice.node.addDependency(props.loadBalancerListener);

    // this.fgservice.attachToApplicationTargetGroup(ecsFargateServiceTargetGroup);

    props.loadBalancerListener.addTargets(id + "-listenerTg", {
      targetGroupName:id + "-albTg",
      port: props.hostPort,
      // protocol:"HTTP" 
      targets: [this.fgservice],
      
      priority: props.priority,
      pathPattern: props.pathPattern,
      healthCheck:{ 
        path:props.healthCheckPath,
        timeout: Duration.seconds(30), 
        interval: Duration.seconds(31),
      },
      stickinessCookieDuration:Duration.days(1)
    });
  

    new cdk.CfnOutput(this, id+"EcsURL", {
      value: props.alb.loadBalancerDnsName+props.healthCheckPath,
      exportName:  id+"EcsURL"
    });

  }
}