#!/bin/bash
set -euo pipefail

source "./script/lib/common.sh"
source "data.input.env"

export tf_working_base_dir="terraform/governance-account"

helpFunction()
{
   echo ""
   echo "Usage: $0 -b curS3Bucket -s curS3Prefix -n curReportName -p awsProfile -r region"
   echo -e "\t-p The AWS profile, default to 'default'"
   echo -e "\t-r AWS region, default to 'ap-southeast-1'"
   echo -e "\t-n CUR report name"
   echo -e "\t-b CUR S3 bucket name"
   echo -e "\t-s CUR S3 prefix"
   exit 1
}

while getopts "p:r:b:s:n:" opt
do
  case "$opt" in
    p ) aws_profile="$OPTARG" ;;
    r ) aws_region="$OPTARG" ;;
    n ) cur_report_name="$OPTARG" ;;
    b ) cur_s3_bucket="$OPTARG" ;;
    s ) cur_s3_prefix="$OPTARG" ;;
    ? ) helpFunction ;;
  esac
done

if [ -z "${cur_s3_bucket}" ] || [ -z "${cur_s3_prefix}" ] || [ -z "${cur_report_name}" ]; then
  echo "The CUR report name and both CUR S3 bucket and prefix are required."
  exit
fi

aws_account=$(aws --profile "${aws_profile}" sts get-caller-identity | jq -r '.Account' | tr -d '\n')

_logger "[+] Alternative command: ./setup_data.sh -b ${cur_s3_bucket} -s ${cur_s3_prefix} -n ${cur_report_name} -p ${aws_profile} -r ${aws_region}"

echo "AWS region: ${aws_region}"
echo "Main AWS account profile: ${aws_profile}"
echo "CUR S3 bucket: ${cur_s3_bucket}"
echo "CUR S3 prefix: ${cur_s3_prefix}"
echo "CUR report name: ${cur_report_name}"

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
_logger "[+] 2. Apply Terraform plan for governance account"
echo "#########################################################"
echo

tf_working_dir="${tf_working_base_dir}/create-tables"
echo "Terraform working dir: ${tf_working_dir}"
terraform -chdir="${tf_working_dir}" init -input=false \
-reconfigure \
-backend-config="region=${aws_region}" \
-backend-config="bucket=${tf_state_s3_bucket}" \
-backend-config="profile=${aws_profile}" \
&& \
terraform -chdir="${tf_working_dir}" apply -input=false -auto-approve \
-var="region=${aws_region}" \
-var="aws_profile=${aws_profile}" \
-var="cur_s3_bucket_id=${cur_s3_bucket}" \
-var="cur_s3_prefix=${cur_s3_prefix}" \
-var="cur_report_name=${cur_report_name}"

GLUE_CRAWLER_NAME=$(terraform -chdir="${tf_working_dir}" output -raw glue_crawler_name)

echo
echo "#########################################################"
_logger "[+] 3. Run the Glue crawler"
echo "#########################################################"
echo

aws --profile "${aws_profile}" glue start-crawler --name "${GLUE_CRAWLER_NAME}"
while : ; do
  CRAWLER_STATE=$(aws --profile "${aws_profile}" glue get-crawler --name "${GLUE_CRAWLER_NAME}" | jq -r ".Crawler.State")
  if [  "${CRAWLER_STATE}" == "READY" ]; then
    echo "Crawler running results: ${CRAWLER_STATE}"
    break
  else
    echo "${CRAWLER_STATE}"
    sleep 2
  fi
done

echo
echo "#########################################################"
_logger "[+] 4. Load the table partitions to Athena"
echo "#########################################################"
echo

glue_database_name=$(terraform -chdir="${tf_working_dir}" output -raw glue_database_name)
athena_workgroup_name=$(terraform -chdir="${tf_working_dir}" output -raw athena_workgroup_name)
athena_table_name=$(echo $cur_report_name | tr '[:upper:]' '[:lower:]' | tr '-' '_')

query_execution_id=$(aws --profile "${aws_profile}" athena start-query-execution \
--query-execution-context Database=${glue_database_name},Catalog=AwsDataCatalog \
--work-group "${athena_workgroup_name}" \
--query-string "MSCK REPAIR TABLE ${athena_table_name};" \
--query 'QueryExecutionId' --output text)

echo "Query Execution Id: ${query_execution_id}"

ahq_query_status=$(aws --profile "${aws_profile}" athena get-query-execution \
--query-execution-id "${query_execution_id}" \
--query 'QueryExecution.Status.State' --output text)
while [ "${ahq_query_status}" = "RUNNING" ]; do
  echo "${ahq_query_status}"
  sleep 1
  ahq_query_status=$(aws --profile "${aws_profile}" athena get-query-execution \
--query-execution-id "${query_execution_id}" \
--query 'QueryExecution.Status.State' --output text)
done
echo "${ahq_query_status}"

echo "export aws_region=${aws_region}
export aws_profile=${aws_profile}
export cur_report_name=${cur_report_name}
export cur_s3_bucket=${cur_s3_bucket}
export cur_s3_prefix=${cur_s3_prefix}" > "data.clean.env"

echo
echo "#########################################################"
_logger "[+] 5. Configure the CUDOS tool"
echo "#########################################################"
echo

[[ -d "cudos-cli/cudos/work/${aws_account}" ]] || mkdir -p "cudos-cli/cudos/work/${aws_account}"

aws_identity_region="us-east-1"
athena_database_name=${glue_database_name}
athena_cur_table_name=${athena_table_name}

echo "export region=${aws_region}
export aws_identity_region=${aws_identity_region}
export aws_qs_identity_region=${aws_identity_region}
export athena_database_name=${athena_database_name}
export athena_cur_table_name=${athena_cur_table_name}
export AWS_DEFAULT_REGION=${aws_region}" > "cudos-cli/cudos/work/${aws_account}/config"
echo "
config file stored in \"cudos-cli/cudos/work/${aws_account}/config\"
"

echo "export region=${aws_region}
export aws_identity_region=${aws_identity_region}
export aws_qs_identity_region=${aws_identity_region}
export athena_database_name=${athena_database_name}
export athena_cur_table_name=${athena_cur_table_name}
export AWS_DEFAULT_REGION=${aws_region}" > "cudos-cli/trends/work/${aws_account}/config"
echo "
config file stored in \"cudos-cli/trends/work/${aws_account}/config\"
"

echo
echo "#########################################################"
_logger "[+] 6. Setup the CUDOS tools"
echo "#########################################################"
echo

echo "Please setup QuickSight and the primary Athena workgroup, then run this command
./setup_quicksight.sh
"

ended_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo -e "${RED} CUDOS Lab ended at ${ended_time} - ${started_time} ${NC}"

echo "To clean the CUDOS Lab, run:"
echo "./cleanup_data.sh"
echo
