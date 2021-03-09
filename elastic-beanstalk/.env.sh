#!/bin/bash
export PROJECT_ID=e301
export AWS_EB_APP_NAME="ELB301"
export AWS_EB_APP_VERSION="0.1.0"

## 0. Configuring AWS
export AWS_PROFILE=default

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
    # export AWS_REGION=$(curl -s 169.254.169.254/latest/dynamic/instance-identity/document | jq -r '.region')
    export AWS_REGION=${AWS_REGION:-"ap-southeast-1"}
fi

## 2. AWS Infra: S3, VPC 
export AWS_S3_BUCKET=${PROJECT_ID}-${AWS_ACCOUNT}
# export AWS_S3_BUCKET=${PROJECT_ID}

## Config ACM
export AWS_ACM_ARN="arn:aws:acm:${AWS_REGION}:${AWS_ACCOUNT}:certificate/47f14be9-beaa-4652-a076-0c5bfe0644c2"

## Config RDS MYSQL
export AWS_RDS_CREDENTIAL_PAWSSWORD='YOUR_PASSWORD'
export AWS_RDS_DATABASE_NAME='E301Rds'
export AWS_RDS_INSTANCE_NAME='E301RdsIns'
export AWS_RDS_CREDENTIAL_USERNAME='admin'
export AWS_RDS_ALLOCATED_STORAGE='20'
export AWS_RDS_MAX_ALLOCATED_STORAGE='30'

## Config Elastic Beanstalk
export AWS_EB_PATH_CONFIG_JSON='./config-eb.json'
export AWS_EB_PATH_SOURCE_ZIP="./Tomcat/ebproject/target/ebproject-${AWS_EB_APP_VERSION}.war"

export ElasticBeanstalk_Repo=SpringBootWithTomcat