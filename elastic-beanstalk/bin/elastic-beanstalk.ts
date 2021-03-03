#!/usr/bin/env node
import 'source-map-support/register';
import { ElasticBeanstalkStack } from '../lib/elastic-beanstalk-stack';

import { App }                     from '@aws-cdk/core';

const app = new App();
new ElasticBeanstalkStack(app, 'ElasticBeanstalkStack');
