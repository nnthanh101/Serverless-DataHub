#!/bin/bash
export PROJECT_ID=cdk101

## 0. Configuring AWS
export AWS_PROFILE=default

## MacOS
# export AWS_ACCOUNT=$(aws sts get-caller-identity | jq -r '.Account' | tr -d '\n')
# export AWS_REGION=${AWS_REGION:-"ap-southeast-1"}
## Cloud9
export AWS_ACCOUNT=$(aws sts get-caller-identity --output text --query Account)
export AWS_REGION=$(curl -s 169.254.169.254/latest/dynamic/instance-identity/document | jq -r '.region')

## 1. AWS Infra: S3, VPC 
export AWS_S3_BUCKET=${PROJECT_ID}-${AWS_REGION}
export AWS_VPC_NAME=${PROJECT_ID}-VPC
export AWS_VPC_CIDR="10.10.0.0/18"
