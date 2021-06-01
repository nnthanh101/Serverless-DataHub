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

export project_id=${org}-${tenant}
export working_dir=$PWD
export tf_working_base_dir="terraform/governance-account"

source data.clean.env

aws_account=$(aws --profile "${aws_profile}" sts get-caller-identity | jq -r '.Account' | tr -d '\n')

echo "AWS account: ${aws_account}"
echo "AWS region: ${aws_region}"
echo "Main AWS account profile: ${aws_profile}"
echo "CUR S3 bucket: ${cur_s3_bucket}"
echo "CUR S3 prefix: ${cur_s3_prefix}"
echo "CUR report name: ${cur_report_name}"

started_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo "CUDOS Lab cleaning start at ${started_time}"
echo "#########################################################"
echo

echo
echo "#########################################################"
_logger "[+] 1. Create S3 Bucket with Versioning Enabled to store Terraform State files & locks ..."
echo "#########################################################"
echo
tf_state_s3_bucket=$(echo "${project_id}-state-${aws_account}" | awk '{print tolower($0)}')
export tf_state_s3_bucket
echo "Terraform state S3 bucket: ${tf_state_s3_bucket}"
## Note: us-east-1 does not require a `location-constraint`:
aws --profile "${aws_profile}" s3api create-bucket --bucket "${tf_state_s3_bucket}" --region "${aws_region}" --create-bucket-configuration \
    LocationConstraint="${aws_region}" 2>/dev/null || true
aws --profile "${aws_profile}" s3api put-bucket-versioning --bucket "${tf_state_s3_bucket}" --versioning-configuration Status=Enabled 2>/dev/null || true


echo
echo "#########################################################"
_logger "[+] 2. Destroy Terraform stack for governance account"
echo "#########################################################"
echo

tf_working_dir="${tf_working_base_dir}/create-tables"
terraform -chdir="${tf_working_dir}" destroy -input=false -auto-approve \
-var="region=${aws_region}" \
-var="aws_profile=${aws_profile}" \
-var="cur_s3_bucket_id=${cur_s3_bucket}" \
-var="cur_s3_prefix=${cur_s3_prefix}" \
-var="cur_report_name=${cur_report_name}"

ended_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo -e "${RED} CUDOS Lab cleaning end at ${ended_time} - ${started_time} ${NC}"
echo
