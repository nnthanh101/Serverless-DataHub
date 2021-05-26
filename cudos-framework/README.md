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

### 1.1 Setup the Cost and Usage report on the main account

Required:
* terraform is installed
* run the following script
```
./setup_cur.sh -p <AWS profile> -i <the AWS account ID of the CUDOS lab> -r <AWS region> 
```
