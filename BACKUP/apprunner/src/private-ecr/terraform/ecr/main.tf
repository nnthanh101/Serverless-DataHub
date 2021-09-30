terraform {
  backend "s3" {
    key = "terraform/environment/dev/apprunner/private-ecr/ecr.tfstate"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.5"
    }
  }
}

provider "aws" {
  region = var.region
}

resource "aws_ecr_repository" "repo" {
  name = var.ecr_repo_name

  image_scanning_configuration {
    scan_on_push = true
  }
}

module "iam" {
  source = "./modules/iam"

  count = var.creat_github_iam ? 1 : 0

  iam_user_name = var.iam_user_name
}