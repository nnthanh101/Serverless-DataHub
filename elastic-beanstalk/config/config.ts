const chalk = require('chalk');
require('dotenv').config();

export const envVars = {
  PROJECT_ID:  process.env.PROJECT_ID    || '',
  ACCOUNT_ID:  process.env.AWS_ACCOUNT_ID,
  REGION:      process.env.AWS_REGION,
  BUCKET_NAME: process.env.AWS_S3_BUCKET || '',
  
  /** Config VPC */
  USE_EXIST_VPC:         process.env.AWS_USE_EXIST_VPC   ||'',
  USE_DEFAULT_VPC:       process.env.AWS_USE_DEFAULT_VPC ||'',
  VPC_ID:                process.env.AWS_VPC_ID          ||'',
  VPC_NAME:              process.env.AWS_VPC_NAME        ||'',
  VPC_CIDR:              process.env.AWS_VPC_CIDR,
  VPC_ISOLATED_CIDRMASK: parseInt(process.env.AWS_VPC_ISOLATED_CIDRMASK || ''),
  VPC_PUBLIC_CIDRMASK:   parseInt(process.env.AWS_VPC_PUBLIC_CIDRMASK   || ''),
  VPC_PRIVATE_CIDRMASK:  parseInt(process.env.AWS_VPC_PRIVATE_CIDRMASK  || ''),
  VPC_MAX_AZ:            parseInt(process.env.AWS_VPC_MAX_AZ || ''),
  VPC_NAT_GW:            parseInt(process.env.AWS_VPC_NAT_GW || ''),
  
  
  /** Config RDS MySQL */
  RDS_DATABASE_NAME:         process.env.AWS_RDS_DATABASE_NAME                  || '',
  RDS_INSTANCE_NAME:         process.env.AWS_RDS_INSTANCE_NAME                  || '',
  RDS_CREDENTIAL_USERNAME:   process.env.AWS_RDS_CREDENTIAL_USERNAME            || '',
  RDS_CREDENTIAL_PAWSSWORD:  process.env.AWS_RDS_CREDENTIAL_PAWSSWORD           || '',
  RDS_ALLOCATED_STORAGE:     parseInt(process.env.AWS_RDS_ALLOCATED_STORAGE     || ''),
  RDS_MAX_ALLOCATED_STORAGE: parseInt(process.env.AWS_RDS_MAX_ALLOCATED_STORAGE || ''),
  
  
  /** Config Elastic Beanstalk */
  EB_APP_NAME:            process.env.AWS_EB_APP_NAME        || '',
  EB_APP_PATH_SOURCE_ZIP: process.env.AWS_EB_APP_PATH_SOURCE_ZIP||'',
  EB_EC2_KEYNAME:         process.env.AWS_EB_EC2_KEYNAME     || '',
  EB_MEASURE_NAME:        process.env.AWS_EB_MEASURE_NAME    || '',
  EB_UNIT:                process.env.AWS_EB_UNIT            || '',
  EB_LOWER_THRESHOLD:     process.env.AWS_EB_LOWER_THRESHOLD || '',
  EB_UPPER_THRESHOLD:     process.env.AWS_EB_UPPER_THRESHOLD || '',
  EB_MIN_SIZE:            process.env.AWS_EB_MIN_SIZE        || '',
  EB_MAX_SIZE:            process.env.AWS_EB_MAX_SIZE        || '',
  EB_INSTANCE_TYPE:       process.env.AWS_EB_INSTANCE_TYPE   || '',
  EB_PLATFORMS:           process.env.AWS_EB_PLATFORMS       || '',
  EB_DESCRIPTION:         process.env.AWS_EB_DESCRIPTION     || '',
  
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
