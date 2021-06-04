output "glue_crawler_name" {
  value = module.glue_crawler.glue_crawler_name
  description = "The Glue crawler name"
}

output "athena_workgroup_name" {
  value = module.athena.athena_workgroup_name
}

output "athena_results_bucket" {
  value = module.athena.athena_results_bucket
}

output "glue_database_name" {
  value = module.glue_crawler.glue_database_name
}

output "glue_catalog_id" {
  value = module.glue_crawler.glue_catalog_id
}
