import * as cdk from '@aws-cdk/core';

import * as apigateway from '@aws-cdk/aws-apigateway';
import * as certmgr    from '@aws-cdk/aws-certificatemanager';
import * as dynamodb   from '@aws-cdk/aws-dynamodb';
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as s3         from '@aws-cdk/aws-s3';
import * as s3deploy   from '@aws-cdk/aws-s3-deployment';
import * as origins    from '@aws-cdk/aws-cloudfront-origins';
import * as lambda     from '@aws-cdk/aws-lambda';
import { IMonitoring } from './monitoring-stack';

/** ServerlessWebapp StackProps */
export interface WebAppStackProps extends cdk.StackProps {

  /**
   * Domain name for the CloudFront distribution
   * (Requires 'certificate' to be set)
   * @default - Automatically generated domain name under CloudFront domain
   */
  readonly domainName?: string;

  /**
   * Certificate for the CloudFront distribution
   * (Requires 'domainName' to be set)
   * @default - Automatically generated domain name under CloudFront domain
   */
  readonly certificate?: certmgr.ICertificate;

  /**
   * Table to use as backing store for the Lambda Function
   */
  // readonly table: dynamodb.ITable;

  /**
   * Where to add metrics
   */
  // readonly monitoring: IMonitoring;
}

/**
 * Serverless Web-App Stack.
 */
export class ServerlessWebappStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: WebAppStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    /** Step 1. Route53-Domain & ACM-Certificate */
    if (!!props.domainName !== !!props.certificate) {
      throw new Error('Supply either both or neither of \'domainName\' and \'certificate\'');
    }

    /**
     * FIXME #4 
     * 
     * Step 2. Lambda & API-Gateway
     */
    // const func = new lambda.Function(this, 'Lambda', {
    //   runtime: lambda.Runtime.NODEJS_14_X,
    //   handler: 'index.handler',
    //   code: lambda.Code.fromAsset(`${__dirname}/../build/src/lambda-handlers/lambda-handlers`),
    //   environment: {
    //     TABLE_ARN: props.table.tableArn
    //   },
    //   timeout: cdk.Duration.seconds(10),
    // });

    // props.table.grantReadWriteData(func);

    // const apiGateway = new apigateway.LambdaRestApi(this, 'API-Gateway', {
    //   handler: func,
    //   endpointTypes: [apigateway.EndpointType.REGIONAL],
    // });

    /**
     * Step 3. S3 bucket & Cloudfront distribution
     */
    
    /** 3.1. S3 bucket to hold the Website with a CloudFront distribution */
    // const bucket = new s3.Bucket(this, 'Bucket', {
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,
    // });
    // const distribution = new cloudfront.Distribution(this, 'Dist', {
    //   defaultBehavior: { origin: new origins.S3Origin(bucket) },
    //   additionalBehaviors: {
    //     '/api/*': {
    //       origin: new origins.HttpOrigin(`${apiGateway.restApiId}.execute-api.${this.region}.amazonaws.com`, {
    //         originPath: `/${apiGateway.deploymentStage.stageName}`,
    //       }),
    //       allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
    //       cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
    //     },
    //   },
    //   defaultRootObject: 'index.html',
    //   domainNames: props.domainName ? [props.domainName] : undefined,
    //   certificate: props.certificate,
    // });

    /** 3.2. Upload assets to the S3 bucket */
    // new s3deploy.BucketDeployment(this, 'Deploy', {
    //   destinationBucket: bucket,
    //   sources: [s3deploy.Source.asset(`${__dirname}/../../projects/web`)],
    //   distribution,
    //   prune: false,
    // });

    /**
     * FIXME #5
     * Monitoring: 99% of the requests should be faster than given latency.
     * E301: latency 3 seconds
     */
    // props.monitoring.addGraphs('Application',
    //   new cloudwatch.GraphWidget({
    //     title: 'P99 Latencies',
    //     left: [
    //       apiGateway.metricLatency({ statistic: 'P99' }),
    //       apiGateway.metricIntegrationLatency({ statistic: 'P99' }),
    //     ],
    //   }),

    //   new cloudwatch.GraphWidget({
    //     title: 'Counts vs errors',
    //     left: [
    //       apiGateway.metricCount(),
    //     ],
    //     right: [
    //       apiGateway.metricClientError(),
    //       apiGateway.metricServerError(),
    //     ],
    //   }),
    // );

  }
}