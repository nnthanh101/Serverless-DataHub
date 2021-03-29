/** Configuration file */
export const Config = {

      /** VPC Config*/
      cidr:                "10.10.0.0/18",
      maxAzs:              2,
      natGateways:         1,
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

      // route53HostedZone:           "aws.job4u.io",
      // route53HostedZoneRecordName: "ecs",
      route53HostedZone:           "",
      route53HostedZoneRecordName: "",
      
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
      containerPort:       3000,
      TgrAllowPort:        80,  // PROTOCOL PORT, EX: HTTP-80,HTTPS-443

      /** Job4U-Web Config */
      job4uwebCodeLocation:       "docker/job4u-web", 
      job4uwebHealthCheckPath:    "/web/",
      job4uwebPathPattern:        "/web/*",
      job4uwebRepoName:           process.env.Job4UWebRepo+"",

      /** CI/CD Pipeline */
      CicdPipelineConstructId:     "CICD-Pipeline",
      dockerUsername:              "nnthanh101",
}