#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EcsFargateStack } from '../lib/ecs-fargate-stack';

import { Config } from "../config/config";

const app = new cdk.App();
new EcsFargateStack(app, 'EcsFargateStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */

  /* Specialize this stack for the AWS Account and Region that are implied by the current CLI configuration. */
  env: { account: process.env.AWS_ACCOUNT, region: process.env.AWS_REGION },
  
});
