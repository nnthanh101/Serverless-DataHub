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
      listenerPort:        443,
      publicLoadBalancer:  true,

      route53HostedZone:           "aws.job4u.io",
      route53HostedZoneRecordName: "ecs",
      /** FIXME SSM >> Parameter Store */ 
      acmArn:'arn:aws:acm:${AWS_REGION}:${AWS_ACCOUNT}:certificate/__YOUR-ACM__',
}