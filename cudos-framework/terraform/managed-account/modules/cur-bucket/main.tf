data "aws_iam_policy_document" "bucket_policy" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["billingreports.amazonaws.com"]
    }

    actions = [
      "s3:GetBucketAcl",
      "s3:GetBucketPolicy"
    ]

    resources = [
      "arn:aws:s3:::${local.cur_bucket_name}",
    ]
  }

  statement {
    principals {
      type        = "Service"
      identifiers = ["billingreports.amazonaws.com"]
    }

    actions = [
      "s3:PutObject"
    ]

    resources = [
      "arn:aws:s3:::${local.cur_bucket_name}/*",
    ]
  }
}

module "cur_bucket" {
  source = "terraform-aws-modules/s3-bucket/aws"
  version = "2.2.0"

  bucket = local.cur_bucket_name

  versioning = {
    enabled = false
  }

  attach_policy = true
  policy = data.aws_iam_policy_document.bucket_policy.json
}

resource "aws_s3_bucket_ownership_controls" "cur_bucket" {
  bucket = module.cur_bucket.s3_bucket_id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}
