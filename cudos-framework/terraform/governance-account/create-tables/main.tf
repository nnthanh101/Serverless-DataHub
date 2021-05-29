terraform {
  backend "s3" {
    key = "terraform/environment/dev/governance-account.tfstate"
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

data "aws_caller_identity" "current" {}

module "glue_crawler" {
  source        = "./modules/glue-crawler"
  cur_s3_bucket = var.cur_s3_bucket_id
  cur_s3_prefix = var.cur_s3_prefix
}

