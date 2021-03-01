#!/usr/bin/env node
import 'source-map-support/register';

import { SecretValue, App }  from '@aws-cdk/core';

import { VpcStack }              from '../lib/vpc-stack';
import { RDSMySQLStack }         from '../lib/rds-stack';
import { LoadBalancerStack }         from '../lib/lb-stack';
import { ElasticBeanstalkStack } from '../lib/elastic-beanstalk-stack';
import { envVars }               from '../config/config';

const app = new App();


/** 1. VPC */
const vpcStack = new VpcStack(app, envVars.EB_APP_NAME + '-vpc',
{
    env: {
        account: process.env.AWS_ACCOUNT_ID, 
        region: process.env.AWS_REGION,
    }
});


/** 2. RDS */
const rdsmysqlStack =  new RDSMySQLStack(app, envVars.EB_APP_NAME + '-MysqlRDS', {
    vpc: vpcStack.vpc
    , rdsInstanceName: envVars.RDS_INSTANCE_NAME
    , rdsCredentiallUser: envVars.RDS_CREDENTIAL_USERNAME
    , rdsCredentialPass: envVars.RDS_CREDENTIAL_PAWSSWORD
    , rdsDatabaseName: envVars.RDS_DATABASE_NAME
    , allocatedStorage: envVars.RDS_ALLOCATED_STORAGE
    , maxAllocatedStorage: envVars.RDS_MAX_ALLOCATED_STORAGE
    , env: {
        account: process.env.AWS_ACCOUNT_ID, 
        region: process.env.AWS_REGION,
    }
});
rdsmysqlStack.addDependency(vpcStack);


/** 3. Application Loadbalancer */
const loadbalancerStack =  new LoadBalancerStack(app, envVars.EB_APP_NAME + '-LB', {
    vpc: vpcStack.vpc
    , env: {
        account: process.env.AWS_ACCOUNT_ID, 
        region: process.env.AWS_REGION,
    }
});
loadbalancerStack.addDependency(rdsmysqlStack);


/** https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options-general.html */
const configExtendTomcat = [
      ['aws:elasticbeanstalk:application:environment', 'JDBC_PWD', envVars.RDS_CREDENTIAL_PAWSSWORD],
      ['aws:elasticbeanstalk:application:environment', 'JDBC_UID', envVars.RDS_CREDENTIAL_USERNAME],
      ['aws:elasticbeanstalk:application:environment', 'JDBC_CONNECTION_STRING', rdsmysqlStack.jdbcConnection],
];

/** 4. ElasticBeanstalk Tomcat */
const elbTomcat = new ElasticBeanstalkStack(app, envVars.EB_APP_NAME + '-elbTomcat', {
    vpc:            vpcStack.vpc, 
    elbApplication: null,
    alb:            loadbalancerStack.lb, 
    albSecurityGroup: loadbalancerStack.albSecurityGroup,
    pathSourceZIP:  envVars.EB_APP_PATH_SOURCE_ZIP,
    ec2KeyName:     envVars.EB_EC2_KEYNAME,
    measureName:    envVars.EB_MEASURE_NAME,
    unit:           envVars.EB_UNIT,
    lowerThreshold: envVars.EB_LOWER_THRESHOLD,
    upperThreshold: envVars.EB_UPPER_THRESHOLD,
    minSize:        envVars.EB_MIN_SIZE,
    maxSize:        envVars.EB_MAX_SIZE,
    instanceType:   envVars.EB_INSTANCE_TYPE,
    platforms:      envVars.EB_PLATFORMS,
    description:    envVars.EB_DESCRIPTION,
    optionsOthers:  configExtendTomcat,
    env: {
        account: process.env.AWS_ACCOUNT_ID, 
        region:  process.env.AWS_REGION,
    }
});
elbTomcat.addDependency(loadbalancerStack);

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
