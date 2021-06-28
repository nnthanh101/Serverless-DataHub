locals {
  glue_database_name     = "cudos_cur"
  glue_crawler_role_name = "AWSGlueServiceRole-cudos"
  glue_crawler_name = "CUDOS CUR"
}

data "aws_iam_policy" "AWSGlueServiceRole" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole"
}

data "aws_iam_policy_document" "glue-assume-role-policy" {
  statement {
    actions = [
      "sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = [
        "glue.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "glue-crawler-role-inline-policy" {
  statement {
    actions = [
      "s3:GetObject",
      "s3:PutObject"
    ]
    effect  = "Allow"

    resources = [
      "arn:aws:s3:::${var.cur_s3_bucket}/${var.cur_s3_prefix}*"
    ]
  }
}

resource "aws_iam_role" "glue_crawler_role" {
  name                  = local.glue_crawler_role_name
  path                  = "/service-role/"
  force_detach_policies = true
  assume_role_policy    = data.aws_iam_policy_document.glue-assume-role-policy.json
  managed_policy_arns   = [
    data.aws_iam_policy.AWSGlueServiceRole.arn
  ]
  inline_policy {
    name   = "cudos-glue-crawler-inline-policy"
    policy = data.aws_iam_policy_document.glue-crawler-role-inline-policy.json
  }
}

resource "aws_glue_catalog_database" "cur_database" {
  name = local.glue_database_name
}

resource "aws_glue_crawler" "cur_crawler" {
  database_name = aws_glue_catalog_database.cur_database.name
  name          = local.glue_crawler_name
  role          = aws_iam_role.glue_crawler_role.arn
  s3_target {
    path       = "s3://${var.cur_s3_bucket}/${var.cur_s3_prefix}"
    exclusions = [
      "**.zip",
      "**.gz",
      "**.json",
      "**.yml",
      "**.sql",
      "**.csv",
    ]
  }

  recrawl_policy {
    recrawl_behavior = "CRAWL_EVERYTHING"
  }

  configuration = jsonencode({
    Grouping = {
      TableGroupingPolicy = "CombineCompatibleSchemas"
    }

    CrawlerOutput = {
      Tables = {
        AddOrUpdateBehavior = "MergeNewColumns"
      }
    }

    Version = 1
  })

  schema_change_policy {
    delete_behavior = "LOG"
  }
}
