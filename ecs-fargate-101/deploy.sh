#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

function _logger() {
    echo -e "$(date) ${YELLOW}[*] $@ ${NC}"
}

source ./.env
# source ./cloud9.sh

echo
echo "#########################################################"
_logger "[+] Verify the prerequisites environment"
echo "#########################################################"
echo

## DEBUG
echo "[x] Verify AWS CLI": $(aws  --version)
echo "[x] Verify git":     $(git  --version)
echo "[x] Verify jq":      $(jq   --version)
echo "[x] Verify nano":    $(nano --version)
# echo "[x] Verify Docker":  $(docker version)
# echo "[x] Verify Docker Deamon":  $(docker ps -q)
# echo "[x] Verify nvm":     $(nvm ls)
echo "[x] Verify Node.js": $(node --version)
echo "[x] Verify CDK":     $(cdk  --version)
# echo "[x] Verify Python":  $(python -V)
# echo "[x] Verify Python3": $(python3 -V)
# echo "[x] Verify kubectl":  $(kubectl version --client)

echo $AWS_ACCOUNT + $AWS_REGION + $AWS_S3_BUCKET
currentPrincipalArn=$(aws sts get-caller-identity --query Arn --output text)
## Just in case, you are using an IAM role, we will switch the identity from your STS arn to the underlying role ARN.
currentPrincipalArn=$(sed 's/\(sts\)\(.*\)\(assumed-role\)\(.*\)\(\/.*\)/iam\2role\4/' <<< $currentPrincipalArn)
echo $currentPrincipalArn

echo
echo "#########################################################"
_logger "[+] 1. [SpringBoot] Build war and jar"
echo "#########################################################"
echo


git clone https://github.com/spring-projects/spring-petclinic.git projects/springboot 2> /dev/null || (echo No thing!)
cd projects/springboot
rm -rf ./src/main/resources/application.properties
cp -i ${WORKING_DIR}/projects/application.properties ./src/main/resources/

mvn spring-javaformat:apply
mvn package -DskipTests

cd ../..


echo
echo "#########################################################"
_logger "[+] Install TypeScript node_modules"
echo "#########################################################"
echo

npm install
npm run build

cdk bootstrap aws://${AWS_ACCOUNT}/${AWS_REGION} \
    --bootstrap-bucket-name ${AWS_S3_BUCKET}     \
    --termination-protection                     \
    --tags Cost=${PROJECT_ID}
## export CDK_NEW_BOOTSTRAP=1
## cdk bootstrap aws://${AWS_ACCOUNT}/${AWS_REGION} --show-template -v


started_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
_logger "[+] [START] Deploy ECS-Fargate at ${started_time}"
echo "#########################################################"
echo

echo
echo "#########################################################"
_logger "[+] 1. [AWS Infrastructure] S3, VPC, Cloud9"
echo "#########################################################"
echo

## FIXME
# cd docker
# docker rmi -f $(docker images -a -q) && docker container rm $(docker container ls -aq)
# docker image prune -f

## FIXME
# echo
# echo "#########################################################"
# _logger "[+] 2.1. [ECR] Deploy Docker to ECR >> job4u-web"
# echo "#########################################################"
# echo
# export ECR_REPOSITORY_JOB4U_WEB=job4u-web
# sh ./deploy-docker-ecr.sh

## FIXME
# echo
# echo "#########################################################"
# _logger "[+] 2.2. [ECR]Deploy Backend - job4u-byod"
# echo "#########################################################"
# echo
# sh ./deploy-docker-job4u-byod.sh

## FIXME
# echo
# echo "#########################################################"
# _logger "[+] 2.3. [ECR]Deploy Backend - job4u-sync"
# echo "#########################################################"
# echo
# sh ./deploy-docker-job4u-sync.sh

# cd ..

echo
echo "#########################################################"
_logger "[+] 3. [AWS CDK] Deploy"
echo "#########################################################"
echo

## DEBUG
rm -rf cdk.out/*.* cdk.context.json

## cdk diff $AWS_CDK_STACK
## cdk synth $AWS_CDK_STACK
## cdk deploy $AWS_CDK_STACK --require-approval never
cdk deploy --all --require-approval never

## Query RDS Endpoint
# HostInstanceDBMySQL=$(aws rds --region ${AWS_REGION} describe-db-instances --db-instance-identifier ${AWS_RDS_DATABASE_NAME}  --query "DBInstances[*].Endpoint.Address" --output text)

# echo
# echo "#########################################################"
# _logger "[+] 4. [MySQL RDS] Restore Data test"
# echo "#########################################################"
# echo
# ## Check table exist
# AllTables="$(mysql -u $AWS_RDS_CREDENTIAL_USERNAME -h $HostInstanceDBMySQL --password="${AWS_RDS_CREDENTIAL_PAWSSWORD}" ${AWS_RDS_DATABASE_NAME} -Bse 'show tables')"

# if test -z "$AllTables"; then
#     echo Restore Data
#     mysql -u ${AWS_RDS_CREDENTIAL_USERNAME} --password="${AWS_RDS_CREDENTIAL_PAWSSWORD}" -h ${HostInstanceDBMySQL} ${AWS_RDS_DATABASE_NAME} < ./projects/springboot/src/main/resources/db/mysql/schema.sql
#     mysql -u ${AWS_RDS_CREDENTIAL_USERNAME} --password="${AWS_RDS_CREDENTIAL_PAWSSWORD}" -h ${HostInstanceDBMySQL} ${AWS_RDS_DATABASE_NAME} < ./projects/springboot/src/main/resources/db/mysql/data.sql
# else
#     echo Table exist!
# fi


echo
echo "#########################################################"
_logger "[+] 5. [Code Commit] Init repository "
echo "#########################################################"
echo

./codecommit.sh

## FIXME
# echo
# echo "#########################################################"
# _logger "[+] 5. Danger!!! Cleanup"
# echo "#########################################################"
# echo

## FIXME
# echo "Cleanup ..."
# cdk destroy --all --require-approval never
# aws cloudformation delete-stack --stack-name ${PROJECT_ID}

ended_time=$(date '+%d/%m/%Y %H:%M:%S')
echo
echo "#########################################################"
echo -e "${RED} [END] ECS-Fargate at ${ended_time} - ${started_time} ${NC}"
echo "#########################################################"
echo