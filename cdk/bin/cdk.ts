#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { FrontendStack } from "../lib/frontend-stack";

const APP_ID = "Serverless";
const stackPrefix = "Dashboard-".concat(APP_ID);

const account = process.env.AWS_ACCOUNT;
const region = process.env.AWS_REGION;
const contentBucketName = `${stackPrefix}-${account}-${region}-content`.toLowerCase();

const app = new cdk.App();

/**
 * TODO
 *
 * 1. AuthStack
 * 2. BackendStack
 * 3. FrontendStack
 * 4. OpsStack
 * 5. DashboardStack
 */

const frontend = new FrontendStack(app, "Frontend", {
  stackName: stackPrefix.concat("-Frontend"),
  contentBucket: contentBucketName,
});

// new CdkStack(app, 'CdkStack', {
//   /* If you don't specify 'env', this stack will be environment-agnostic.
//    * Account/Region-dependent features and context lookups will not work,
//    * but a single synthesized template can be deployed anywhere. */
// 
//   /* Uncomment the next line to specialize this stack for the AWS Account
//    * and Region that are implied by the current CLI configuration. */
//   // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
// 
//   /* Uncomment the next line if you know exactly what Account and Region you
//    * want to deploy the stack to. */
//   // env: { account: '123456789012', region: 'us-east-1' },
// 
//   /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });


cdk.Tags.of(frontend).add("APP_ID", APP_ID);