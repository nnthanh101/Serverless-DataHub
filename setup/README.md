# [Cloud9] Dev/Test Environment


* [x] Create an AWS Cloud9 IDE that uses Amazon EBS volumes with default encryption: default encryption turned on for EBS volumes.
  * [x] Choose **EC2 Dashboard**, and then choose **EBS encryption** in **Account attributes**. Copy and record the value in Default encryption key.
  * [ ] ~~Provide access to the AWS KMS key: Open the AWS KMS console, and then choose Customer managed keys.~~

* [ ] EC2 >> Volumes: 60GB `gp3`

* [x] Permissions to create IAM roles and policies for the account. 
  * [x] The IAM role for the user must include the `AWSCloud9Administrator` policy. The `AWSServiceRoleForAmazonEKS` and `eksNodeRoles` roles must also be created because they are required to create an Amazon EKS cluster.
