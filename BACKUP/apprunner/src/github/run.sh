#!/bin/bash
set -euo pipefail

source "./../../scripts/lib/common.sh"

ensure_env ".apprunner.env"
source ".apprunner.env"

read_aws_account_id
init_state_bucket

tf_working_dir="./terraform"

apply() {
  terraform -chdir="${tf_working_dir}" init \
  -migrate-state \
  -backend-config="region=${aws_region}" \
  -backend-config="bucket=${tf_state_s3_bucket}" \
  && \
  terraform -chdir="${tf_working_dir}" apply -auto-approve \
  -var="region=${aws_region}" \
  -var="github_connection_arn=${github_connection_arn}" \
  -var="github_code_repo_url=${github_code_repo_url}"
}

destroy() {
  terraform -chdir="${tf_working_dir}" init \
  -migrate-state \
  -backend-config="region=${aws_region}" \
  -backend-config="bucket=${tf_state_s3_bucket}" \
  && \
  terraform -chdir="${tf_working_dir}" destroy -auto-approve \
  -var="region=${aws_region}" \
  -var="github_connection_arn=${github_connection_arn}" \
  -var="github_code_repo_url=${github_code_repo_url}"
}

help() {
  printf "./run.sh <apply|destroy>\n"
}

case ${1-help} in
  "destroy")
    destroy
  ;;

  "apply")
    apply
  ;;

  *)
    help
  ;;
esac