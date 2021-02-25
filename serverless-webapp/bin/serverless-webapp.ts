#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ServerlessWebappStack } from '../lib/serverless-webapp-stack';

const app = new cdk.App();
new ServerlessWebappStack(app, 'ServerlessWebappStack');
