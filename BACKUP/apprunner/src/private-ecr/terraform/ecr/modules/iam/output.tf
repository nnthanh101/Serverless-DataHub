output "iam_user_name" {
  description = "The user's name"
  value       = module.iam_user.this_iam_user_name
}

output "iam_access_key_id" {
  description = "The access key ID"
  value       = module.iam_user.this_iam_access_key_id
}

output "iam_access_key_secret" {
  description = "The access key secret"
  value       = module.iam_user.this_iam_access_key_secret
  sensitive   = true
}