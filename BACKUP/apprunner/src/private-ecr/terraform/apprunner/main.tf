terraform {
  backend "s3" {
    key = "terraform/environment/dev/apprunner/private-ecr/apprunner.tfstate"
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

data "aws_iam_policy_document" "apprunner_policy" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type = "Service"
      identifiers = [
        "build.apprunner.amazonaws.com",
        "tasks.apprunner.amazonaws.com",
      ]
    }
  }
}

data "aws_iam_policy" "AWSAppRunnerServicePolicyForECRAccess" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

resource "aws_iam_role" "apprunner_role" {
  name = "apprunner_role"

  assume_role_policy = data.aws_iam_policy_document.apprunner_policy.json
}

resource "aws_iam_role_policy_attachment" "apprunner_role" {
  role       = aws_iam_role.apprunner_role.name
  policy_arn = data.aws_iam_policy.AWSAppRunnerServicePolicyForECRAccess.arn
}

resource "aws_apprunner_service" "private_ecr_example" {
  service_name = "apprunner_private_ecr_example"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_role.arn
    }

    image_repository {
      image_configuration {
        port = "8000"
      }

      image_identifier      = "${var.ecr_repo_url}:latest"
      image_repository_type = "ECR"
    }
  }
}