#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

function _logger() {
    echo -e "$(date) ${YELLOW}[*] $@ ${NC}"
}

echo
echo "#########################################################"
_logger "[+] ${RED} WARNING: This script will clean everything in your account" 
_logger "[+] ${RED} WARNING: This can't be roll back" 
echo "#########################################################"
echo
options=("YES DO IT!" "NO STOPPP!!!")
PS3='Please enter your choice: '
select opt in "${options[@]}"
do
    case $REPLY in
        1)
        echo "You choose: $opt..."  
        ;;
        2)
        echo "You choose: $opt..." 
        exit 1
        ;; 
    esac
    break
done
 
echo
echo "#########################################################" 
_logger "[+] Stop ECS in active status"
echo "#########################################################"
echo

./ecs-fargate/cleanup.sh   
  
echo
echo "#########################################################" 
_logger "[+] Clear all S3 and artifact"
echo "#########################################################"
echo

echo aws s3 ls | cut -d" " -f 3 | xargs -I{} aws s3 rb s3://{} --force &> /dev/null
echo "Cleaning completed"


echo
echo "#########################################################"
_logger "[+] Delete All Stacks"
echo "#########################################################"
echo

for i in $(aws cloudformation list-stacks | jq -r '.StackSummaries' | jq -r -c '.[] | select(.StackName).StackName') ; do 
    echo "Disable termination protection" 
    aws cloudformation update-termination-protection --no-enable-termination-protection --stack-name $i &> /dev/null
    echo "delete -> ${i}" 
    aws cloudformation delete-stack --stack-name $i &> /dev/null
done



echo
echo "#########################################################"
_logger "[+] Delete Completed"
echo "#########################################################"
echo
