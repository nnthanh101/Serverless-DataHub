#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ServerlessWebappStack } from '../lib/serverless-webapp-stack';
import { applicationMetaData } from '../config/config';

const app = new cdk.App();

new ServerlessWebappStack(app, 'ServerlessWebappStack', {
    domainName: applicationMetaData.domainName,
    // FIXME #3
    // certificate: applicationMetaData.certificate,
    // table: db.table,
    // monitoring
});