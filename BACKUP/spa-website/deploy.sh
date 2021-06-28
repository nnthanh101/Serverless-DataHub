#!/bin/bash
# set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

function _logger() {
    echo -e "$(date) ${YELLOW}[*] $@ ${NC}"
}

source ./.env
# ./install-prerequisites.sh

echo
echo "#########################################################"
_logger "[+] Verify the prerequisites environment"
echo "#########################################################"
echo
## DEBUG
echo "[x] Verify AWS CLI": $(aws  --version)
echo "[x] Verify jq":      $(jq   --version)
# echo "[x] Verify Docker":  $(docker version)
echo "[x] Verify CDK":     $(cdk  --version)
echo "[x] Verify Node.js": $(node --version)
# echo "[x] Verify Python":  $(python -V)
# echo "[x] Verify Maven":   $(cdk  --version)
# https://aws.amazon.com/visualstudio/


echo $AWS_ACCOUNT + $AWS_REGION + $AWS_S3_BUCKET + $AWS_CDK_STACK
currentPrincipalArn=$(aws sts get-caller-identity --query Arn --output text)
## Just in case, you are using an IAM role, we will switch the identity from your STS arn to the underlying role ARN.
currentPrincipalArn=$(sed 's/\(sts\)\(.*\)\(assumed-role\)\(.*\)\(\/.*\)/iam\2role\4/' <<< $currentPrincipalArn)
echo $currentPrincipalArn

## Install node_modules typescript
npm install
npm run build 

cdk bootstrap aws://${AWS_ACCOUNT}/${AWS_REGION} \
   --toolkit-stack-name ${AWS_CDK_STACK}         \
   --termination-protection                     
##   --toolkit-bucket-name ${AWS_S3_BUCKET}        \
## export CDK_NEW_BOOTSTRAP=1
## cdk bootstrap aws://${AWS_ACCOUNT}/${AWS_REGION} --show-template -v

started_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
_logger "[+] [START] Deploy SPA Website at ${started_time}"
echo "#########################################################"
echo

## cdk diff $AWS_CDK_STACK
## cdk synth $AWS_CDK_STACK
## cdk deploy $AWS_CDK_STACK --require-approval never
cdk deploy --all --require-approval never  --toolkit-stack-name ${AWS_CDK_STACK} 

ended_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo -e "${RED} [END] SPA Website at ${ended_time} - ${started_time} ${NC}"
echo "#########################################################"
echo
