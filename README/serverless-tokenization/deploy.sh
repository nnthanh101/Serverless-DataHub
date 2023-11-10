#!/bin/bash

source ./.env.sh
# source ./.cloud9.sh

echo "Creating the S3 bucket: ${S3_BUCKET}"
aws s3api create-bucket --bucket ${S3_BUCKET} --region ${AWS_REGION} --create-bucket-configuration LocationConstraint=${AWS_REGION} || true
aws s3api put-bucket-versioning --bucket ${S3_BUCKET} --versioning-configuration Status=Enabled

echo
echo "#########################################################"
echo "[+] Step 1. Create KMS - Customer Managed Keys"
echo "#########################################################"
echo

export STACK_NAME=KMS-Key
cd ${STACK_NAME}

echo "1.1. Build the SAM template template.yaml"
sam build --use-container

echo "1.2. Package the code and push to S3 Bucket."
sam package --s3-bucket ${S3_BUCKET} --output-template-file packaged.yaml

echo "1.3. packaged.yaml will be used to deploy the code and resources to AWS."
sam deploy --stack-name ${STACK_NAME}                   \
           --template-file ./packaged.yaml              \
           --region ${AWS_REGION} --confirm-changeset --no-fail-on-empty-changeset \
           --capabilities CAPABILITY_IAM                \
           --s3-bucket ${S3_BUCKET} --s3-prefix backend \
           --config-file samconfig.toml                 \
           --no-confirm-changeset                       \
           --tags                                       \
             Project=${PROJECT_ID}

# echo "CloudFormation > Describe Stack ${STACK_NAME}"
# aws cloudformation describe-stacks --stack-name ${STACK_NAME}

# echo "==YourKMSArn arn:aws:kms:${AWS_REGION}:${AWS_ACCOUNT}:key/___"
# YourKMSArn=$(aws kms list-aliases | jq -r '.[] | .[0].AliasArn')
# echo ${YourKMSArn}

echo
echo "#########################################################"
echo "[+] Step 2. Create Lambda Layer for String Tokenization & Encrypted Data Store"
echo "#########################################################"
echo

export STACK_NAME2=tokenizer
cd ../${STACK_NAME2}

echo "2.1. Run the script to compile and install the dependent libraries in dynamodb-client/python/ directory"
source ./get_AMI_packages_cryptography.sh

echo "2.2. Build the SAM template (template.yaml)"
sam build --use-container 

echo "2.3. Copy the python files ddb_encrypt_item.py and hash_gen.py to dynamodb-client/python/"
cp ddb_encrypt_item.py dynamodb-client/python/
cp hash_gen.py dynamodb-client/python/

echo "2.4. Package the code and push to S3 Bucket."
sam package --s3-bucket ${S3_BUCKET} --output-template-file packaged.yaml

echo "2.5. packaged.yaml will be used to deploy the code and resources to AWS."
sam deploy --stack-name ${STACK_NAME2}                      \
               --template-file ./packaged.yaml              \
               --region ${AWS_REGION} --confirm-changeset --no-fail-on-empty-changeset \
               --capabilities CAPABILITY_IAM                \
               --s3-bucket ${S3_BUCKET} --s3-prefix backend \
               --config-file samconfig.toml                 \
               --no-confirm-changeset                       \
               --tags                                       \
                    Project=${PROJECT_ID}

# echo "CloudFormation > Describe Stack ${STACK_NAME2}"
# aws cloudformation describe-stacks --stack-name ${STACK_NAME2}

# echo "===YourLayervErsionArn arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT}:layer:TokenizeData:___"
# YourLayervErsionArn=$(aws cloudformation list-exports | jq -r '.[] | .[0].Value')
# echo ${YourLayervErsionArn}

# echo "===YourDynamoDBArn arn:aws:dynamodb:${AWS_REGION}:${AWS_ACCOUNT}:table/CreditCardTokenizerTable"
# export YourDynamoDBArn="arn:aws:dynamodb:${AWS_REGION}:${AWS_ACCOUNT}:table/CreditCardTokenizerTable"
# echo ${YourDynamoDBArn}

echo
echo "#########################################################"
echo "[+] Step 3. Create Serverless Application: API-Gateway, Lambda, Cognito"
echo "#########################################################"
echo

