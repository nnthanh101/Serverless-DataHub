/** Configuration file */
export const applicationMetaData = {
      
      /** Primary Route53 Domain */
      route53HostedZone:           "",
      route53HostedZoneRecordName: "",

      /** VPC Config*/
      cidr:                "172.30.0.0/18",
      maxAzs:              2,
      natGateways:         0,
      publicPorts:         [80, 443],
      vpcId:               "vpc-11111111111111111",
      vpcConstructId:      "CICD-VPC",
      useExistVpc:         "0",
      useDefaultVpc:       "0",
}