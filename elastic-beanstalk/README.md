# [Pattern - E301 PaaS] Deploy, Scale and Modernize Web Applications

This pattern provides guidance for **Enterprise Customers migrating on-premises `Tomcat`/`SpringBoot`/`.NET` applications to AWS Cloud using AWS Elastic Beanstalk**.  Elastic Beanstalk makes it  easier for developers to quickly deploy and manage applications on AWS. Developers simply upload their application, and Elastic Beanstalk automatically handles the deployment details of capacity provisioning, load balancing, auto-scaling, and application health monitoring. 

> **E301**: great customer experience: **3 seconds** to reach any feature; **zero** downtime; and **one hour** to deploy code changes into production.


### ElasticBeanstalk Architecture:

![Architecture](https://github.com/nnthanh101/modernapps/raw/main/README/images/elastic-beanstalk-architecture.png)

### CI/CD Pipeline

The steps required to add Continuous Integration and Continuous  Delivery (CI/CD) to an existing AWS Elastic Beanstalk application.

![CI/CD Pipeline](https://github.com/nnthanh101/modernapps/raw/main/README/images/elastic-beanstalk-cicd.png)

* [ ] **AWS CodeCommit** to create a Git repository, clone the repository to the local drive, and then add and push all required source files.
* [ ]  **AWS CodeBuild** to create a project and configure the environment required to compile and build the source code. Next, you specify all actions required by **AWS CodeBuild** using the `buildspec.yml`.
* [ ] **AWS CodePipeline**: automate release pipelines for fast and reliable application and infrastructure updates. 

> Any code changes that are pushed to **AWS CodeCommit** trigger an event in **AWS CodePipeline**, which in turn triggers **AWS CodeBuild** to start the build and the deployment.

### Technology Stack

* [ ] Amazon VPC
    * [ ] VPC CIDR: 
    * [ ] Subnets: 2 Subnets
    * [ ] Route Table
    * [ ] Security Groups
* [ ] *DNS --> Route53*
* [ ] *SSL --> ACM*
* [ ] [Amazon EC2 Auto Scaling Group](https://docs.aws.amazon.com/autoscaling/ec2/userguide/AutoScalingGroup.html): Customer can set up its [scaling policy](https://docs.aws.amazon.com/autoscaling/ec2/userguide/scaling_plan.html) based on either **Amazon CloudWatch** or customized application metrics
    * [ ] Java Application is deployed into Apache Tomcat Application Server
    * [ ] *SpringBoot + DynamoDB*
    * [ ] .NET Applicvation
* [ ] Backend Database: [Amazon RDS Multi-AZ](https://aws.amazon.com/rds/details/multi-az/) deployment and choose a database engine type:
    * [ ] MySQL/MariaDB
    * [ ] *Postgres*
    * [ ] MS.SQL / *Oracle*


### Project Directory

```
/modernapps/elastic-beanstalk
├── README.md
├── bin
|  └── elastic-beanstalk.ts
├── cdk.json
├── jest.config.js
├── lib
|  └── elastic-beanstalk-stack.ts
├── package.json
├── test
|  └── elastic-beanstalk.test.ts
└── tsconfig.json
```

### Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template


### [Manual] Deploy ElasticBeanstak Step-by-Step

|Epic |Epic Title|Story |Story Name|Story Description|
|:----|:----|:----|:----|:----|
|1|VPC Setup|1|Create a VPC|Create a VPC with required info|
|1|VPC Setup|2|Create Subnets|Create Subnets within the VPC. Required minimum of 2 Subnets|
|1|VPC Setup|3|Create a Route Table|Create a Route Table as per our requirements|
|2|Elastic Beanstalk|1|Go to Elastic Beanstalk dashboard|Open the Elastic Beanstalk Dashboard|
|2|Elastic Beanstalk|2|Create New application|Select Web Server environment|
|2|Elastic Beanstalk|3|Select platform|Select the Preconfigured platform as `Tomcat`|
|2|Elastic Beanstalk|4|Create S3 bucket|Create S3 bucket and upload the war file to it|
|2|Elastic Beanstalk|5|Upload the code|Provide the S3 bucket file URL or Zip file from local system files|
|2|Elastic Beanstalk|6|Configure Environment Type|In Configuration Capacity settings, Select Single instance or Load Balancer|
|2|Elastic Beanstalk|7|Load Balancer Configuration|If you are selecting load balancer, then configure the AZs|
|2|Elastic Beanstalk|8|Create an IAM role|Create an IAM role with aws-elasticbeanstalk-ec2-role or elastic beanstalk will create automatically|
|2|Elastic Beanstalk|9|Configure IAM|In Configuration Security settings, Select the above created IAM role|
|2|Elastic Beanstalk|10|Configure Key pair|In Configuration Security settings, If you have existing key pair, use it or create new EC2 key pair|
|2|Elastic Beanstalk|11|Configure Cloud Watch|In Configuration Monitoring, Configure cloud watch settings|
|2|Elastic Beanstalk|12| Configure VPC|In Configuration Security settings, Select the above created VPC|
|2|Elastic Beanstalk|13|Create environment|Click on Create Environment|
|2|Elastic Beanstalk|14|Test the Application|Once environment is created, a application URL will be provided, where we can test the application|
|2|Elastic Beanstalk|15|Change DNS |Apply DNS changes in Route53|
