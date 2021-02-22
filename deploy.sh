#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

function _logger() {
    echo -e "$(date) ${YELLOW}[*] $@ ${NC}"
}

source ./.env.sh

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
# echo "[x] Verify kubectl":  $(kubectl version --client)

echo $AWS_ACCOUNT + $AWS_REGION + $AWS_S3_BUCKET + $AWS_CDK_STACK
currentPrincipalArn=$(aws sts get-caller-identity --query Arn --output text)
## Just in case, you are using an IAM role, we will switch the identity from your STS arn to the underlying role ARN.
currentPrincipalArn=$(sed 's/\(sts\)\(.*\)\(assumed-role\)\(.*\)\(\/.*\)/iam\2role\4/' <<< $currentPrincipalArn)
echo $currentPrincipalArn


echo
echo "#########################################################"
_logger "[+] Install TypeScript node_modules ..."
echo "#########################################################"
echo

npm install
npm run build

cdk bootstrap aws://${AWS_ACCOUNT}/${AWS_REGION} \
    --bootstrap-bucket-name ${AWS_S3_BUCKET}     \
    --termination-protection                     \
    --tags Cost=cdk
## cdk bootstrap aws://${AWS_ACCOUNT}/${AWS_REGION} --show-template -v


started_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
_logger "[+] [START] Deploy CDK at ${started_time}"
echo "#########################################################"
echo

echo
echo "#########################################################"
_logger "[+] 1. [AWS Infrastructure] S3, VPC, Cloud9"
echo "#########################################################"
echo

## DEBUG
# rm -rf cdk.out/*.* cdk.context.json

## cdk diff
## cdk synth
cdk deploy --all --require-approval never

## Danger!!! Cleanup
# echo "Cleanup ..."
# cdk destroy

ended_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo -e "${RED} [END] CDK at ${ended_time} - ${started_time} ${NC}"
echo "#########################################################"
echo