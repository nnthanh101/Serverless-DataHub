locals {
  athena_workgroup_name = "cudos"
}

module "results_bucket" {
  source = "terraform-aws-modules/s3-bucket/aws"
  version = "2.2.0"

  bucket = "${var.athena_results_bucket_name}-${local.athena_workgroup_name}"
  force_destroy = true

  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}
resource "aws_athena_workgroup" "cudos" {
  name = local.athena_workgroup_name

  force_destroy = true

  configuration {
    enforce_workgroup_configuration = false

    result_configuration {
      output_location = "s3://${module.results_bucket.s3_bucket_id}/"
    }
  }
}
