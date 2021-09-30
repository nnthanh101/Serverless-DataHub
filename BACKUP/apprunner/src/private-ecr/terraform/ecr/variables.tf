variable "region" {
  default = "ap-southeast-1"
}

variable "ecr_repo_name" {
  type = string
}

variable "creat_github_iam" {
  type    = bool
  default = false
}

variable "iam_user_name" {
  type    = string
  default = "github_action"
}