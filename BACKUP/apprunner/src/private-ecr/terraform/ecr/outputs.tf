output "ecr_repo_url" {
  description = "The URL of the ECR repository"
  value       = aws_ecr_repository.repo.repository_url
}

output "iam_user_name" {
  description = "The GitHub user's name"
  value       = var.creat_github_iam ? module.iam[0].iam_user_name : "N/A"
}

output "iam_access_key_id" {
  description = "The access key ID"
  value       = var.creat_github_iam ? module.iam[0].iam_access_key_id : "N/A"
}

output "iam_access_key_secret" {
  description = "The access key secret"
  value       = var.creat_github_iam ? module.iam[0].iam_access_key_secret : "N/A"
  sensitive   = true
}