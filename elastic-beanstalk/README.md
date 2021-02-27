# [Pattern - E301 PaaS] Deploy, Scale and Modernize Web Applications

This pattern provides guidance for **Enterprise Customers migrating on-premises `Tomcat`/`SpringBoot`/`.NET` applications to AWS Cloud using AWS Elastic Beanstalk**.  Elastic Beanstalk makes it  easier for developers to quickly deploy and manage applications on AWS. Developers simply upload their application, and Elastic Beanstalk automatically handles the deployment details of capacity provisioning, load balancing, auto-scaling, and application health monitoring. 

> **E301**: great customer experience: **3 seconds** to reach any feature; **zero** downtime; and **one hour** to deploy code changes into production.


### 1. ElasticBeanstalk Architecture:

![Architecture](https://github.com/nnthanh101/modernapps/raw/main/README/images/elastic-beanstalk-architecture.png)

**AWS Elastic Beanstalk** is an even easier way for you to quickly deploy and manage applications in the AWS cloud, and deliver the same highly reliable, scalable, and cost-effective infrastructure that hundreds of thousands of businesses depend on today.

You simply upload your application and Elastic Beanstalk automatically handles the deployment details of capacity provisioning, load balancing, auto-scaling and application health monitoring. Here are some of the benefits of using Elastic Beanstalk:

* Automatically handles capacity provisioning, load balancing, and application health monitoring.
* Automatically scales your application based on your application’s specific needs using easily adjustable Auto Scaling settings.
* Keeps the underlying platform running your application up-to-date with the latest patches and updates.
* Provides the freedom to select the AWS resources, such as an Amazon EC2 instance type, that are optimal for your application.

> [Manual Deployment - step by step guidance](./README.Manual.md)

### 2. CI/CD Pipeline

The steps required to add Continuous Integration and Continuous  Delivery (CI/CD) to an existing AWS Elastic Beanstalk application.

![CI/CD Pipeline](https://github.com/nnthanh101/modernapps/raw/main/README/images/elastic-beanstalk-cicd.png)

* [ ] **AWS CodeCommit** to create a Git repository, clone the repository to the local drive, and then add and push all required source files.
* [ ]  **AWS CodeBuild** to create a project and configure the environment required to compile and build the source code. Next, you specify all actions required by **AWS CodeBuild** using the `buildspec.yml`.
* [ ] **AWS CodePipeline**: automate release pipelines for fast and reliable application and infrastructure updates. 

> Any code changes that are pushed to **AWS CodeCommit** trigger an event in **AWS CodePipeline**, which in turn triggers **AWS CodeBuild** to start the build and the deployment.


### 3. Elastic Beanstalk .Net Application Migration

* [x] [Business] [A .NET application](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/applications-sourcebundle.html#using-features.deployment.source.dotnet) deployment/migration, adhering to best practice of performance, high availability, security, and monitoring.
* [x] A .NET running on AWS deployed via **Elastic Beanstalk**, and integrate with the managed services.
    * [ ] Environment >> Web server environment >> `IIS`
    * [ ] Configuration
* [x] **Amazon RDS for SQL Server**, server managed fully by AWS, customer is responsible for DB optimization.
    * [ ] SQL Server Homogeneous Migration-EC2
    * [ ] SQL Server Homogeneous Migration-RDS
* [ ] Hybrid Scenarios: Inter-operability between On-prem and RDS SQL-Server in the cloud.
* [ ] Active Directory
* [ ] DNS

### 4. Technology Stack

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


### 5.2. CDK >> Project Directory

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

### 5.2. CDK >> Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
 