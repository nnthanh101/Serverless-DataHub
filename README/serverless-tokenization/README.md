# Tokenization and Encryption of Sensitive Data

Data Masking solution that ingests data and identifies PII/PCI data and returns masked data back to reduce the exposure of sensitive information, using Serverless Tokenization, SAM and Lambda Layers.

Please refer to [Building a **serverless tokenization solution** to **mask sensitive data**](https://aws.amazon.com/blogs/compute/building-a-serverless-tokenization-solution-to-mask-sensitive-data/), for more info.
 
## Prerequisites 
 
1. [ ] [AWS Account](https://aws.amazon.com/free)
2. [ ] [AWS Cloud9-IDE](https://docs.aws.amazon.com/cloud9/latest/user-guide/tutorial-create-environment.html) for writing, running and debugging code on the cloud: `./cloud9.sh`

```
git clone https://github.com/nnthanh101/serverless-tokenization
cd serverless-tokenization

./deploy.sh
```

## Architecture

![Architecture](README/architecture.png)

In this module, we will learn on how to use [Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html) to develop Serverless Tokenization solution. Lambda Layers package dependencies and custom runtime which can be imported by Lambda Function. This module is designed to enable development of applications by loosely coupling security from the application so that only security team has access to sensitive data. Application team can develop applications which can import the Lambda Layer provided by security team. This eases the development and reuse of code across teams. 

### Tokenization vs Encryption 

Tokenization is an alternative to encryption that helps to protect certain parts of the data that has high sensitivity or a specific regulatory compliance requirement such as PCI. Separating the sensitive data into its own dedicated, secured data store and using tokens in its place helps you avoid the potential cost and complexity of end-to-end encryption. It also allows you to reduce risk with temporary, one-time-use tokens. [More Info](https://aws.amazon.com/blogs/database/best-practices-for-securing-sensitive-data-in-aws-data-stores/)

### Work-around Solution

We will use [AWS Key Management Service](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html) to create and control the encryption keys. We will then create [customer managed master  key](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#master_keys) which will be used by [DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) client encryption library to encrypt the plain text. We will also use CloudFormation template to create DynamoDB Table and Lambda Layer which contains  encryption logic and dependent libraries. This Lambda Layer will be imported into Lambda Function which handles the request and response for our application. The application gets the sensitive data (for example, credit card information) from the end user, passes it to Lambda function that invokes the imported layer to exchange sensitive data with unique token. This token is stored in application database (DynamoDB) and the sensitive data is stored by Lambda Layer in separate database (DynamoDB) which can be managed by security team. When required, the encrypted data can be decrypted by providing the token stored in the application database.

* [x] Serverless Tokenization
* [ ] [Maskopy Solution to Copy and Obfuscate Production Data to Target Environments in AWS](https://github.com/FINRAOS/maskopy)
 
This repository has the following directories:
- `src/KMS-Key` - This folder contains the CloudFormation template to create customer managed master key.
- `src/tokenizer`  - This folder contains: 
  * CloudFormation template for creating Lambda Layer and DynamoDB table
  * script to [compile and install required dependencies for Lambda layer](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html#configuration-layers-path)
  * code for encrypting and decrypting provided sensitive data using [DynamoDB encryption client library](https://docs.aws.amazon.com/dynamodb-encryption-client/latest/devguide/what-is-ddb-encrypt.html).
- `src/M2M-App` - This folder contains: 
  * CloudFormation template to create DynamoDB table, [Lambda Function](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html), APIs in [API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html), [Cognito User Pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html) and [Cognito Application Client](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html). 
  * code for *simple ordering application* 

### AWS services used in this module
 1. [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
 2. [Amazon API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)
 3. [Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
 4. [Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
 5. [AWS Cloud9](https://docs.aws.amazon.com/cloud9/latest/user-guide/welcome.html)
 6. [AWS Key Management Service](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html)
 7. [AWS VPC Endpoints](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-endpoints.html)


## Step 1: Create Customer Managed KMS Key `KMS-Key`

* [x] 1.1. Build the SAM template (template.yaml)
  `sam build --use-container`
* [x] 1.2. Package the code and push to S3 Bucket. 
  `sam package --s3-bucket ${S3_BUCKET} --output-template-file packaged.yaml`
* [x] 1.3. Packaged.yaml (created in the above step) will be used to deploy the code and resources to AWS. 
  `sam deploy --template-file ./packaged.yaml --stack-name kms-stack --capabilities CAPABILITY_IAM`
* [x] Get the output variables of the stack 
  `aws cloudformation describe-stacks --stack-name ${STACK_NAME}`

Once done, the output will look like

```json
"Outputs": [
                {
                    "Description": "ARN for KMS-CMK Key created", 
                    "OutputKey": "KMSKeyID", 
                    "OutputValue": "*********"
                }
            ]
```

Note the *OutputValue* of  *OutputKey* `KMSKeyID` from the output for later steps.

The CloudFormation stack created Customer Managed KMS key and gave permissions to the root user to access the key. This master encryption key will be used to generate data encryption keys for encrypting items later in the module. 

## Step 2. Create Lambda Layer for String Tokenization & Encrypted Data Store

* [x] **Lambda Layers** provides a mechanism to externally package dependencies that can be shared across multiple Lambda functions. 

* [ ] SAM local development

```
# export SAM_PROJECT=tokenizer
export SAM_PROJECT=M2M-App

sam init                  \
    --name ${SAM_PROJECT} \
    --package-type Zip    \
    --runtime python3.7   \
    --app-template hello-world 
```

* **Step 2.1** Run the script to compile and install the dependent libraries in *dynamodb-client/python/* directory. 
For Lambda Function, we can use `sam build --use container`; but for **Lambda Layer**, we need to download the Lambda docker image to compile dependent libraries for Amazon Linux Image. [More details on this](https://github.com/pyca/cryptography/issues/3051?source=post_page-----f3e228470659----------------------)
  ```
  ./get_AMI_packages_cryptography.sh
  ```

* **Step 2.2** Build the SAM template (template.yaml)
  ```
  sam build --use-container
  ```

* **Step 2.3** Copy the python files `ddb_encrypt_item.py` and `hash_gen.py` to *dynamodb-client/python/*. This is required since Lambda Layer expects files to be in a specific directory to be used by Lambda function. [More details on this](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html#configuration-layers-path)

  ```
  cp ddb_encrypt_item.py dynamodb-client/python/
  cp hash_gen.py dynamodb-client/python/
  ```

  `ddb_encrypt_item.py` – This file contains the logic to encrypt and decrypt the plain text and store encrypted information in DynamoDB table.

  `hash_gen.py` - This file contains the logic to create UUID tokens for strings which will be provided to the end application in exchange for sensitive data, for example, credit card. 

* **Step 2.4** Package the code and push to S3 Bucket. Replace `unique-s3-bucket-name` with the value identified in Step 2

  ```bash
  sam package --s3-bucket ${S3_BUCKET} --output-template-file packaged.yaml
  ```

* **Step 2.5** Deploy SAM (CloudFormation stack) using the below code to create resources and deploy your code. Wait for the stack creation to complete. 

  ```bash
  export STACK_NAME2=Tokenizer
  
  sam deploy --stack-name ${STACK_NAME2}                \
           --template-file ./packaged.yaml              \
           --region ${AWS_REGION} --confirm-changeset --no-fail-on-empty-changeset \
           --capabilities CAPABILITY_IAM                \
           --s3-bucket ${S3_BUCKET} --s3-prefix backend \
           --config-file samconfig.toml                 \
           --no-confirm-changeset                       \
           --tags                                       \
              Project=${PROJECT_ID}
  ```

**Step 5.8** Get the output variables of the stack

  ```bash
  aws cloudformation describe-stacks --stack-name tokenizer-stack
  ```

The output will look like 

```
------------------------------------------------------------
Outputs
------------------------------------------------------------
Key           LayerVersionArn
Description   ARN for the published Layer version
Value         arn:aws:lambda:ap-southeast-1:701571471198:layer:TokenizeData:1    

Key           DynamoDBArn   
Description   ARN for DynamoDB Table
Value         arn:aws:dynamodb:ap-southeast-1:701571471198:table/CreditCardTokenizerTable                                       
------------------------------------------------------------
```

Note the *OutputValue* of `LayerVersionArn` and `DynamoDBArn` from the output for later steps.

Here, in **Step 2.5**, the CloudFormation stack created DynamoDB table to store encrypted data as well as Lamda Layer for encrypting/decrypting the sensitive data and generating unique tokens for sensitive data.

## Step 3: Create Serverless Application 

Let’s build the Serveless application which contains **API-Gateway** for API management, **Lambda** function for application code, **Lambda Layer** to import reusable code that we created earlier and **Cognito** User Pool for API authentication

* [x] 3.1. Build SAM template. Replace the parameters with previously noted values for `LayerVersionArn` (Step 2.5)
  ```bash
  sam build --use-container --parameter-overrides layerarn=${YourLayervErsionArn}
  ```

* [x] 3.2. Package the code and push to S3 Bucket. 
  ```bash
  sam package --s3-bucket ${S3_BUCKET} --output-template-file packaged.yaml
  ```

* [x] 3.3. Deploy code and resources to AWS using the packaged.yaml. 
  ```
  sam deploy  --stack-name ${STACK_NAME3}                \
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
  ```

* [x] 3.4. Get the output variables of the stack
  * [x] `aws cloudformation describe-stacks --stack-name 
  * [x] `CustomerOrderFunction`:  "*******************:app-stack-CustomerOrderFunction*******"
  * [x] `PaymentMethodApiURL`: "https://*****************/dev/"
  * [x] `AccountId`: "********"
  * [x] `UserPoolAppClientId`: "********************"
  * [x] `UserPoolArn`: "arn:aws:cognito-idp:**:**:userpool/********"
  * [x] `LambdaExecutionRole`: "******app-stack-LambdaExecutionRole-****"
  
Note the *OutputValue* of *OutputKey* `LambdaExecutionRole`, `PaymentMethodApiURL` , `AccountId` , `UserPoolAppClientId` and `Region` from the output for later steps.

* [ ] 3.5. Update KMS permissions to allow Lambda Function to generate data keys for encryption. This will ensure you are adhering to least privilege principles. You will need the `LambdaExecutionRole` and `AccountId`, and the KMS ARN.

```bash
export YourKMSArn="<KMSArn>"
export ROOTPrincipal="arn:aws:iam::<AccountId>:root"
export LambdaExecutionRole="<LambdaExecutionRole>"
```

```bash
POLICY=$(cat << EOF
{ 
    "Version": "2012-10-17", 
    "Id": "key-default-1", 
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
            "Principal": {"AWS": ["$LambdaExecutionRole"]}, 
            "Action": ["kms:Decrypt", "kms:Encrypt", "kms:GenerateDataKey", "kms:GenerateDataKeyWithoutPlaintext"], 
            "Resource": "$YourKMSArn" 
        } 
    ] 
}
EOF
); \
aws kms put-key-policy --key-id "$YourKMSArn" --policy-name default --policy "$POLICY"
```

* [ ] 3.6. Create a Cognito user with the following code. Replace `Region` and `UserPoolAppClientId` with values noted in  the previous step. Also, provide a **valid** email in place of `user-email` and `password`. Note: you should have access to the email provided to get the verification code. The password should be minimum 6 characters long, should contain at least one lower case and one upper case character.  

```bash
aws cognito-idp sign-up --region <Region> --client-id <UserPoolAppClientId> --username <user-email> --password <password>
```
The output will look like 

```json
{
    "UserConfirmed": false, 
    "UserSub": "************", 
    "CodeDeliveryDetails": {
        "AttributeName": "email", 
        "Destination": "<user-email>", 
        "DeliveryMedium": "EMAIL"
    }
}
```

* [ ] 3.7. Lets verify the Cognito user we just created  

**Note** – Replace `CONFIRMATION_CODE_IN_EMAIL` with the verification code recieved in the email provided in the previous step. 

```bash
aws cognito-idp confirm-sign-up --client-id <UserPoolAppClientId>  --username <user-email> --confirmation-code <CONFIRMATION_CODE_IN_EMAIL>
```

**Note** – There will be no output for this command.

* [ ] 3.8. Generate ID token for API authentication. Replace `UserPoolAppClientId` with value noted in step 6.5. Also replace `user-email` and `password` with the same values provided in step 6.6. 

```bash
aws cognito-idp initiate-auth --auth-flow USER_PASSWORD_AUTH --client-id <UserPoolAppClientId> --auth-parameters USERNAME=<user-email>,PASSWORD=<password>
```

The output will look like 

```json 
{
    "AuthenticationResult": {
        "ExpiresIn": 3600, 
        "IdToken": "*********", 
        "RefreshToken": "******", 
        "TokenType": "Bearer", 
        "AccessToken": "********"
    }, 
    "ChallengeParameters": {}
}
```
Note the value of `IdToken` from the output for next steps.

Now, we will invoke APIs to test the application. There are two APIs - 
1. **order** - The first API i.e. *order* is to create the customer order, generate the token for credit card number (using Lambda Layer) and store encrypted credit card number in another DynamoDB table called `CreditCardTokenizerTable` (as specified in the Lambda Layer) and finally store the customer information along with the credit card token in DynamoDB table called `CustomerOrderTable`. 
2. **paybill** - The second API i.e. *paybill* takes the `CustomerOrder` number and fetches credit card token from  `CustomerOrderTable` and calls decrypt method in Lambda Layer to get the deciphered credit card number. 

* [ ] 3.9. Let's call */order* API to create the order with the following code. Replace the value of `PaymentMethodApiURL` (Step 6.5) and `IdToken` (Step 6.8) with the values identified in the previous steps. 

```bash
curl -X POST \
 <PaymentMethodApiURL>/order \
-H 'Authorization: <IdToken>' \
-H 'Content-Type: application/json' \
-d '{
"CustomerOrder": "123456789",
"CustomerName": "Amazon Web Services",
"CreditCard": "0000-0000-0000-0000",
"Address": "Reinvent2019, Las Vegas, USA"
}'
```

The output will look like 

```json
{"message": "Order Created Successfully", "CreditCardToken": "*************"}
````

* [ ] 3.10. Let's call */paybill* API to pay the bill using the previously provided information. Replace the value of `PaymentMethodApiURL` (Step 6.5) and `IdToken` (Step 6.8) with the values identified in the previous steps. 

```bash
curl -X POST \
 <PaymentMethodApiURL>/paybill \
-H 'Authorization: <IdToken>' \
-H 'Content-Type: application/json' \
-d '{
"CustomerOrder": "123456789"
}'
```

The output will look like 

```json
{"message": "Payment Submitted Successfully", "CreditCard Charged": "0000-0000-0000-0000"}
````

Application has created the customer order with required details and saved the plain text information (generated credit card token) in DynamoDB table called `CustomerOrdeTable` and encrypted `CreditCard` information is stored in another DynamoDB table called `CreditCardTokenizerTable`. Now, check the values in both the tables to see what items are stored. 

* [ ] 3.11. Get the items stored in `CustomerOrdeTable`

```bash
aws dynamodb get-item --table-name CustomerOrderTable --key '{ "CustomerOrder" : { "S": "123456789" }  }'
```

The output will look like 

```json
{
    "Item": {
        "CustomerOrder": {
            "S": "123456789"
        }, 
        "Address": {
            "S": "Reinvent2019, Las Vegas, USA"
        }, 
        "CustomerName": {
            "S": "Amazon Web Services"
        }, 
        "CreditCardToken": {
            "S": "**********"
        }
    }
}
```

Note the value of `CreditCardToken`. It will be the generated token value and not actual `CreditCard` provided by the end user.

**Step 6.13** Get the items stored in `CreditCardTokenizerTable`. Replace the value of `CreditCardToken` (Step 6.11) and `AccountId` (Step 6.5) with previously identified values.

```bash
aws dynamodb get-item --table-name CreditCardTokenizerTable --key '{ "Hash_Key" : { "S": "<CreditCardToken>" }, "Account_Id" : { "S" : "<AccountId>" }  }'
```

The output will look like 

```json
{
    "Item": {
        "*amzn-ddb-map-sig*": {
            "B": "**************"
        }, 
        "*amzn-ddb-map-desc*": {
            "B": "**************"
        }, 
        "Hash_Key": {
            "S": "***************"
        }, 
        "Account_Id": {
            "S": "***************"
        }, 
        "CandidateString": {
            "B": "*****************"
        }
    }

```

Note the value of `CandidateString`. It will be the encrypted value of `CreditCard` instead of the plain text. 

Here, in step 6, the CloudFormation stack created DynamoDB table for storing customer order information, Lambda function for handling request and response, APIs for creating order and paying bill and Cognito user pool for API authentication. In order to verify application functionality, we created a Cognito user to call the APIs and validated plain text (generated token) in `CustomerOrderTable` and encrypted credit card information in `CreditCardTokenizerTable` DynamoDB tables.  

## Step47: Clean up and delete the resources

Delete the three CloudFormation stacks created (Steps 4, 5 and 6) and S3 bucket. Replace the value of `unique-s3-bucket-name` with the name of the bucket created earlier in Step 2.

```bash
aws cloudformation delete-stack --stack-name app-stack

aws cloudformation delete-stack --stack-name tokenizer-stack

aws cloudformation delete-stack --stack-name kms-stack

aws s3 rb s3://<unique-s3-bucket-name> --force
```