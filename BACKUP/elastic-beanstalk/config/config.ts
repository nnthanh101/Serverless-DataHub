const chalk = require('chalk');
require('dotenv').config();

export const applicationMetaData = {
  PROJECT_ID:  process.env.PROJECT_ID    || '',
  ACCOUNT_ID:  process.env.AWS_ACCOUNT,
  REGION:      process.env.AWS_REGION,
  BUCKET_NAME: process.env.AWS_S3_BUCKET || '',
  
  /** Primary Route53 Domain */
  route53HostedZone:           "",
  route53HostedZoneRecordName: "",
  
  /** Config VPC */
  cidr:                "10.40.0.0/18",
  maxAzs:              2,
  natGateways:         1,
  publicPorts:         [80, 443],
  vpcId:               "vpc-11111111111111111",
  vpcConstructId:      "E301-VPCConstruct",
  useExistVpc:         "0", //1: vpcId: __YOUR_EXISTING_VPC__
  useDefaultVpc:       "0",
  
  /** ApplicationLoadbalancer config */
  loadBalancerConstructName: "EB-ALBConstruct",
  listenerPort:              80,
  publicLoadBalancer:        true,
  acmArn:                    process.env.AWS_ACM_ARN,
  
  /** Config RDS MySQL */
  RDS_MYSQL_DATABASE_NAME:         'SpringBoot',
  RDS_MYSQL_INSTANCE_NAME:         'E301MysqlRDS',
  RDS_MYSQL_CREDENTIAL_USERNAME:   'root',
  RDS_MYSQL_CREDENTIAL_PAWSSWORD:  '__YOUR_PASSWORD__',
  RDS_MYSQL_ALLOCATED_STORAGE:     20,
  RDS_MYSQL_MAX_ALLOCATED_STORAGE: 30,
  RDS_MYSQL_PORT:                  3306,
  
  /** Config Elastic Beanstalk SpringBoot */
  EB_APP_NAME_JAVA:            'ELB301-SpringBoot',
  EB_PATH_CONFIG_JSON_JAVA:    './config/config-eb-springboot.json',
  EB_PATH_SOURCE_ZIP_JAVA:     './projects/springboot/target/spring-petclinic-2.4.5.jar',
  /** https://docs.aws.amazon.com/elasticbeanstalk/latest/platforms/platforms-supported.html */
  EB_PLATFORMS_JAVA:           '64bit Amazon Linux 2 v3.1.8 running Corretto 11',
  EB_DESCRIPTION_JAVA:         'Application is deployed in Elastic Beanstalk with Java SpringBoot',
  
  SPRINGBOOT_REPO:             process.env.Springboot_Repo || '',
  PATH_BUILDSPEC_SPRINGBOOT:   './buildspec-springboot.yml',
  // you can change this to the branch of your choice (currently main)
  // BUILD_BRANCH: process.env.BUILD_BRANCH || '^refs/heads/main$',
};

export function validateEnvVariables() {
  console.log('Your port is ${process.env.BUCKET_NAME}'); // undefined
  // for (let variable in envVars) {
  //   if (!envVars[variable as keyof typeof envVars])
  //     throw Error(
  //       chalk.red(`Environment variable ${variable} is not defined!`)
  //     );
  // }
}
