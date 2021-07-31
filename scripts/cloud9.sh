#!/bin/bash
set -euxo pipefail

source ./ebs-resize-boto3.sh

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

function _logger() {
    echo -e "$(date) ${YELLOW}[*] $@ ${NC}"
}

echo "This script support Amazon Linux 2 ONLY !!!"

KERNEL_TYPE=linux
AWS_CLI_VERSION=$(aws --version)

echo "#########################################################"
_logger "[+] 1.1. Installing Utilities: jq, wget, unzip ..."
echo "#########################################################"
sudo yum -y update && sudo yum -y upgrade
sudo yum install -y jq gettext bash-completion wget unzip moreutils nmap bind-utils

echo "#########################################################"
_logger "[+] 1.2. Installing latest AWS CLI - version 2"
echo "#########################################################"

# if [[ "$KERNEL_TYPE" == "linux" ]]; then   
    if [[ "$AWS_CLI_VERSION" < "aws-cli/2" ]]; then
        echo "Uninstall the AWS CLI version 1 using pip"
        sudo pip uninstall awscli
        echo "Install the AWS CLI version 2 using pip"
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install --bin-dir /usr/local/bin --install-dir /usr/local/aws-cli --update
        rm -rf awscliv2.zip aws
    fi
    python -m pip install --upgrade pip --user
    pip3 install boto3 --user
# else
#     curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
#     sudo installer -pkg ./AWSCLIV2.pkg -target /
#     rm -rf aws AWSCLIV2.pkg
#     brew tap weaveworks/tap
#     brew install weaveworks/tap/eksctl
# fi

echo "#########################################################"
_logger "[+] 2. Upgrade lts/erbium nodejs12.x & Installing CDK ..."
echo "#########################################################"
# nvm install lts/erbium
# nvm use lts/erbium
# nvm alias default lts/erbium
# nvm uninstall v10.24.0
npm update && npm update -g
sudo npm install -g aws-cdk --force


_logger "[+] Verify Prerequisites ..."
echo "[x] Verify Git client":        $(git --version)
echo "[x] Verify jq":                $(jq   --version)
echo "[x] Verify AWS CLI version 2": $(aws --version)
echo "[x] Verify Node.js":           $(node --version)
echo "[x] Verify CDK":               $(cdk --version)
# echo "[x] Verify Python": $(python -V)
# echo "[x] Verify Python3":           $(python3 -V)
# echo "[x] Verify Pip3":              $(pip3 -V)
# echo "[x] Verify kubectl":           $(kubectl version --client)
# echo "[x] Verify eksctl":            $(eksctl version)
# echo "[x] Verify helm3":             $(helm version --short)
# echo "[x] Verify k9s":               $(k9s version --short)
# echo "[x] Verify Java":              $(java --version)
# echo "[x] Verify Maven":             $(mvn --version)

echo "#########################################################"
_logger "[+] 3. Verify the binaries are in the path and executable! "
echo "#########################################################"

for command in aws wget jq envsubst
  do
    which $command &>/dev/null && echo "[x] $command in path" || echo "[ ] $command NOT FOUND"
  done

echo "Check if AWS_REGION is set to desired region"
export ACCOUNT_ID=$(aws sts get-caller-identity --output text --query Account)
export AWS_REGION=$(curl -s 169.254.169.254/latest/dynamic/instance-identity/document | jq -r '.region')
test -n "$ACCOUNT_ID" && echo ACCOUNT_ID is "$ACCOUNT_ID" || echo ACCOUNT_ID is not set
test -n "$AWS_REGION" && echo AWS_REGION is "$AWS_REGION" || echo AWS_REGION is not set

echo "Validate the IAM role admin-role"
aws sts get-caller-identity --query Arn | grep admin-role -q && echo "IAM role valid" || echo "[IAM Role] admin-role ISN'T valid!"

_logger "[+] Configure Cloud 9 & AWS Settings ✅⛅️️🚀"
