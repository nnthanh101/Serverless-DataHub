# CUDOS

* [ ] 1. Prerequisites: `prerequisites.md` >> `prerequisites.sh` (similar to https://github.com/nnthanh101/DevAx/blob/main/cloud9.sh)
  * [x] 1.1. An AWS Account with Cost Optimization team permissions
  * [x] 1.2. [A Cost and Usage Report (CUR)](https://wellarchitectedlabs.com/cost/100_labs/100_1_aws_account_setup/3_cur/): S3 & Policy, Region-Singapore, Daily, Athena/Parquet
  * [x] 1.3. [An Amazon Enterprise Edition QuickSight Account](): Region-Singapore, Trial/Standard/Enterprise, Pricing - Uses/Readers?
  * [ ] 1.4. Amazon Athena and QuickSight have been setup
  * [ ] 1.5. [Cost and Usage Analysis](https://wellarchitectedlabs.com/cost/200_labs/200_4_cost_and_usage_analysis/): CUDOS_CUR / Partitioned, *.sql, Tagging and Cost Attribution
  * [ ] 1.6. [Cost and Usage Visualization](https://wellarchitectedlabs.com/cost/200_labs/200_5_cost_visualization/): Export/Import QuickSights

* [ ] 2.1. Athena Views: `*.sql`
* [ ] 2.2. Dataset
* [ ] 2.3. QuickSight Dashboard: `quicksights.sh`
* [ ] [Share/Distribute Dashboard](https://wellarchitectedlabs.com/cost/200_labs/200_enterprise_dashboards/4_distribute_dashboards/)
* [ ] 2.5. [Tear Down](https://wellarchitectedlabs.com/cost/200_labs/200_enterprise_dashboards/4_distribute_dashboards/)

## 1. Prerequisites

* [ ] AWS Cli is installed 
* [ ] Terraform Cli is installed
* [ ] Two AWS accounts:
  * The main account is the one generate the cost and usage reports
  * The governance account is the one own the QuickSight dashboard

## 2. Enable CUR data

Run this command with the AWS profile that have the permission to configure the cost and usage reports.
The command create a S3 bucket and set the appropriate permission to the governance account.

```shell
./setup_cur.sh -i <the AWS account ID of the governance acocunt> -p <AWS main account profile> -r <AWS region for S3 bucket> 
```

The only required arguments are `-i`, the rest are optional:
* `-p` default to the `default` AWS profile.
* `-r` default to `ap-southeast-1`.

Output are written to `cur.output.env`

### Verify the outcome

```shell
source cur.output.env && aws s3api list-objects --bucket $CUDOS_CUR_BUCKET
```

We should see some files listed.


## 3. Build the CUDOS dashboard

### 1.1 Setup the Cost and Usage report on the main account

Required:
* terraform is installed

Run the following script
```shell
./setup_cur.sh -i <the AWS account ID of the CUDOS lab> -p <AWS profile> -r <AWS region> 
```

### 1.2 Setup Glue database and Athena views

Required:
* terraform is installed
* the S3 bucket and prefix of the CUR bucket created in the previous step


Run the following script
```shell
./setup_data.sh -b <CUR S3 bucket name> -s <CUR S3 prefix> -p <AWS profile> -r <AWS region>
```


## Demo

### Preparation

* 2 accounts
* Quicksight configuration with Enterprise plan
* configuration file (`.env` or `.ts`)
[ ] The report generation frequency

### Setup

I) Data ingestion
* Set up to generate S3 and provide access to governance account (see 1.1)
* Verify after running: using cli, scripts or GUI

* Extension: not only for cost but also any data related tasks
* Can use AWS CFN cli to run the generated CloudFormation stack from the CUR bucket

II) Data preparation
* Create Glue crawler to prepare data from S3 bucket(s) to the Athena table(s) 
  
  Note: 
  * https://github.com/aws-samples/aws-usage-queries/blob/main/lib/aws-usage-queries.ts#L242
  * Glue crawler run every day
  * If we have Glue Dev Endpoint, we must delete it when not in-use to prevent unwanted charges.
  
* Configure Athena results bucket for the Athena workgroup

III) Run CUDOS
* Have proper .gitignore file
* Use git sub-modules for code reuse
* Check if we have the ListAccounts permisions on the Organization then run the `map` step

* Update the Cost intelligence dashboard to have all 4 tabs content in one screen. 
  Ref: https://wellarchitectedlabs.com/cost/200_labs/200_enterprise_dashboards/
