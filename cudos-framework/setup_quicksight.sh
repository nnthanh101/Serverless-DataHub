#!/bin/bash
set -euo pipefail

source "./script/lib/common.sh"
source data.clean.env

export tf_working_base_dir="terraform/governance-account"

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

echo
echo "#########################################################"
_logger "[+] 1. Install CUDOS and CID dashboard"
echo "#########################################################"
echo
current_dir="$(pwd)"
cudos_dir="${current_dir}/cudos-cli/cudos"
echo "Entering: ${cudos_dir}"
cd "${cudos_dir}"
user_arn=$(aws --profile "${aws_profile}" quicksight list-users --aws-account-id "${aws_account}" --region "us-east-1" --namespace default --query 'UserList[*].Arn' --output text)
export user_arn
AWS_PROFILE=${aws_profile} ./shell-script/customer-cudos.sh prepare
AWS_PROFILE=${aws_profile} ./shell-script/customer-cudos.sh deploy-datasets || true
AWS_PROFILE=${aws_profile} ./shell-script/customer-cudos.sh deploy-dashboard || true
AWS_PROFILE=${aws_profile} ./shell-script/customer-cudos.sh deploy-cid-dashboard

echo
echo "#########################################################"
_logger "[+] 2. Install trends dashboard"
echo "#########################################################"
echo
trends_dir="${current_dir}/cudos-cli/trends"
echo "Entering: ${trends_dir}"
cd "${trends_dir}"
AWS_PROFILE=${aws_profile} ./shell-script/trends.sh prepare
AWS_PROFILE=${aws_profile} ./shell-script/trends.sh deploy-datasets || true
AWS_PROFILE=${aws_profile} ./shell-script/trends.sh deploy-dashboard

echo "Entering: ${current_dir}"
cd "${current_dir}"

ended_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo -e "${RED} CUDOS Tools setup end at ${ended_time} - ${started_time} ${NC}"
echo
