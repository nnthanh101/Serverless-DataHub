export PROJECT_ID=sls-token

## 1. Configuring AWS
export AWS_PROFILE=default

## 2. AWS Account & Region
if [ $(uname -s) == 'Darwin' ] ; then
    export AWS_ACCOUNT=$(aws sts get-caller-identity | jq -r '.Account' | tr -d '\n')
    export AWS_REGION=${AWS_REGION:-"ap-southeast-2"}
else
    export AWS_ACCOUNT=$(aws sts get-caller-identity --output text --query Account)
    # export AWS_REGION=$(curl -s 169.254.169.254/latest/dynamic/instance-identity/document | jq -r '.region')
    export AWS_REGION=${AWS_REGION:-"ap-southeast-2"}
fi

## 3. AWS Infra: S3
export S3_BUCKET=${PROJECT_ID}-${AWS_REGION}
export USERNAME=nnthanh101@gmail.com
