#!/bin/bash
export PROJECT_ID=e301
export AWS_EB_APP_NAME="ELB301"
export AWS_EB_APP_VERSION="0.1.0"

## 0. Configuring AWS
export AWS_PROFILE=nnthanh

## MacOS
# export AWS_ACCOUNT=$(aws sts get-caller-identity | jq -r '.Account' | tr -d '\n')
# export AWS_REGION=${AWS_REGION:-"ap-southeast-1"}
## Cloud9
# export AWS_ACCOUNT=$(aws sts get-caller-identity --output text --query Account)
# export AWS_REGION=$(curl -s 169.254.169.254/latest/dynamic/instance-identity/document | jq -r '.region')

if [ $(uname -s) == 'Darwin' ] ; then
    export AWS_ACCOUNT=$(aws sts get-caller-identity | jq -r '.Account' | tr -d '\n')
    export AWS_REGION=${AWS_REGION:-"ap-southeast-1"}
else
    export AWS_ACCOUNT=$(aws sts get-caller-identity --output text --query Account)
    export AWS_REGION=$(curl -s 169.254.169.254/latest/dynamic/instance-identity/document | jq -r '.region')
fi

## 2. AWS Infra: S3, VPC 
export AWS_S3_BUCKET=${PROJECT_ID}-${AWS_ACCOUNT}
# export AWS_S3_BUCKET=${PROJECT_ID}

## Config VPC
# export AWS_USE_EXIST_VPC="0"               ## 0: not use, 1: use
# export AWS_USE_DEFAULT_VPC="0"             ## 0: not use, 1: use
# export AWS_VPC_ID="vpc-11111111111111111", ## set if use vpc exist

# export AWS_VPC_NAME=${AWS_EB_APP_NAME}-VPC
# export AWS_VPC_CIDR="10.10.0.0/18"
# export AWS_VPC_ISOLATED_CIDRMASK="24"
# export AWS_VPC_PUBLIC_CIDRMASK="24"
# export AWS_VPC_PRIVATE_CIDRMASK="24"
# export AWS_VPC_MAX_AZ="2"
# export AWS_VPC_NAT_GW="1"

## Config RDS MYSQL
export AWS_RDS_CREDENTIAL_PAWSSWORD='YOUR_PASSWORD'
export AWS_RDS_DATABASE_NAME='E301Rds'
export AWS_RDS_INSTANCE_NAME='E301RdsIns'
export AWS_RDS_CREDENTIAL_USERNAME='admin'
export AWS_RDS_ALLOCATED_STORAGE='20'
export AWS_RDS_MAX_ALLOCATED_STORAGE='30'

## Config Elastic Beanstalk

export AWS_EB_APP_PATH_SOURCE_ZIP='${__dirname}/../../elastic-beanstalk/Tomcat/ebproject/target/ebproject-${AWS_EB_APP_VERSION}.war'
export AWS_EB_PATH_CONFIG_JSON='${__dirname}/../../modernapp-elb/config-eb.json'
## https://docs.aws.amazon.com/elasticbeanstalk/latest/platforms/platforms-supported.html
export AWS_EB_PLATFORMS='64bit Amazon Linux 2 v4.1.6 running Tomcat 8.5 Corretto 11'
export AWS_EB_DESCRIPTION='Application is deployed in Elastic Beanstalk with Tomcat'
