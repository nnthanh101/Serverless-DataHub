terraform {
  required_providers {
    aws = {
      source =  "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

resource "aws_cur_report_definition" "master_cur" {
  additional_schema_elements = [
    "RESOURCES"
  ]
  compression =                "Parquet"
  format =                     "Parquet"
  report_name =                "master-cur-cudos"
  s3_bucket =                  var.s3_bucket
  s3_region =                  var.s3_region
  s3_prefix =                  var.s3_prefix
  time_unit =                  "DAILY"
  report_versioning =          "OVERWRITE_REPORT"
  additional_artifacts =       [
    "ATHENA"
  ]
}
