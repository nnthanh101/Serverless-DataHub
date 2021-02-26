#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ElasticBeanstalkStack } from '../lib/elastic-beanstalk-stack';

const app = new cdk.App();
new ElasticBeanstalkStack(app, 'ElasticBeanstalkStack');
