#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

function _logger() {
    echo -e "$(date) ${YELLOW}[*] $@ ${NC}"
}

source ./env

helpFunction()
{
   echo ""
   echo "Usage: $0 -p awsProfile -i costAndUsageAccount -r region"
   echo -e "\t-p The AWS profile, default to 'default'"
   echo -e "\t-i AWS Account ID of the CUDOS account, default to the current account of the selected profile"
   echo -e "\t-r AWS region, default to 'ap-southeast-1'"
   exit 1
}

while getopts "p:i:r:" opt
do
  case "$opt" in
    p ) AWS_PROFILE="$OPTARG" ;;
    i ) AWS_COST_USAGE_ACCOUNT="$OPTARG" ;;
    r ) AWS_REGION="$OPTARG" ;;
    ? ) helpFunction ;;
  esac
done

echo "AWS managed account: ${AWS_ACCOUNT}"
echo "AWS cost usage account ID: ${AWS_COST_USAGE_ACCOUNT}"
echo "AWS region: ${AWS_REGION}"
echo "Main AWS account profile: ${AWS_PROFILE}"

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
TF_STATE_S3_BUCKET=$(echo "${PROJECT_ID}-state-${AWS_ACCOUNT}" | awk '{print tolower($0)}')
export TF_STATE_S3_BUCKET
echo "Terraform state S3 bucket: ${TF_STATE_S3_BUCKET}"
## Note: us-east-1 does not require a `location-constraint`:
aws --profile "${AWS_PROFILE}" s3api create-bucket --bucket "${TF_STATE_S3_BUCKET}" --region "${AWS_REGION}" --create-bucket-configuration \
    LocationConstraint="${AWS_REGION}" 2>/dev/null || true
aws --profile "${AWS_PROFILE}" s3api put-bucket-versioning --bucket "${TF_STATE_S3_BUCKET}" --versioning-configuration Status=Enabled 2>/dev/null || true


echo
echo "#########################################################"
_logger "[+] 2. Apply Terraform plan for managed account"
echo "#########################################################"
echo
terraform -chdir="${TF_WORKING_DIR}" init -input=false \
-migrate-state \
-backend-config="region=${AWS_REGION}" \
-backend-config="bucket=${TF_STATE_S3_BUCKET}" \
-backend-config="profile=${AWS_PROFILE}" \
&& \
terraform -chdir="${TF_WORKING_DIR}" apply -input=false -auto-approve \
-var="region=${AWS_REGION}" \
-var="aws_profile=${AWS_PROFILE}" \
-var="cost_usage_account_id=${AWS_COST_USAGE_ACCOUNT}"

ended_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo -e "${RED} CUDOS Lab ended at ${ended_time} - ${started_time} ${NC}"




