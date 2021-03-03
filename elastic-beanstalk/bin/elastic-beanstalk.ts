#!/usr/bin/env node
import 'source-map-support/register';

import { App }                     from '@aws-cdk/core';
import { ElasticBeanstalkStack }   from '../lib/elastic-beanstalk-stack';
import { envVars }                 from '../config/config';


const app = new App();

new ElasticBeanstalkStack(app, "ElasticBeanstalk");
/** 
 * FIXME
 * 5. CI/CD CodePipeline 
 */
// const cicd = new CiCdPipelineStack(app, envVars.EB_APP_NAME + '-CicdTomcat', {
//      applicationName: elbTomcat.elbApp.applicationName || ''
//      , environmentName: elbTomcat.elbEnv.environmentName || ''
//      , s3artifact: elbTomcat.s3artifact
//      , repoName: 'SpringBootWithTomcat'
//      , env: {
//         account: process.env.AWS_ACCOUNT_ID, 
//         region: process.env.AWS_REGION,
//     }
// });
// cicd.addDependency(elbTomcat);
