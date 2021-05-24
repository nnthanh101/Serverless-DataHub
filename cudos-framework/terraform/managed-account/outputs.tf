output "cur_bucket" {
  value = module.cur_bucket.bucket_id
  description = "The name of S3 bucket for the CUR data"
}
