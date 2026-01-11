terraform {
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.0" } }
}
provider "aws" { region = var.aws_region }
module "vpc" { source = "./modules/vpc"; environment = var.environment }
module "ecs" { source = "./modules/ecs"; vpc_id = module.vpc.vpc_id }