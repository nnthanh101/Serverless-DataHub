output "app_url" {
  description = "The URL of the application"
  value       = aws_apprunner_service.ecr_public_example.service_url
}