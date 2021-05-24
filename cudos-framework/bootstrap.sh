#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

function _logger() {
    echo -e "$(date) ${YELLOW}[*] $@ ${NC}"
}

export org="DevAx"
export tenant="CUDOS"

export PROJECT_ID=${org}-${tenant}
export WORKING_DIR=$PWD
export TF_DIR_MANAGED_ACCOUNT="terraform/managed-account"

## AWS Account, region and profile
AWS_REGION="ap-southeast-1"
AWS_MANAGE_ACCOUNT_PROFILE="default"
AWS_COST_USAGE_ACCOUNT_PROFILE=${AWS_MANAGE_ACCOUNT_PROFILE}

helpFunction()
{
   echo ""
   echo "Usage: $0 -m manageProfile -c costProfile -r region"
   echo -e "\t-m The profile of the main AWS account, default to 'default'"
   echo -e "\t-c The profile of the Cost and Usage AWS account, default to 'default'"
   echo -e "\t-r AWS region, default to 'ap-southeast-1'"
   exit 1
}

while getopts "m:c:r:" opt
do
  case "$opt" in
    m ) AWS_MANAGE_ACCOUNT_PROFILE="$OPTARG" ;;
    c ) AWS_COST_USAGE_ACCOUNT_PROFILE="$OPTARG" ;;
    r ) AWS_REGION="$OPTARG" ;;
    ? ) helpFunction ;;
  esac
done


AWS_MANAGED_ACCOUNT=$(aws sts get-caller-identity | jq -r '.Account' | tr -d '\n')
AWS_COST_USAGE_ACCOUNT=$(aws --profile "${AWS_COST_USAGE_ACCOUNT_PROFILE}" sts get-caller-identity | jq -r '.Account' | tr -d '\n')

echo "AWS managed account: ${AWS_MANAGED_ACCOUNT}"
echo "AWS cost usage account: ${AWS_COST_USAGE_ACCOUNT}"
echo "AWS region: ${AWS_REGION}"
echo "Main AWS account profile: ${AWS_MANAGE_ACCOUNT_PROFILE}"
echo "Cost and Usage AWS account profile: ${AWS_COST_USAGE_ACCOUNT_PROFILE}"

started_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo "CUDOS Lab started at ${started_time}"
echo "#########################################################"
echo


echo
echo "#########################################################"
_logger "[+] 1. Create S3 Bucket with Versioning Enabled to store Terraform State files & locks ..."
echo "#########################################################"
echo
TF_STATE_S3_BUCKET=$(echo "${PROJECT_ID}-state-${AWS_MANAGED_ACCOUNT}" | awk '{print tolower($0)}')
export TF_STATE_S3_BUCKET
echo "Terraform state S3 bucket: ${TF_STATE_S3_BUCKET}"
## Note: us-east-1 does not require a `location-constraint`:
aws --profile "${AWS_MANAGE_ACCOUNT_PROFILE}" s3api create-bucket --bucket "${TF_STATE_S3_BUCKET}" --region "${AWS_REGION}" --create-bucket-configuration \
    LocationConstraint="${AWS_REGION}" 2>/dev/null || true
aws --profile "${AWS_MANAGE_ACCOUNT_PROFILE}" s3api put-bucket-versioning --bucket "${TF_STATE_S3_BUCKET}" --versioning-configuration Status=Enabled 2>/dev/null || true


echo
echo "#########################################################"
_logger "[+] 2. Apply Terraform plan for managed account"
echo "#########################################################"
echo
terraform -chdir="${TF_DIR_MANAGED_ACCOUNT}" init -input=false -backend-config="region=${AWS_REGION}" -backend-config="bucket=${TF_STATE_S3_BUCKET}" && \
terraform -chdir="${TF_DIR_MANAGED_ACCOUNT}" apply -input=false -auto-approve \
-var="region=${AWS_REGION}" \
-var="aws_profile=${AWS_MANAGE_ACCOUNT_PROFILE}" \
-var="cost_usage_account_id=${AWS_COST_USAGE_ACCOUNT}"

ended_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo -e "${RED} CUDOS Lab ended at ${ended_time} - ${started_time} ${NC}"




