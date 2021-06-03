RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

export org="DevAx"
export tenant="CUDOS"

export PROJECT_ID=${org}-${tenant}
export WORKING_DIR=$PWD
export AWS_PROFILE=default

if [ $(uname -s) == 'Darwin' ] ; then
    export AWS_ACCOUNT=$(aws sts get-caller-identity | jq -r '.Account' | tr -d '\n')
    export AWS_REGION=${AWS_REGION:-"ap-southeast-1"}
else
    export AWS_ACCOUNT=$(aws sts get-caller-identity --output text --query Account)
    # export AWS_REGION=$(curl -s 169.254.169.254/latest/dynamic/instance-identity/document | jq -r '.region')
    export AWS_REGION=${AWS_REGION:-"ap-southeast-1"}
fi

function _logger() {
    echo -e "$(date) ${YELLOW}[*] $@ ${NC}"
}