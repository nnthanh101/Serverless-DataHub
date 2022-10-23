#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { FrontendStack } from "../lib/frontend-stack";

const APP_ID = "Serverless";

const account = process.env.AWS_ACCOUNT;
const region = process.env.AWS_REGION;
const contentBucketName = `${APP_ID}-${account}-${region}-content`.toLowerCase();

const app = new cdk.App();

/**
 * 1. AuthStack
 * 2. BackendStack
 * 3. FrontendStack
 * 4. OpsStack
 * 5. DashboardStack
 */

/* 3. FrontendStack */
const frontend = new FrontendStack(app, APP_ID.concat("-Frontend"), {
  contentBucket: contentBucketName,
  // env: { account: account, region: region },
});

cdk.Tags.of(frontend).add("APP_ID", APP_ID);