export STACK_NAME3=M2M-App
cd ../${STACK_NAME3}

# echo "==YourKMSArn arn:aws:kms:${AWS_REGION}:${AWS_ACCOUNT}:key/___"
YourKMSArn=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} | jq -r '.Stacks[0].Outputs[0].OutputValue')
echo ${YourKMSArn}

# echo "===YourLayervErsionArn arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT}:layer:TokenizeData:___"
YourLayervErsionArn=$(aws cloudformation list-exports | jq -r '.[] | .[0].Value')
echo ${YourLayervErsionArn}

# echo "===YourDynamoDBArn arn:aws:dynamodb:${AWS_REGION}:${AWS_ACCOUNT}:table/CreditCardTokenizerTable"
export YourDynamoDBArn="arn:aws:dynamodb:${AWS_REGION}:${AWS_ACCOUNT}:table/CreditCardTokenizerTable"
echo ${YourDynamoDBArn}

echo "3.1. Build SAM template. Replace the parameters with previously noted values for LayerVersionArn (Step 2.5.)"
sam build --use-container --parameter-overrides layerarn=${YourLayervErsionArn}

echo "3.2. Package the code and push to S3 Bucket."
sam package --s3-bucket ${S3_BUCKET} --output-template-file packaged.yaml

echo "3.3. packaged.yaml will be used to deploy the code and resources to AWS."
sam deploy  --stack-name ${STACK_NAME3}                  \
            --template-file ./packaged.yaml              \
            --region ${AWS_REGION} --confirm-changeset --no-fail-on-empty-changeset \
            --capabilities CAPABILITY_IAM                \
            --s3-bucket ${S3_BUCKET} --s3-prefix backend \
            --config-file samconfig.toml                 \
            --no-confirm-changeset                       \
            --parameter-overrides                        \
              layerarn=${YourLayervErsionArn}            \
              kmsid=${YourKMSArn}                        \
              dynamodbarn=${YourDynamoDBArn}             \
            --tags                                       \
              Project=${PROJECT_ID}

# echo "3.4. CloudFormation > Describe Stack ${STACK_NAME3}"              
# aws cloudformation describe-stacks --stack-name ${STACK_NAME3} --region ${AWS_REGION}

# echo "===YourUserPoolAppClientId: Cognito >> General settings >> App client id"
# export YourUserPools=$(aws cognito-idp list-user-pools --max-results 10 | jq -r '.[] | .[0].Id')
# export YourUserPoolAppClientId=$(aws cognito-idp list-user-pool-clients --user-pool-id $YourUserPools | jq -r '.[] | .[0].ClientId')
# echo ${YourUserPoolAppClientId}

# export ROOTPrincipal="arn:aws:iam::${AWS_ACCOUNT}:root"

# echo "===YourLambdaExecutionRole arn:aws:iam::${AWS_ACCOUNT}:role/M2M-App-LambdaExecutionRole___"
# YourLambdaExecutionRole=`aws cloudformation describe-stacks --region ${AWS_REGION} --stack-name ${STACK_NAME3}  | \
#                          jq -r '.Stacks[].Outputs[] | select(.OutputKey == "LambdaExecutionRole") | .OutputValue'`
# echo ${YourLambdaExecutionRole}

# echo "===YourPaymentMethodApiURL https://___.execute-api.${AWS_REGION}.amazonaws.com/dev"
# YourPaymentMethodApiURL=`aws cloudformation describe-stacks --region ${AWS_REGION} --stack-name ${STACK_NAME3}  | \
#                          jq -r '.Stacks[].Outputs[] | select(.OutputKey == "PaymentMethodApiURL") | .OutputValue'`
# echo ${YourPaymentMethodApiURL} 


# echo
# echo "#########################################################"
# echo "[+] Danger!!! Cleanup"
# echo "#########################################################"
# echo

# echo "Cleanup ..."
# export STACK_NAME=KMS-Key
# export STACK_NAME2=tokenizer
# export STACK_NAME2=tokenizerexport STACK_NAME3=M2M-App
# aws cloudformation delete-stack --stack-name ${STACK_NAME}
# aws cloudformation delete-stack --stack-name ${STACK_NAME2}
# aws cloudformation delete-stack --stack-name ${STACK_NAME3}
# sleep 30
# aws s3 rb s3://${S3_BUCKET} --force