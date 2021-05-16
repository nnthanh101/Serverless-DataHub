#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { S3WebsiteStack } from '../lib/s3-website-stack';

const app = new cdk.App();
new S3WebsiteStack(app, 'S3WebsiteStack',{
    env: {
        account: '769507716756',
        region:  'ap-southeast-1'
    },
});
