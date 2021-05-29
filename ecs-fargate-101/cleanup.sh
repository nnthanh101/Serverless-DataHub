#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

function _logger() {
    echo -e "$(date) ${YELLOW}[*] $@ ${NC}"
}

source ./.env

echo
echo "#########################################################"
_logger "[+] Delete ECS"
echo "#########################################################"
echo
 
echo "Delete tasks"
 
for i in $(aws ecs list-tasks --cluster ${ECS_CLUSTER} | jq -r '.taskArns' | jq -r -c '.[]') ; do 
    aws ecs stop-task --cluster ${ECS_CLUSTER} --task $i --reason "Stopped by kill script" &> /dev/null
done

echo "Delete service"
  
for i in $(aws ecs list-services --cluster ${ECS_CLUSTER} | jq -r '.serviceArns' | jq -r -c '.[]') ; do 
    aws ecs delete-service --cluster $ECS_CLUSTER --service $i --force &> /dev/null
done
 
echo "Delete cluster: ${ECS_CLUSTER}"

aws ecs delete-cluster --cluster $ECS_CLUSTER &> /dev/null
 
echo
echo "#########################################################"
_logger "[+] Delete cloudformation stack"
echo "#########################################################"
echo

echo "delete stack: ${STACK_NAME}"

aws cloudformation delete-stack --stack-name $STACK_NAME &> /dev/null