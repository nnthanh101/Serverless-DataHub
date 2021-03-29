#!/bin/bash
export PROJECT_ID=e302

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

export Tomcat_Repo='SpringBootWithTomcat'
export Springboot_Repo='SpringBootWithJava'