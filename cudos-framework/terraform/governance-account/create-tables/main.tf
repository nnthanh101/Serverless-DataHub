terraform {
  backend "s3" {
    key = "terraform/environment/dev/governance-account.tfstate"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region  = var.region
  profile = var.aws_profile
}

data "aws_caller_identity" "current" {}

module "glue_crawler" {
  source        = "./modules/glue-crawler"
  cur_s3_bucket = var.cur_s3_bucket_id
  cur_s3_prefix = var.cur_s3_prefix
}

module "athena" {
  source = "./modules/athena"

  athena_results_bucket_name = "athena-results-${data.aws_caller_identity.current.account_id}-${var.region}"
}

resource "aws_glue_catalog_table" "cur" {
  database_name = module.glue_crawler.glue_database_name
  name          = replace(lower(var.cur_report_name), '-', '_')
  retention     = 0
  table_type    = "EXTERNAL_TABLE"

  parameters                = {
    "classification"                   = "parquet"
    "compressionType"                  = "none"
    "exclusions"                       = jsonencode(
    [
      "s3://cudossharedbucket/MyPrefix/**.zip",
      "s3://cudossharedbucket/MyPrefix/**.gz",
      "s3://cudossharedbucket/MyPrefix/**.json",
      "s3://cudossharedbucket/MyPrefix/**.yml",
      "s3://cudossharedbucket/MyPrefix/**.sql",
      "s3://cudossharedbucket/MyPrefix/**.csv",
    ]
    )
  }

  partition_keys {
    name = "year"
    type = "string"
  }
  partition_keys {
    name = "month"
    type = "string"
  }

  storage_descriptor {
    location                  = "s3://${var.cur_s3_bucket_id}/${var.cur_s3_prefix}${var.cur_report_name}/${var.cur_report_name}/"
    input_format              = "org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat"
    output_format             = "org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat"
    parameters                = {
      "classification"                   = "parquet"
      "compressionType"                  = "none"
      "exclusions"                       = jsonencode(
      [
        "s3://cudossharedbucket/MyPrefix/**.zip",
        "s3://cudossharedbucket/MyPrefix/**.gz",
        "s3://cudossharedbucket/MyPrefix/**.json",
        "s3://cudossharedbucket/MyPrefix/**.yml",
        "s3://cudossharedbucket/MyPrefix/**.sql",
        "s3://cudossharedbucket/MyPrefix/**.csv",
      ]
      )
    }
    stored_as_sub_directories = false

    columns {
      name       = "identity_line_item_id"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "identity_time_interval"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "bill_invoice_id"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "bill_billing_entity"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "bill_bill_type"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "bill_payer_account_id"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "bill_billing_period_start_date"
      parameters = {}
      type       = "timestamp"
    }
    columns {
      name       = "bill_billing_period_end_date"
      parameters = {}
      type       = "timestamp"
    }
    columns {
      name       = "line_item_usage_account_id"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "line_item_line_item_type"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "line_item_usage_start_date"
      parameters = {}
      type       = "timestamp"
    }
    columns {
      name       = "line_item_usage_end_date"
      parameters = {}
      type       = "timestamp"
    }
    columns {
      name       = "line_item_product_code"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "line_item_usage_type"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "line_item_operation"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "line_item_availability_zone"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "line_item_resource_id"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "line_item_usage_amount"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "line_item_normalization_factor"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "line_item_normalized_usage_amount"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "line_item_currency_code"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "line_item_unblended_rate"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "line_item_unblended_cost"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "line_item_blended_rate"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "line_item_blended_cost"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "line_item_line_item_description"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "line_item_tax_type"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "line_item_legal_entity"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_product_name"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_alarm_type"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_availability"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_durability"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_from_location"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_from_location_type"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_group"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_group_description"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_location"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_location_type"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_operating_system"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_operation"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_physical_processor"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_processor_features"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_product_family"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_region"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_servicecode"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_servicename"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_sku"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_storage_class"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_storage_media"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_to_location"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_to_location_type"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_transfer_type"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_usagetype"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_version"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_volume_type"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "pricing_rate_id"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "pricing_currency"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "pricing_public_on_demand_cost"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "pricing_public_on_demand_rate"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "pricing_term"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "pricing_unit"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "reservation_amortized_upfront_cost_for_usage"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "reservation_amortized_upfront_fee_for_billing_period"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "reservation_effective_cost"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "reservation_end_time"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "reservation_modification_status"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "reservation_normalized_units_per_reservation"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "reservation_number_of_reservations"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "reservation_recurring_fee_for_usage"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "reservation_start_time"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "reservation_subscription_id"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "reservation_total_reserved_normalized_units"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "reservation_total_reserved_units"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "reservation_units_per_reservation"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "reservation_unused_amortized_upfront_fee_for_billing_period"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "reservation_unused_normalized_unit_quantity"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "reservation_unused_quantity"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "reservation_unused_recurring_fee"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "reservation_upfront_value"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "savings_plan_total_commitment_to_date"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "savings_plan_savings_plan_a_r_n"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "savings_plan_savings_plan_rate"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "savings_plan_used_commitment"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "savings_plan_savings_plan_effective_cost"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "savings_plan_amortized_upfront_commitment_for_billing_period"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "savings_plan_recurring_commitment_for_billing_period"
      parameters = {}
      type       = "double"
    }
    columns {
      name       = "pricing_rate_code"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_clock_speed"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_component"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_compute_type"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_current_generation"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_description"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_edition"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_free_query_types"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_gpu"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_gpu_memory"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_instance_name"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_instance_type"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_instance_type_family"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_logs_destination"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_max_throughputvolume"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_memory"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_message_delivery_frequency"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_message_delivery_order"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_network_performance"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_physical_cpu"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_physical_gpu"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_platoclassificationtype"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_platoinstancename"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_platoinstancetype"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_processor_architecture"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_queue_type"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_storage"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_subscription_type"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_tenancy"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_vcpu"
      parameters = {}
      type       = "string"
    }
    columns {
      name       = "product_database_engine"
      parameters = {}
      type       = "string"
    }

    ser_de_info {
      parameters            = {
        "serialization.format" = "1"
      }
      serialization_library = "org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe"
    }
  }
}

