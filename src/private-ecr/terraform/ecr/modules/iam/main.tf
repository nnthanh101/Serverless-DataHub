module "iam_user" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-user"
  version = "~> 3.0"

  name                          = var.iam_user_name
  force_destroy                 = true
  create_iam_user_login_profile = false
  password_reset_required       = false
  create_iam_access_key         = true
}

data "aws_iam_policy_document" "github_ecr" {
  statement {
    actions = [
      "ecr:GetAuthorizationToken",
    ]

    resources = [
      "*",
    ]

    effect = "Allow"
  }

  statement {
    actions = [
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:BatchCheckLayerAvailability",
      "ecr:PutImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
    ]

    resources = [
      "*",
    ]

    effect = "Allow"
  }
}

resource "aws_iam_policy" "github_ecr" {
  name        = "github-ecr-policy"
  description = "GitHub ECR"
  policy      = data.aws_iam_policy_document.github_ecr.json
}

resource "aws_iam_user_policy_attachment" "this" {
  user       = module.iam_user.this_iam_user_name
  policy_arn = aws_iam_policy.github_ecr.arn
}