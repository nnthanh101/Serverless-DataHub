#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

function _logger() {
  echo -e "$(date) ${YELLOW}[*] $@ ${NC}"
}

source ./.env
# source ../scripts/cloud9.sh

echo
echo "#########################################################"
_logger "[+] 1.1. [DEBUG] Verify the prerequisites environment"
echo "#########################################################"
echo

echo "[x] Verify AWS CLI": $(aws  --version)
echo "[x] Verify git":     $(git  --version)
echo "[x] Verify jq":      $(jq   --version)
# echo "[x] Verify nvm":     $(nvm ls)
# echo "[x] Verify Node.js": $(node --version)
echo "[x] Verify CDK":     $(cdk  --version)
# echo "[x] Verify Python":  $(python -V)
# echo "[x] Verify Python3": $(python3 -V)
# echo "[x] Verify kubectl":  $(kubectl version --client)
# echo "[x] Verify java":    $(java -version)
# echo "[x] Verify maven":   $(mvn  -version)

echo "AWS_ACCOUNT=${AWS_ACCOUNT} + AWS_REGION=${AWS_REGION} + AWS_S3_BUCKET=${AWS_S3_BUCKET}"
currentPrincipalArn=$(aws sts get-caller-identity --query Arn --output text)
## Just in case, we are using an IAM role, we will switch the identity from your STS arn to the underlying role ARN.
currentPrincipalArn=$(sed 's/\(sts\)\(.*\)\(assumed-role\)\(.*\)\(\/.*\)/iam\2role\4/' <<< $currentPrincipalArn)
echo "currentPrincipalArn: $currentPrincipalArn"

echo
echo "#########################################################"
_logger "[+] 1.2. CDK Bootstrap >> Create S3 Bucket with Versioning Enabled ..."
echo "#########################################################"
echo

## DEBUG ONLY
## Note: us-east-1 does not require a `location-constraint`:
## aws s3api create-bucket --bucket ${AWS_S3_BUCKET} --region ${AWS_REGION} --create-bucket-configuration \
##    LocationConstraint=${AWS_REGION} 2>/dev/null || true
## aws s3api put-bucket-versioning --bucket ${AWS_S3_BUCKET} --versioning-configuration Status=Enabled 2>/dev/null || true

cdk bootstrap                aws://${AWS_ACCOUNT}/${AWS_REGION}  \
    --bootstrap-bucket-name  ${AWS_S3_BUCKET}                    \
    --termination-protection                                     \
    --tags CostCenter=${PROJECT_ID}
## cdk bootstrap aws://${AWS_ACCOUNT}/${AWS_REGION} --show-template -v

started_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
_logger "[+] [START] Deploy DevAx101 >> CDK at ${started_time}"
echo "#########################################################"
echo

CDK_PROJECT=spa-website
cd $CDK_PROJECT

## DEBUG
rm -rf cdk.out/*.* cdk.context.json

echo
echo "#########################################################"
_logger "[+] 2. [CDK TypeScript] Install node_modules dependencies ..."
echo "#########################################################"
echo

npm install
npm run build

## cdk diff   $AWS_CDK_STACK
## cdk synth  $AWS_CDK_STACK
## cdk deploy $AWS_CDK_STACK --require-approval never
cdk deploy --all --require-approval never

## FIXME >> DEBUG
## Query CloudFormation OUTPUT


# echo
# echo "#########################################################"
# _logger "[+] 3. Danger!!! Cleanup ..."
# echo "#########################################################"
# echo
# cdk destroy --all --require-approval never


ended_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo -e "${RED} [END] DevAx101 >> CDK at ${ended_time} - ${started_time} ${NC}"
echo "#########################################################"
echo
