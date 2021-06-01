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
echo "CUDOS Tools setup start at ${started_time}"
echo "#########################################################"
echo

cudos_dir="$(pwd)/cudos-cli/cudos"
echo "Entering: ${cudos_dir}"
cd "${cudos_dir}"
user_arn=$(aws --profile "${aws_profile}" quicksight list-users --aws-account-id "${aws_account}" --region "us-east-1" --namespace default --query 'UserList[*].Arn' --output text)
export user_arn
AWS_PROFILE=${aws_profile} ./shell-script/customer-cudos.sh prepare
AWS_PROFILE=${aws_profile} ./shell-script/customer-cudos.sh deploy-datasets || true
AWS_PROFILE=${aws_profile} ./shell-script/customer-cudos.sh deploy-dashboard || true
AWS_PROFILE=${aws_profile} ./shell-script/customer-cudos.sh deploy-cid-dashboard

ended_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo -e "${RED} CUDOS Tools setup end at ${ended_time} - ${started_time} ${NC}"
echo
