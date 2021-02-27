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
