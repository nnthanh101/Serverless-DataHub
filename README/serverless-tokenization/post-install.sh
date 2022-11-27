#!/bin/bash

source ./.env.sh

export STACK_NAME=KMS-Key
export STACK_NAME2=tokenizer
export STACK_NAME3=M2M-App

echo "[+] Step 1. Create KMS - Customer Managed Keys"
# aws cloudformation describe-stacks --stack-name ${STACK_NAME}
echo "==YourKMSArn arn:aws:kms:${AWS_REGION}:${AWS_ACCOUNT}:key/___"
YourKMSArn=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} | jq -r '.Stacks[0].Outputs[0].OutputValue')
echo ${YourKMSArn}

echo "[+] Step 2. Create Lambda Layer for String Tokenization & Encrypted Data Store"
# aws cloudformation describe-stacks --stack-name ${STACK_NAME2}
echo "===YourLayervErsionArn arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT}:layer:TokenizeData:___"
YourLayervErsionArn=$(aws cloudformation list-exports | jq -r '.[] | .[0].Value')
echo ${YourLayervErsionArn}

echo "===YourDynamoDBArn arn:aws:dynamodb:${AWS_REGION}:${AWS_ACCOUNT}:table/CreditCardTokenizerTable"
export YourDynamoDBArn="arn:aws:dynamodb:${AWS_REGION}:${AWS_ACCOUNT}:table/CreditCardTokenizerTable"
echo ${YourDynamoDBArn}

echo "[+] Step 3. Create Serverless Application: API-Gateway, Lambda, Cognito"
# aws cloudformation describe-stacks --stack-name ${STACK_NAME3}
echo "3.4. CloudFormation > Describe Stack ${STACK_NAME3}"              
# aws cloudformation describe-stacks --stack-name ${STACK_NAME3} --region ${AWS_REGION}

echo "===YourUserPoolAppClientId: Cognito >> General settings >> App client id"
export YourUserPools=$(aws cognito-idp list-user-pools --max-results 10 | jq -r '.[] | .[0].Id')
export YourUserPoolAppClientId=$(aws cognito-idp list-user-pool-clients --user-pool-id $YourUserPools | jq -r '.[] | .[0].ClientId')
echo ${YourUserPoolAppClientId}

export ROOTPrincipal="arn:aws:iam::${AWS_ACCOUNT}:root"

echo "===YourLambdaExecutionRole arn:aws:iam::${AWS_ACCOUNT}:role/M2M-App-LambdaExecutionRole___"
YourLambdaExecutionRole=`aws cloudformation describe-stacks --region ${AWS_REGION} --stack-name ${STACK_NAME3}  | \
                         jq -r '.Stacks[].Outputs[] | select(.OutputKey == "LambdaExecutionRole") | .OutputValue'`
echo ${YourLambdaExecutionRole}

echo "===YourPaymentMethodApiURL https://___.execute-api.${AWS_REGION}.amazonaws.com/dev"
YourPaymentMethodApiURL=`aws cloudformation describe-stacks --region ${AWS_REGION} --stack-name ${STACK_NAME3}  | \
                         jq -r '.Stacks[].Outputs[] | select(.OutputKey == "PaymentMethodApiURL") | .OutputValue'`
echo ${YourPaymentMethodApiURL} 

## FIXME
POLICY=$(cat << EOF
{ 
    "Version": "2012-10-17", 
    "Id": "kms-cmk-1", 
    "Statement": [ 
        { 
            "Sid": "Enable IAM User Permissions", 
            "Effect": "Allow", 
            "Principal": {"AWS": ["$ROOTPrincipal"]}, 
            "Action": "kms:*", 
            "Resource": "$YourKMSArn" 
        }, 
        { 
            "Sid": "Enable IAM User Permissions", 
            "Effect": "Allow", 
            "Principal": {"AWS": ["$YourLambdaExecutionRole"]}, 
            "Action": ["kms:Decrypt", "kms:Encrypt", "kms:GenerateDataKey", "kms:GenerateDataKeyWithoutPlaintext"], 
            "Resource": "$YourKMSArn" 
        } 
    ] 
}
EOF
); \
aws kms put-key-policy --key-id "${YourKMSArn}" --policy-name default --policy "$POLICY"

## FIXME 2
aws cognito-idp sign-up --region ${AWS_REGION} --client-id $YourUserPoolAppClientId --username $USERNAME --password Passw0rd!