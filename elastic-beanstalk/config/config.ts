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
  cidr:                "10.10.0.0/18",
  maxAzs:              2,
  natGateways:         1,
  publicPorts:         [80, 443],
  vpcId:               "vpc-11111111111111111",
  vpcConstructId:      "E301-VPCConstruct",
  useExistVpc:         "0",
  useDefaultVpc:       "0",
  
  /** ApplicationLoadbalancer config */
  loadBalancerConstructName: "EB-ALBConstruct",
  listenerPort:              80,
  publicLoadBalancer:        true,
  acmArn:                    process.env.AWS_ACM_ARN,
  
  /** Config RDS MySQL */
  RDS_MYSQL_DATABASE_NAME:         'E301RdsMysql',
  RDS_MYSQL_INSTANCE_NAME:         'E301RdsInsMysql',
  RDS_MYSQL_CREDENTIAL_USERNAME:   'admin',
  RDS_MYSQL_CREDENTIAL_PAWSSWORD:  'YOUR_PASSWORD',
  RDS_MYSQL_ALLOCATED_STORAGE:     20,
  RDS_MYSQL_MAX_ALLOCATED_STORAGE: 30,
  RDS_MYSQL_PORT:                  3306,
  
  /** Config RDS PostGresql */
  RDS_POSTGRES_DATABASE_NAME:         'E301RdsPostgres',
  RDS_POSTGRES_INSTANCE_NAME:         'E301RdsInsPostgres',
  RDS_POSTGRES_CREDENTIAL_USERNAME:   'postgres',
  RDS_POSTGRES_CREDENTIAL_PAWSSWORD:  'YOUR_PASSWORD',
  RDS_POSTGRES_ALLOCATED_STORAGE:     20,
  RDS_POSTGRES_MAX_ALLOCATED_STORAGE: 30,
  RDS_POSTGRES_PORT:                  5432,
  
  /** Config Elastic Beanstalk Tomcat */
  EB_APP_NAME_TOMCAT:            'ELB301-Tomcat',
  EB_PATH_CONFIG_JSON_TOMCAT:    './config/config-eb-tomcat.json',
  EB_PATH_SOURCE_ZIP_TOMCAT:     './Tomcat/ebproject/target/ebproject-0.1.0.war',
  /** https://docs.aws.amazon.com/elasticbeanstalk/latest/platforms/platforms-supported.html */
  EB_PLATFORMS_TOMCAT:           '64bit Amazon Linux 2 v4.1.6 running Tomcat 8.5 Corretto 11',
  EB_DESCRIPTION_TOMCAT:         'Application is deployed in Elastic Beanstalk with Tomcat',
  
  /** Config Elastic Beanstalk Tomcat */
  EB_APP_NAME_JAVA:            'ELB301-SpringBoot',
  EB_PATH_CONFIG_JSON_JAVA:    './config/config-eb-springboot.json',
  EB_PATH_SOURCE_ZIP_JAVA:     './Springboot/target/springboot-0.1.0.jar',
  EB_PLATFORMS_JAVA:           '64bit Amazon Linux 2 v3.1.6 running Corretto 11',
  EB_DESCRIPTION_JAVA:         'Application is deployed in Elastic Beanstalk with Java SpringBoot',
  
  
  

  TOMCAT_REPO:                 process.env.Tomcat_Repo   || '',
  PATH_BUILDSPEC_TOMCAT:       './buildspec-tomcat.yml',
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
