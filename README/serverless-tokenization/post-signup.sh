#!/bin/bash
set -e
source ./.env.sh
export STACK_NAME3=M2M-App

echo "===YourUserPoolAppClientId: Cognito >> General settings >> App client id"
export YourUserPools=$(aws cognito-idp list-user-pools --max-results 10 | jq -r '.[] | .[0].Id')
export YourUserPoolAppClientId=$(aws cognito-idp list-user-pool-clients --user-pool-id $YourUserPools | jq -r '.[] | .[0].ClientId')
echo ${YourUserPoolAppClientId}

echo "===YourPaymentMethodApiURL https://___.execute-api.${AWS_REGION}.amazonaws.com/dev"
YourPaymentMethodApiURL=`aws cloudformation describe-stacks --region ${AWS_REGION} --stack-name ${STACK_NAME3}  | \
                         jq -r '.Stacks[].Outputs[] | select(.OutputKey == "PaymentMethodApiURL") | .OutputValue'`
echo ${YourPaymentMethodApiURL} 

## Cognito >> General settings >> Users and groups >> 
# Use confirmation code from email to replace this confirmation code and run this script
aws cognito-idp confirm-sign-up --client-id $YourUserPoolAppClientId  --username $USERNAME --confirmation-code 000562

echo "Note: Cognito Confirm Email"
YourIdToken=$(aws cognito-idp initiate-auth --auth-flow USER_PASSWORD_AUTH --client-id $YourUserPoolAppClientId --auth-parameters USERNAME=$USERNAME,PASSWORD=Passw0rd! | jq -r '.AuthenticationResult.IdToken')
echo "YourIdToken: ${YourIdToken}"

curl -X POST \
 $YourPaymentMethodApiURL/order     \
-H "Authorization: Bearer $YourIdToken"    \
-H 'Content-Type: application/json' \
-d '{
"CustomerOrder": "123456789",
"CustomerName": "Amazon Web Services",
"CreditCard": "0000-0000-0000-0000",
"Address": "Unicorn Gym - APJ 2021"
}'

curl -X POST \
 $YourPaymentMethodApiURL/paybill \
-H "Authorization: Bearer $YourIdToken" \
-H 'Content-Type: application/json' \
-d '{
"CustomerOrder": "123456789"
}'

## Reference FYI ONLY

# YOUR_COGNITO_REGION=ap-southeast-2
# YOUR_COGNITO_APP_CLIENT_ID=1mmmmubo6107id5fj5t6bpvvjl
# YOUR_EMAIL=nnthanh101@gmail.com
# YOUR_PASSWORD=@unicorn-gym-m2m

# echo "Sign up new cognito User"
# echo aws cognito-idp sign-up \--region $YOUR_COGNITO_REGION \--client-id $YOUR_COGNITO_APP_CLIENT_ID \--username $YOUR_EMAIL \--password $YOUR_PASSWORD

# echo "Verify User"
# echo aws cognito-idp confirm-sign-up \--client-id $YOUR_COGNITO_APP_CLIENT_ID \--username $YOUR_EMAIL \--confirmation-code CONFIRMATION_CODE_IN_EMAIL

# echo "Get Id Token"
# echo aws cognito-idp initiate-auth --auth-flow USER_PASSWORD_AUTH --client-id $YOUR_COGNITO_APP_CLIENT_ID --auth-parameters USERNAME=$YOUR_EMAIL,PASSWORD=$YOUR_PASSWORD
