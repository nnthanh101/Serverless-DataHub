terraform {
  backend "s3" {
    key    = "terraform/environment/dev/managed-account.tfstate"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region  = var.region
  profile = var.aws_profile
}

provider "aws" {
  alias = "use1"
  region  = "us-east-1"
  profile = var.aws_profile
}

data "aws_caller_identity" "current" {}

module "cur_bucket" {
  source = "./modules/cur-bucket"

  account_id = data.aws_caller_identity.current.account_id
  cost_usage_account_id = var.cost_usage_account_id
}

module "cost_usage_report" {
  source = "./modules/cost-usage-report"
  providers = {
    aws = aws.use1
  }

  s3_bucket = module.cur_bucket.bucket_id
  s3_region = module.cur_bucket.bucket_region
  s3_prefix = local.cur_s3_prefix
}
