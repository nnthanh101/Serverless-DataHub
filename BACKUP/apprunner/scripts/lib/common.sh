read_aws_account_id () {
  aws_account=$(aws sts get-caller-identity | jq -r '.Account' | tr -d '\n')
}

init_state_bucket () {
  tf_state_s3_bucket=$(echo "terraform-state-${aws_region}-${aws_account}" | awk '{print tolower($0)}')
  export tf_state_s3_bucket
  echo "Terraform state S3 bucket: ${tf_state_s3_bucket}"
  ## Note: us-east-1 does not require a `location-constraint`:
  aws s3api create-bucket --bucket "${tf_state_s3_bucket}" --region "${aws_region}" --create-bucket-configuration \
      LocationConstraint="${aws_region}" 2>/dev/null || true
  aws s3api put-bucket-versioning --bucket "${tf_state_s3_bucket}" --region "${aws_region}" --versioning-configuration Status=Enabled 2>/dev/null || true
}

ensure_env () {
  local env_file_name=$1

  if [ ! -f "${env_file_name}" ]; then
    printf "The '%s' file does not exist.\nRun 'cp %s.example %s' to generate a new file then provide correct values.\n" "${env_file_name}" "${env_file_name}" "${env_file_name}"
    exit
  fi

  printf "Loaded values from '%s'.\n" "${env_file_name}"
}