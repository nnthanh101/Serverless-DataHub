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
export TF_WORKING_BASE_DIR="terraform/governance-account"

## AWS Account, region and profile
AWS_REGION="ap-southeast-1"
AWS_PROFILE="default"

CUR_S3_BUCKET=""
CUR_S3_PREFIX=""

helpFunction()
{
   echo ""
   echo "Usage: $0 -b curS3Bucket -s curS3Prefix -p awsProfile -r region"
   echo -e "\t-p The AWS profile, default to 'default'"
   echo -e "\t-r AWS region, default to 'ap-southeast-1'"
   echo -e "\t-b CUR S3 bucket name"
   echo -e "\t-s CUR S3 prefix"
   exit 1
}

while getopts "p:r:b:s:" opt
do
  case "$opt" in
    p ) AWS_PROFILE="$OPTARG" ;;
    r ) AWS_REGION="$OPTARG" ;;
    b ) CUR_S3_BUCKET="$OPTARG" ;;
    s ) CUR_S3_PREFIX="$OPTARG" ;;
    ? ) helpFunction ;;
  esac
done

if [ -z "${CUR_S3_BUCKET}" ] && [ -z "${CUR_S3_PREFIX}" ]; then
  echo "Both CUR S3 bucket and prefix are required."
  exit
fi

AWS_ACCOUNT=$(aws --profile "${AWS_PROFILE}" sts get-caller-identity | jq -r '.Account' | tr -d '\n')

echo "AWS managed account: ${AWS_ACCOUNT}"
echo "AWS region: ${AWS_REGION}"
echo "Main AWS account profile: ${AWS_PROFILE}"
echo "CUR S3 bucket: ${CUR_S3_BUCKET}"
echo "CUR S3 prefix: ${CUR_S3_PREFIX}"

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

TF_WORKING_DIR="${TF_WORKING_BASE_DIR}/create-tables"
echo "Terraform working dir: ${TF_WORKING_DIR}"
terraform -chdir="${TF_WORKING_DIR}" init -input=false \
-reconfigure \
-backend-config="region=${AWS_REGION}" \
-backend-config="bucket=${TF_STATE_S3_BUCKET}" \
-backend-config="profile=${AWS_PROFILE}" \
&& \
terraform -chdir="${TF_WORKING_DIR}" apply -input=false -auto-approve \
-var="region=${AWS_REGION}" \
-var="aws_profile=${AWS_PROFILE}" \
-var="cur_s3_bucket_id=${CUR_S3_BUCKET}" \
-var="cur_s3_prefix=${CUR_S3_PREFIX}"

GLUE_CRAWLER_NAME=$(terraform -chdir="${TF_WORKING_DIR}" output -raw glue_crawler_name)

echo
echo "#########################################################"
_logger "[+] 3. Run the Glue crawler"
echo "#########################################################"
echo
aws --profile "${AWS_PROFILE}" glue start-crawler --name "${GLUE_CRAWLER_NAME}"
while : ; do
  CRAWLER_STATE=$(aws --profile "${AWS_PROFILE}" glue get-crawler --name "${GLUE_CRAWLER_NAME}" | jq -r ".Crawler.State")
  if [  "${CRAWLER_STATE}" == "READY" ]; then
    echo "Crawler running results: ${CRAWLER_STATE}"
    break
  else
    echo "${CRAWLER_STATE}"
    sleep 2
  fi
done

ended_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo -e "${RED} CUDOS Lab ended at ${ended_time} - ${started_time} ${NC}"
