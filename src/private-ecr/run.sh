#!/bin/bash
set -euo pipefail

source "./../../scripts/lib/common.sh"

ensure_env ".ecr.env"
source ".ecr.env"

read_aws_account_id
init_state_bucket

function init_ecr_env() {
  ensure_env ".ecr.env"
  source ".ecr.env"
  tf_working_dir="./terraform/ecr"
}

function init_apprunner_env() {
  ensure_env ".apprunner.env"
  source ".apprunner.env"
  tf_working_dir="./terraform/apprunner"
}

function apply_ecr() {
  init_ecr_env

  terraform -chdir="${tf_working_dir}" init \
  -migrate-state \
  -backend-config="region=${aws_region}" \
  -backend-config="bucket=${tf_state_s3_bucket}" \
  && \
  terraform -chdir="${tf_working_dir}" apply -auto-approve \
  -var="region=${aws_region}" \
  -var="creat_github_iam=${creat_github_iam}" \
  -var="ecr_repo_name=${ecr_repo_name}"

  ecr_repo_url=$(terraform -chdir="${tf_working_dir}" output -raw ecr_repo_url)
  echo "aws_region=${aws_region}
ecr_repo_url=\"${ecr_repo_url}\"" > ".apprunner.env"

  printf "\n"
  printf "After pushing first container image to ECR, run 'run.sh apply_app_runner' to deploy to AppRunner.\n\n"
}

function apply_app_runner() {
  init_apprunner_env

  terraform -chdir="${tf_working_dir}" init \
  -migrate-state \
  -backend-config="region=${aws_region}" \
  -backend-config="bucket=${tf_state_s3_bucket}" \
  && \
  terraform -chdir="${tf_working_dir}" apply -auto-approve \
  -var="region=${aws_region}" \
  -var="ecr_repo_url=${ecr_repo_url}"
}

function destroy_app_runner() {
  init_apprunner_env

    terraform -chdir="${tf_working_dir}" init \
    -migrate-state \
    -backend-config="region=${aws_region}" \
    -backend-config="bucket=${tf_state_s3_bucket}" \
    && \
    terraform -chdir="${tf_working_dir}" destroy -auto-approve \
    -var="region=${aws_region}" \
    -var="ecr_repo_url=${ecr_repo_url}"
}

function destroy_ecr() {
  source ".ecr.env"
  tf_working_dir="./terraform/ecr"

  terraform -chdir="${tf_working_dir}" init \
  -migrate-state \
  -backend-config="region=${aws_region}" \
  -backend-config="bucket=${tf_state_s3_bucket}" \
  && \
  terraform -chdir="${tf_working_dir}" destroy -auto-approve \
  -var="region=${aws_region}" \
  -var="creat_github_iam=${creat_github_iam}" \
  -var="ecr_repo_name=${ecr_repo_name}"
}


function destroy() {
  destroy_app_runner
  destroy_ecr
}

function show_iam() {
  source ".ecr.env"
  tf_working_dir="./terraform/ecr"

  terraform -chdir="${tf_working_dir}" init \
  -migrate-state \
  -backend-config="region=${aws_region}" \
  -backend-config="bucket=${tf_state_s3_bucket}" \
  && \
  terraform -chdir="${tf_working_dir}" output -json iam_access_key_secret
}

help() {
  printf "./scripts/1-ecr-public-example.sh <command>:\n"
  printf "\n"
  printf "<command> values:\n"
  printf "  apply_ecr:          Create ECR repository\n"
  printf "  apply_app_runner:   Create AppRunner service\n"
  printf "  destroy_ecr:        Destroy ECR repository\n"
  printf "  destroy_app_runner: Destroy AppRunner service\n"
  printf "  show_secret_key:    Show the iam_access_key_secret of the new IAM user\n"
  printf "  destroy:            Clean up all resources (ecr and app_runner)\n"
}

case ${1-help} in
  "destroy")
    destroy
  ;;

  "apply_ecr")
    apply_ecr
  ;;

  "apply_app_runner")
    apply_app_runner
  ;;

  "show_secret_key")
    show_iam
  ;;

  "destroy_ecr")
    destroy_ecr
  ;;

  "destroy_app_runner")
    destroy_app_runner
  ;;

  *)
    help
  ;;
esac