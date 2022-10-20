#!/bin/bash 
set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

function _logger() {
    echo -e "$(date) ${YELLOW}[*] $@ ${NC}"
}

. ./.env

WORKSPACE=$(pwd)
CDK_PROJECT_DIR=${WORKSPACE}

# echo $AWS_ACCOUNT + $AWS_REGION
# echo $AWS_S3_BUCKET
# echo $CDK_PROJECT_DIR


echo
echo "#########################################################"
_logger "[+] Verify the prerequisites environment"
echo "#########################################################"
echo

## DEBUG
echo "[x] Verify AWS CLI": $(aws  --version)
echo "[x] Verify git":     $(git  --version)
echo "[x] Verify jq":      $(jq   --version)
# echo "[x] Verify nano":    $(nano --version)
# echo "[x] Verify Docker":  $(docker version)
# echo "[x] Verify Docker Deamon":  $(docker ps -q)
# echo "[x] Verify nvm":     $(nvm ls)
echo "[x] Verify Node.js": $(node --version)
echo "[x] Verify CDK":     $(cdk  --version)
# echo "[x] Verify Python":  $(python -V)
# echo "[x] Verify Python3": $(python3 -V) 
# echo "[x] Verify kubectl": $(kubectl version --client)
echo "[DEBUG] .env: " $PROJECT_ID + $AWS_ACCOUNT + $AWS_REGION + $AWS_S3_BUCKET

currentPrincipalArn=$(aws sts get-caller-identity --query Arn --output text)
## Just in case, you are using an IAM role, we will switch the identity from your STS arn to the underlying role ARN.
currentPrincipalArn=$(sed 's/\(sts\)\(.*\)\(assumed-role\)\(.*\)\(\/.*\)/iam\2role\4/' <<< $currentPrincipalArn)
echo $currentPrincipalArn

echo "[DEBUG] aws s3 ls ..."
aws s3 ls

test -n "$PROJECT_ID"    && echo ACCOUNT_ID is "$PROJECT_ID"    || echo PROJECT_ID is not set
test -n "$AWS_ACCOUNT"   && echo ACCOUNT_ID is "$AWS_ACCOUNT"   || echo AWS_ACCOUNT is not set
test -n "$AWS_REGION"    && echo AWS_REGION is "$AWS_REGION"    || echo AWS_REGION is not set
test -n "$AWS_S3_BUCKET" && echo AWS_REGION is "$AWS_S3_BUCKET" || echo AWS_S3_BUCKET is not set

echo
echo "#########################################################"
_logger "[+] Install TypeScript node_modules"
echo "#########################################################"
echo

npm install

echo "Boostrap the region you plan to deploy to ..."
cdk bootstrap aws://${AWS_ACCOUNT}/${AWS_REGION} \
    --termination-protection                     \
    --tags APP-ID=${PROJECT_ID}                  \
    # --show-template -v


started_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
_logger "[+] [START] Deploy CDK at ${started_time}"
echo "#########################################################"
echo


echo
echo "#########################################################"
_logger "[+] Deploying the CDK: $CDK_PROJECT_DIR"
echo "#########################################################"
echo

cd ${CDK_PROJECT_DIR}
# rm -rf cdk.out/*.* cdk.context.json
npm run build

# cdk diff
# cdk synth
cdk deploy --all --require-approval never

## FIXME
# ./parameter-store.sh

# echo
# echo "#########################################################"
# echo -e "${RED} [+] Danger!!! Cleanup ..."
# echo "#########################################################"
# echo
#
# cdk destroy --all --require-approval never

ended_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo -e "${RED} [END] CDK at ${ended_time} - ${started_time} ${NC}"
echo "#########################################################"
echo
