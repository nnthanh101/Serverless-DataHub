#!/bin/bash

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

function _logger() {
    echo -e "$(date) ${YELLOW}[*] $@ ${NC}"
}

# ./install-prerequisites.sh
source ./.env

started_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo "[START] Build & deploy docker to ECR & DockerHub - starting at ${started_time}"
echo "#########################################################"
echo

## echo $(aws sts get-caller-identity)
_logger "[+] ECR_REPO="${CONTAINER_REGISTRY_URL}/${ECR_REPOSITORY}
ECR_REPO=$(aws ecr describe-repositories | jq -c ".repositories[] | select(.repositoryName | contains(\"${ECR_REPOSITORY}\")) | .repositoryName")
if [ -z "${ECR_REPO}" ]; then
  aws ecr create-repository --repository-name ${ECR_REPOSITORY}
else
  _logger "[+] Skip creating ECR ${ECR_REPO}"
fi

## Login to ECR
aws ecr get-login-password | docker login --password-stdin -u AWS $CONTAINER_REGISTRY_URL

## Login to DockerHub
# echo $DOCKER_REGISTRY_PASSWORD | docker login --username $DOCKER_REGISTRY_USERNAME --password-stdin

## Build docker
docker build -t ${ECR_REPOSITORY} -f dockerfiles/nodejs/Dockerfile ./dockerfiles

## Tag for ECR
docker tag ${ECR_REPOSITORY} ${CONTAINER_REGISTRY_URL}/${ECR_REPOSITORY}:latest
## Tag for DockerHub
# docker tag ${ECR_REPOSITORY} ${DOCKER_REGISTRY_NAMESPACE}/${ECR_REPOSITORY}:latest

_logger "[+] Pushing Docker Image ..."
docker push ${CONTAINER_REGISTRY_URL}/${ECR_REPOSITORY}
# docker push ${DOCKER_REGISTRY_NAMESPACE}/${ECR_REPOSITORY}

ended_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo -e "${RED} [FINISH] Build & deploy docker - finished at ${ended_time} - ${started_time} ${NC}"
echo "#########################################################"
echo
