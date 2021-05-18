/** Configuration file */
export const Config = {

      /** VPC Config*/
      cidr:                "10.10.0.0/18",
      maxAzs:              2,
      natGateways:         0,
      publicPorts:         [80, 443],
      vpcId:               "vpc-11111111111111111",
      vpcConstructId:      "ECS",
      useExistVpc:         "0",
      useDefaultVpc:       "0",

      /** ALB + Route53 + ACM Config */
      loadBalancerConstructName: "ECS-ALB",
      // listenerPort:        443,
      listenerPort:        80,
      publicLoadBalancer:  true,

      route53HostedZone:           "aws.job4u.io",
      route53HostedZoneRecordName: "ecs",
      // route53HostedZone:           "",
      // route53HostedZoneRecordName: "",
      
      /** FIXME SSM >> Parameter Store */ 
      acmArn:'arn:aws:acm:${AWS_REGION}:${AWS_ACCOUNT}:certificate/__YOUR-ACM__',

      /** ECS Config */
      ecsClusterConstructName: "ECS-Cluster", 
      clusterName:             "ECS",
      ecsServiceConstructName: "ECS-Service",
      serviceName:             "ECS",
      serviceNameAlb:          "ECS_ALB",
      taskmemoryLimitMiB:  512,
      taskCPU:             256,
      desiredCount:        1, 
      containerPort:       5000,
      TgrAllowPort:        80,  // PROTOCOL PORT, EX: HTTP-80,HTTPS-443

      /** [React >> SEO] Job4U-Web Config */
      job4uWebCodeLocation:       "../projects/job4u-web", 
      job4uWebHealthCheckPath:    "/",
      job4uWebPathPattern:        "/*",
      job4uWebRepoName:           process.env.Job4UWebRepo+"",

      /** [Node.js] Job4U-Byod Config */
      job4UByodCodeLocation:       "../projects/job4u-byod", 
      job4UByodHealthCheckPath:    "/crawl/",
      job4UByodPathPattern:        "/crawl/*",
      job4UByodRepoName:           process.env.Job4UByodRepo+"",

      /** [SpringBoot] SpringBoot Config */
      // springbootCodeLocation:       "../projects/springboot", 
      // springbootHealthCheckPath:    "/springboot/",
      // springbootPathPattern:        "/springboot/*",
      // springbootRepoName:           process.env.SpringbootRepo+"",

      /** CI/CD Pipeline */
      CicdPipelineConstructId:     "CICD-Pipeline",
      dockerUsername:              "nnthanh101",

      /** Scaler Config */
      FargateAutoscalerConstructId:"Fargate-Auto-Scaler",
      minCapacity: 1,
      maxCapacity: 5,
      
      /** Scale Out Action Config */
      scaleOutAvgPeriod: 60,  /** second */
      scaleOutAvgNumber: 500, /** quantity number */

      /** Scale In Action Config */
      scaleInAvgPeriod:  300, /** second */
      scaleInAvgNumber:  100, /** quantity number */
    
      cpuTargetValue:    60,  /** CPU   (%) */
      memoryTargetValue: 80,  /** Memory(%) */

      /** minutes between scaling actions */
      scaleInCooldown:   10,  /** minutes */
      scaleOutCooldown:  1,   /** minutes */
}