#!/bin/bash
set -euo pipefail

source "./cur.input.env"
source "./script/lib/common.sh"

helpFunction()
{
   echo ""
   echo "Usage: $0 -i costAndUsageAccount -p awsProfile -r region"
   echo -e "\t-i AWS Account ID of the governance account"
   echo -e "\t-p The AWS profile, default to 'default'"
   echo -e "\t-r AWS region, default to 'ap-southeast-1'"
   exit 1
}

while getopts "p:i:r:" opt
do
  case "$opt" in
    p ) aws_profile="$OPTARG" ;;
    i ) aws_governance_account="$OPTARG" ;;
    r ) aws_region="$OPTARG" ;;
    ? ) helpFunction ;;
  esac
done

aws_account=$(aws --profile "${aws_profile}" sts get-caller-identity | jq -r '.Account' | tr -d '\n')

_logger "[+] Alternative command: ./setup_cur.sh -i ${aws_governance_account} -p ${aws_profile} -r ${aws_region}"

echo "AWS managed account: ${aws_account}"
echo "AWS cost usage account ID: ${aws_governance_account}"
echo "AWS region: ${aws_region}"
echo "Main AWS account profile: ${aws_profile}"

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
tf_state_s3_bucket=$(echo "${project_id}-state-${aws_account}" | awk '{print tolower($0)}')
export tf_state_s3_bucket
echo "Terraform state S3 bucket: ${tf_state_s3_bucket}"
## Note: us-east-1 does not require a `location-constraint`:
aws --profile "${aws_profile}" s3api create-bucket --bucket "${tf_state_s3_bucket}" --region "${aws_region}" --create-bucket-configuration \
    LocationConstraint="${aws_region}" 2>/dev/null || true
aws --profile "${aws_profile}" s3api put-bucket-versioning --bucket "${tf_state_s3_bucket}" --versioning-configuration Status=Enabled 2>/dev/null || true


echo
echo "#########################################################"
_logger "[+] 2. Apply Terraform plan for managed account"
echo "#########################################################"
echo
tf_working_dir="./terraform/managed-account"
terraform -chdir="${tf_working_dir}" init -input=false \
-migrate-state \
-backend-config="region=${aws_region}" \
-backend-config="bucket=${tf_state_s3_bucket}" \
-backend-config="profile=${aws_profile}" \
&& \
terraform -chdir="${tf_working_dir}" apply -input=false -auto-approve \
-var="region=${aws_region}" \
-var="aws_profile=${aws_profile}" \
-var="cost_usage_account_id=${aws_governance_account}"

echo "export aws_profile=${aws_profile}
export aws_region=${aws_region}
export cur_s3_bucket=$(terraform -chdir="${tf_working_dir}" output -raw cur_bucket_id)
export cur_s3_prefix=$(terraform -chdir="${tf_working_dir}" output -raw cur_s3_prefix)
export cur_report_name=$(terraform -chdir="${tf_working_dir}" output -raw cur_report_name)" > "data.input.env"

echo
echo "Please review the 'data.input.env' file then run this command
./setup_data.sh"
echo

ended_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo -e "${RED} CUDOS Lab ended at ${ended_time} - ${started_time} ${NC}"




