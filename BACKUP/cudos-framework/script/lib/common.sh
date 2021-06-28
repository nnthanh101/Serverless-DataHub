export NC='\033[0m'
export RED='\033[0;31m'
export YELLOW='\033[1;33m'

org="DevAx"
tenant="CUDOS"

export project_id=${org}-${tenant}
export aws_profile=default

if [ "$(uname -s)" == 'Darwin' ] ; then
    export aws_account=$(aws sts get-caller-identity | jq -r '.Account' | tr -d '\n')
    export aws_region=${AWS_REGION:-"ap-southeast-1"}
else
    export aws_account=$(aws sts get-caller-identity --output text --query Account)
    # export AWS_REGION=$(curl -s 169.254.169.254/latest/dynamic/instance-identity/document | jq -r '.region')
    export aws_region=${AWS_REGION:-"ap-southeast-1"}
fi

function _logger() {
    echo -e "$(date) ${YELLOW}[*] $@ ${NC}"
}
