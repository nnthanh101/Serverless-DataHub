/** Configuration file */
export const Config = {

      /** VPC Config*/
      cidr:                "10.10.0.0/18",
      maxAzs:              2,
      natGateways:         1,
      publicPorts:         [80, 443],
      vpcId:               "vpc-11111111111111111",
      vpcConstructId:      "ECS-VPC",
      useExistVpc:         "0",
      useDefaultVpc:       "0",

      /**  */
}