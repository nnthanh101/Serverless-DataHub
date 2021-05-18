#!/bin/bash
export PROJECT_ID=ecs-fargate

## 1.1 Configuring AWS
## MacOS
# export AWS_ACCOUNT=$(aws sts get-caller-identity | jq -r '.Account' | tr -d '\n')
# export AWS_REGION=${AWS_REGION:-"ap-southeast-1"}
## Cloud9
export AWS_ACCOUNT=$(aws sts get-caller-identity --output text --query Account)
export AWS_REGION=$(curl -s 169.254.169.254/latest/dynamic/instance-identity/document | jq -r '.region')

## 2. AWS Infra: S3, VPC 
export AWS_S3_BUCKET=${PROJECT_ID}-${AWS_ACCOUNT}
export AWS_VPC_NAME=${PROJECT_ID}-VPC
export AWS_VPC_CIDR="10.0.0.0/18"

export AWS_CDK_STACK="EcsFargateStack"
# export RDS_DATABASE_STACK='RDS-Database-Stack'
# export RDS_DATABASE_NAME='RDS-DB'
# export EFS_STACK='EFS-Stack'

## 3.1. Configuring ECR
export CONTAINER_REGISTRY_URL=${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com
export ECR_REPOSITORY_FRONTEND=react
export ECR_REPOSITORY_BACKEND=springboot
export ECR_REPOSITORY=${ECR_REPOSITORY_FRONTEND}

## 3.2. Configuring DockerHub
export DOCKER_REGISTRY_NAMESPACE=nnthanh101
export HTTPS_GIT_REPO_URL=https://github.com/nnthanh101/cdk.git
export DOCKER_REGISTRY_USERNAME=nnthanh101
# export DOCKER_REGISTRY_PASSWORD=<_DOCKERHUB_PASSWORD__
export DOCKER_REGISTRY_EMAIL=nnthanh101@gmail.com

## 4. Primary domain
export PRIMARY_DOMAIN=aws.job4u.io