#!/usr/bin/env node
import 'source-map-support/register';
import { ElasticBeanstalkStack } from '../lib/elastic-beanstalk-stack';
import { applicationMetaData } from '../config/config';
import { App }                     from '@aws-cdk/core';

const app = new App();
new ElasticBeanstalkStack(app, 'EBStack',{
    env: {
        account: applicationMetaData.ACCOUNT_ID,
        region:  applicationMetaData.REGION
    },
});
