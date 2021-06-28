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

      route53HostedZone:           "",
      route53HostedZoneRecordName: "",
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
      containerPort:       8080,
      TgrAllowPort:        80,  // PROTOCOL PORT, EX: HTTP-80,HTTPS-443

      /** [React >> SEO] Job4U-Web Config */
      petstoreWebCodeLocation:       "./projects", 
      petstoreWebHealthCheckPath:    "/",
      petstoreWebPathPattern:        "/*",
      petstoreWebRepoName:           process.env.SpringbootRepo+"",
      petstoreWebHealthCheckTimeout:        120, 
      petstoreWebHealthCheckInterval:       121,
      petstoreWebHealthCheckCount:          2,
      petstoreWebUnhealthCheckCount:        5,

      /** [Node.js] Job4U-Byod Config */
      // job4UByodCodeLocation:       "../projects/job4u-byod", 
      // job4UByodHealthCheckPath:    "/crawl/",
      // job4UByodPathPattern:        "/crawl/*",
      // job4UByodRepoName:           process.env.Job4UByodRepo+"",

       /** [Node.js] Job4U-Crawl Config */
      //  job4uCrawlCodeLocation:       "projects/job4u-crawl", 
       // job4uCrawlHealthCheckPath:    "/crawl/",
       // job4uCrawlPathPattern:        "/crawl/*",
      //  job4uCrawlRepoName:           process.env.Job4UCrawlRepo+"",
       /** ECS Scheduled Task
        * 
        * ref: https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions
        * 
        */
      //  job4uCrawlTriggerValue:      "0/1 * * * ? *", //every 1 minute
 

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
      
      /** Config RDS MySQL */
      RDS_MYSQL_DATABASE_NAME:         'SpringBoot',
      RDS_MYSQL_INSTANCE_NAME:         'E301MysqlRDS',
      RDS_MYSQL_CREDENTIAL_USERNAME:   'root',
      RDS_MYSQL_CREDENTIAL_PAWSSWORD:  '__YOUR_PASSWORD__',
      RDS_MYSQL_ALLOCATED_STORAGE:     20,
      RDS_MYSQL_MAX_ALLOCATED_STORAGE: 30,
      RDS_MYSQL_PORT:                  3306,
}