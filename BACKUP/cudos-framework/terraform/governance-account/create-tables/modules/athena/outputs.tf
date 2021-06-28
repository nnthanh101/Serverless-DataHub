output "athena_workgroup_name" {
  value = aws_athena_workgroup.cudos.name
}

output "athena_results_bucket" {
  value = module.results_bucket.s3_bucket_id
}
