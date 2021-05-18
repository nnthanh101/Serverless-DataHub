#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EcsFargateStack } from '../lib/ecs-fargate-stack';

const app = new cdk.App();
new EcsFargateStack(app, 'EcsFargateStack');
