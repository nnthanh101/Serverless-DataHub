terraform {
  backend "s3" {
    key = "terraform/environment/dev/apprunner-github.tfstate"
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

#resource "aws_apprunner_connection" "github" {
#  connection_name = "apprunner_code_example"
#  provider_type   = "GITHUB"
#}

resource "aws_apprunner_service" "code_example" {
  service_name = "apprunner_code_example"

  source_configuration {
    authentication_configuration {
      connection_arn = var.github_connection_arn
    }
    code_repository {
      code_configuration {
        code_configuration_values {
          build_command = "yum install pycairo -y && pip3 install -r requirements.txt"
          port          = "8000"
          runtime       = "PYTHON_3"
          start_command = "python app.py"
        }
        configuration_source = "API"
      }
      repository_url = var.github_code_repo_url
      source_code_version {
        type  = "BRANCH"
        value = "main"
      }
    }
  }
}