terraform {
  backend "s3" {
    key = "terraform/environment/dev/apprunner-ecr-public.tfstate"
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

resource "aws_apprunner_service" "ecr_public_example" {
  service_name = "apprunner_public_ecr_example"

  source_configuration {
    image_repository {
      image_configuration {
        port = "8000"
      }

      image_identifier      = var.ecr_image
      image_repository_type = "ECR_PUBLIC"
    }

    #  App Runner doesn't support automatic deployments for an image in an ECR Public repository
    auto_deployments_enabled = false
  }
}