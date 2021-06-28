variable "region" {
  default = "ap-southeast-1"
}

variable "aws_profile" {
  default = "default"
}

variable "cur_s3_bucket_id" {
  type = string
}

variable "cur_s3_prefix" {
  type = string
}

variable "cur_report_name" {
  type = string
}
