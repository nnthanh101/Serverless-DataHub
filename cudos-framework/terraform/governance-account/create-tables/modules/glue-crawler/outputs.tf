output "glue_crawler_name" {
  value = local.glue_crawler_name
  description = "The Glue crawler name"
}

output "glue_database_name" {
  value = aws_glue_catalog_database.cur_database.name
}

output "glue_catalog_id" {
  value = aws_glue_catalog_database.cur_database.catalog_id
}
