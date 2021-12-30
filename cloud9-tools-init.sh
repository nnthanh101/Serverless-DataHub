#!/bin/bash

## -----------------------------------------------
cwd=$(pwd)
echo "-------------------------------------------------------------------------"
echo "Preparing your environment ..."

## Check for AWS Region --------------------------
export AWS_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone | sed 's/\(.*\)[a-z]/\1/')
if [ -z "$AWS_REGION" ]
then
    ## metadata might err, this is a safeguard
    exit 0
fi

## Export Default Env Variables ------------------
echo "export AWS_REGION=${AWS_REGION}" >> ~/.bash_profile
aws configure set default.region ${AWS_REGION}
aws configure get default.region

export NVM_VER=$(curl --silent "https://github.com/nvm-sh/nvm/releases/latest" | sed 's#.*tag/\(.*\)\".*#\1#') #v0.39.1
export CDK_VER=$(curl --silent "https://github.com/DevAx101/MicroServices/releases/latest" | sed 's#.*tag/\(.*\)\".*#\1#') #v.3.1.0
export PACKER_VER=1.7.8

## Clone CDK and install dependencies ------------
echo "Cloning CDK Repo ..."
cd ~/environment
# git clone --depth 1 --branch $CDK_VER https://github.com/DevAx101/MicroServices.git >/dev/null 2>&1
git clone https://github.com/DevAx101/MicroServices.git >/dev/null 2>&1
cd $cwd
echo "Installing dependencies ..."
sudo yum install golang jq -y -q -e 0 >/dev/null 2>&1
echo "Enabling utilities scripts ..."
chmod +x cloud9-resize.sh
chmod +x hosting-account/create-host-account.sh
echo "Resizing AWS Cloud9 Volume ..."
# ./cloud9-ebs-resize.sh ## 50GB by default

## NVM & Node Versions >> Lambda runtime compatible ---------------------------
echo "Installing nvm ..."
rm -rf ~/.nvm
export NVM_DIR=
curl --silent -o- "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VER/install.sh" | bash
source ~/.nvm/nvm.sh 
# nvm install --lts 
# nvm alias default stable
nvm install lts/fermium
nvm alias default lts/fermium

## npm packages ----------------------------------
echo "Installing framework and libs ..."
# npm install -g serverless pnpm hygen yarn docusaurus >/dev/null 2>&1
npm install -g serverless pnpm yarn cdk >/dev/null 2>&1

## packer ----------------------------------------
echo "Installing packer ..."
wget -q "https://releases.hashicorp.com/packer/$PACKER_VER/packer_${PACKER_VER}_linux_amd64.zip" -O packer_${PACKER_VER}_linux_amd64.zip
unzip "packer_${PACKER_VER}_linux_amd64.zip" >/dev/null 2>&1
sudo mv packer /usr/local/bin/ >/dev/null 2>&1
rm -f "packer_${PACKER_VER}_linux_amd64.zip" >/dev/null 2>&1

#F Finishing up ----------------------------------
echo "Finishing up ..."
echo -e "alias cdk-ami-list='aws ec2 describe-images --owners self --query \"reverse(sort_by(Images[*].{Id:ImageId,Name:Name, Created:CreationDate}, &Created))\" --filters \"Name=name,Values=${STAGE_NAME}*\" --output table'" >> ~/.bashrc 
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" 
source ~/.bashrc 
echo ""
echo "Your AWS Cloud9 Environment is ready to use. "
echo "-------------------------------------------------------------------------"
