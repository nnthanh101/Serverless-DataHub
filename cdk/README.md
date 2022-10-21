# Create a Serverless Application using the AWS CDK

This is the CDK source code for deploying a Serverless Application on AWS, which includes the infrastructure for the ReactJS Frontend, NodeJS Backend, Cognito Authentication, CodeBuild/CodePipeline DevOps CI/CD, and IAM/KMS/CloudWatch Operation.

> ☑️ TODO: To deploy the project properly, please refer to the [Installing Serverless Application](docs/installation.md).

```
git clone https://github.com/OceanSoftIO/Serverless

cd Serverless/cdk
./deploy.sh
```

## Part 1. Create an AWS CDK app `cdk`

<details>
<summary>🚦 Prerequisites</summary>
  
  ~~npm install -g aws-cdk@1.177.0~~
  
  npm install -g aws-cdk

  # npm install -g npm@8.19.2
</details>

```
CDK_APP_ID=cdk
mkdir $CDK_APP_ID && cd $CDK_APP_ID

echo "Step 1. Create New CDK Project"
cdk init app --language typescript
```

<details><summary>⚠️ ~~CDK v1~~ 👇</summary>

```
echo "Step 2. package.json: Frontend, Backend, Authentication, DevOps CI/CD, and Operation"

echo "1. Hosting of React application code on S3 || As a CDN, CloudFront Distribution is placed in front of the S3 bucket to provide caching and HTTPS services."
npm install --save @aws-cdk/aws-s3 @aws-cdk/aws-s3-deployment @aws-cdk/aws-cloudfront

echo "2 & 3 & 4. Backend: API-Gateway, Lambda, DynamoDB"
npm install --save @aws-cdk/aws-apigateway @aws-cdk/aws-lambda @aws-cdk/aws-lambda-event-sources @aws-cdk/aws-dynamodb

echo "6. Authentication: Cognito"
npm install --save @aws-cdk/aws-cognito

echo "7. DevOps CI/CD"
npm install --save @aws-cdk/aws-codecommit @aws-cdk/aws-codebuild @aws-cdk/aws-codepipeline @aws-cdk/aws-codepipeline-actions @aws-cdk/aws-codestarnotifications 

echo "8. Operation: IAM, KMS, CloudWatch, CloudWatch Logs"
npm install --save @aws-cdk/aws-iam @aws-cdk/aws-kms @aws-cdk/aws-cloudwatch @aws-cdk/aws-cloudwatch-actions @aws-cdk/aws-logs
```

</details>

<details>
<summary>✍️ Useful commands</summary>
  
> The `cdk.json` file tells the CDK Toolkit how to execute your app.

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

</details>

## 💎 Part 2. Micro-Frontend: [] `cdk-spa` CDK Construct for deploying `frontend` SPA Website 🚀

<details>
<summary>✍️ Useful commands</summary>
  
> 💎 This **CDK TypeScript Construct Library** `cdk-spa` includes a construct `CdkSpa` and an interface `CdkSpaProps` to make deploying a Single Page Application (SPA) Website ([React.js](https://reactjs.org/docs/create-a-new-react-app.html) / [Vue.js](https://vuejs.org/) / [Angular](https://angular.io/)) to **AWS S3** behind **CloudFront CDN**, **Route53 DNS**, **AWS Certificate Manager SSL** as easy as 5 lines of code.

```
```

</details>

