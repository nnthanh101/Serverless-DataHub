# Creating an AWS Fargate service using the AWS CDK

# SpringBoot on AWS 

## Step 1: Deploy SpringBoot Docker to ECR or DockerHub

`./deploy-docker-ecr.sh`

* [ ] `Dockerfile`: 
    * [ ] maven:3.5.2-jdk-8-alpine vs. `openjdk:8-jdk-alpine`
    * [ ] Latest version?

* [ ] Versioning: TravelBuddy-0.0.1 --> TravelBuddy-xxx: 
    
    if [ $(uname -s) == 'Darwin' ] ; then
        sed -i '' "s/_APP_VERSION_/${APP_VERSION}/g" Dockerfile.template > Dockerfile
    else
        sed -i "s/_APP_VERSION_/${APP_VERSION}/g"    Dockerfile.template >  Dockerfile

## Step 2:  

`cdk deploy EcsFargateStack`

### 2.1. VPC: `vpc.ts`

#### 2.1.1. Create a NEW VPC: simplified VPC (hosting Frontend Application in the Public Subnet), 3-Tier VPC, ...

VPC_TYPE: Standard-VPC, 3Tier-VPC, Frontend-VPC

* [ ] MyVpc: --> **Management VPC**
* [ ] Production-VPC: `blueprint/lib/aws-vpc.ts` --> **Development VPC** & **ProductionVPC**
* [ ] Simplified-VPC: 1 Public-Subnet + 0 NAT-Gateway --> **ecs-pipeline** >> Frontend: React, Vue, Angular


#### 2.1.2. Attach the existing VPC

~aws-infrastructure-stack.ts~ --> 

* [ ] CreateVpc(this): 2.1.1
* [ ] getVpc(this): 2.1.2 from VPC-ID or VPC-Name

## 3. ElasticBeanstalk

mkdir elasticbeanstalk
cd elasticbeanstalk
cdk init --language typescript

===

This CDK Package deploy a SpringBoot application using CDK (Cloud Development Kit).

* [ ] Publish Spring Boot Docker Images to ECR using Maven Plugin.docx: .sh --> **TravelBuddy** + ECR/Docker 
    * [ ] **SpringBoot** >> `springboot-aws/Dockerfile` >> ECR >> `Code Pipeline` https://start.spring.io/starter.zip --> **TravelBuddy**
    * [ ] .docx --> .sh

* [ ] DynamoDB: CRUD `/student` --> CRUD `/TravelBuddy` 
    * [ ] Student_Table --> TravelBuddy Table
    * [ ] studentId     --> TravelBuddy xxxID
    * [ ] student, student.addMethod - `api_gateway.ts`

* [ ] Configurable variable using dotenv `.env`

* [ ] Support both: `NLB` layer-4  --> `ALB` layer-7 

* [ ] Postman: nice to have 

* [ ] https://github.com/nnthanh101/cdk/blob/master/aws-infrastructure/lib/aws-infrastructure-stack.ts
 
## Project Structure

* The SpringBoot application is present inside `springboot-aws` folder. You can customize the SpringBoot application by adding more operations or updating/changing the buisness logic.

* All the configurations are picked from `configurations/config.ts` and is supplied to the code for creating infrastructure. Please change the configuration according to your business requirements before deploying.  

## References

* [Creating an AWS Fargate service using the AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/ecs_example.html)

## Useful commands

The `cdk.json` file tells the CDK Toolkit how to execute your app.

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
