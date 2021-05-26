output "cur_bucket_id" {
  value = module.cur_bucket.bucket_id
  description = "The name of S3 bucket for the CUR data"
}

output "cur_bucket_region" {
  value = module.cur_bucket.bucket_region
  description = "The region of S3 bucket for the CUR data"
}
