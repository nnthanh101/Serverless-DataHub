const chalk = require('chalk');
require('dotenv').config();

export const applicationMetaData = {
  PROJECT_ID:  process.env.PROJECT_ID    || '',
  ACCOUNT_ID:  process.env.AWS_ACCOUNT,
  REGION:      process.env.AWS_REGION,
  BUCKET_NAME: process.env.AWS_S3_BUCKET || '',
  
  /** Config VPC */
  cidr:                "10.10.0.0/18",
  maxAzs:              2,
  natGateways:         1,
  publicPorts:         [80, 443],
  vpcId:               "vpc-11111111111111111",
  vpcConstructId:      "E301-VPC",
  useExistVpc:         "0",
  useDefaultVpc:       "0",
  
  /** Config RDS MySQL */
  RDS_DATABASE_NAME:         process.env.AWS_RDS_DATABASE_NAME                  || '',
  RDS_INSTANCE_NAME:         process.env.AWS_RDS_INSTANCE_NAME                  || '',
  RDS_CREDENTIAL_USERNAME:   process.env.AWS_RDS_CREDENTIAL_USERNAME            || '',
  RDS_CREDENTIAL_PAWSSWORD:  process.env.AWS_RDS_CREDENTIAL_PAWSSWORD           || '',
  RDS_ALLOCATED_STORAGE:     parseInt(process.env.AWS_RDS_ALLOCATED_STORAGE     || ''),
  RDS_MAX_ALLOCATED_STORAGE: parseInt(process.env.AWS_RDS_MAX_ALLOCATED_STORAGE || ''),
  
  
  /** Config Elastic Beanstalk */
  EB_APP_NAME:            process.env.AWS_EB_APP_NAME           || '',
  EB_APP_VERSION:         process.env.AWS_EB_APP_VERSION        || '',
  EB_PATH_CONFIG_JSON:    process.env.AWS_EB_PATH_CONFIG_JSON   || '',
  EB_PATH_SOURCE_ZIP:     process.env.AWS_EB_PATH_SOURCE_ZIP    || '',
  /** https://docs.aws.amazon.com/elasticbeanstalk/latest/platforms/platforms-supported.html */
  EB_PLATFORMS:           '64bit Amazon Linux 2 v4.1.6 running Tomcat 8.5 Corretto 11',
  EB_DESCRIPTION:         'Application is deployed in Elastic Beanstalk with Tomcat',
  
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
