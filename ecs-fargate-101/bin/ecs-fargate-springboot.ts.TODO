#!/usr/bin/env node
// import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { EcsFargateStack } from "../lib/ecs-fargate-stack";

import { Vpc } from "../lib/vpc";
import { APIGatewayStack } from "../lib/api_gateway";
import { EcsClusterStack } from "../lib/ecs_cluster";
import { EcsServiceStack } from "../lib/ecs_service";
import { EcsServiceStackAlb } from "../lib/ecs_service_alb";
import { CognitoStack } from "../lib/cognito";
import { DynamoDBStack } from "../lib/dynamodb";
import { BastonHostStack } from "../lib/bastion_host";

import { applicationMetaData } from "../configurations/config";

const app = new cdk.App();

new EcsFargateStack(app, "EcsFargateStack");

/** Step 1. VPC */

// FIXME: ~aws-infrastructure-stack.ts~ >> ~getOrCreateVpc~
// CreateVpc(this, VPC_TYPE)
// getVpc(this, VPC_TYPE)
const vpc = new Vpc(app, applicationMetaData.vpcStackName, {
  maxAzs: applicationMetaData.maxAzs,
  cidr: applicationMetaData.cidr,
});

/** Step 2. BastionHost?JumpBox EC2 
 * OS: AmazonLinux 2.3
 * Ubuntu ???
 * Windows Server ???
 */
const bastionHost = new BastonHostStack(
  app,
  applicationMetaData.bastionHostStackName,
  {
    vpc: vpc.vpc,
    openSSHfrom: applicationMetaData.openSSHfrom,
  }
);

/** Step 3. ECS Cluster */
const cluster = new EcsClusterStack(
  app,
  applicationMetaData.ecsClusterStackName,
  {
    vpc: vpc.vpc,
    clusterName: applicationMetaData.clusterName,
  }
);

/** Step 4. DynamoDB - CRUD */
const dynamoDB = new DynamoDBStack(app, applicationMetaData.dynamoDBStackName, {
  tableName: applicationMetaData.tableName,
  writeCapacity: applicationMetaData.writeCapacity,
  readCapacity: applicationMetaData.readCapacity,
  partitionKeyName: applicationMetaData.partitionKeyName,
});

/** Step 5. ECS Service >> DNS-IP:Port */
const ecsService = new EcsServiceStack(
  app,
  applicationMetaData.ECSServiceStackName,
  {
    serviceName: applicationMetaData.serviceName,
    taskmemoryLimitMiB: applicationMetaData.taskmemoryLimitMiB,
    taskCPU: applicationMetaData.taskCPU,
    containerPort: applicationMetaData.containerPort,
    springCodeLocation: applicationMetaData.springCodeLocation,
    publicLoadBalancer: applicationMetaData.publicLoadBalancer,
    desiredCount: applicationMetaData.desiredCount,
    ecsCluster: cluster.cluster,
    table: dynamoDB.table,
  }
);

/** Step 5. ECS Service >> DNS-IP:Port 
 * Option 1: NLB
 * Option 2: ALB
 */
const ecsServiceAlb = new EcsServiceStackAlb(
  app,
  applicationMetaData.ECSServiceStackAlbName,
  {
    serviceName: applicationMetaData.serviceNameAlb,
    taskmemoryLimitMiB: applicationMetaData.taskmemoryLimitMiB,
    taskCPU: applicationMetaData.taskCPU,
    containerPort: applicationMetaData.containerPort,
    springCodeLocation: applicationMetaData.springCodeLocation,
    publicLoadBalancer: applicationMetaData.publicLoadBalancer,
    desiredCount: applicationMetaData.desiredCount,
    ecsCluster: cluster.cluster,
    table: dynamoDB.table,
  }
);

/** Step 6. Cognito */
const cognito = new CognitoStack(app, applicationMetaData.cognitoStackName, {
  userPoolName: applicationMetaData.userPoolName,
  clientName: applicationMetaData.clientName,
  refreshTokenValidity: applicationMetaData.refreshTokenValidity,
  generateSecret: applicationMetaData.generateSecret,
  explicitAuthFlows: applicationMetaData.explicitAuthFlows,
  domainPrefix: applicationMetaData.domainPrefix,
  allowedOAuthScopes: applicationMetaData.allowedOAuthScopes,
  allowedOAuthFlowsUserPoolClient:
    applicationMetaData.allowedOAuthFlowsUserPoolClient,
  allowedOAuthFlows: applicationMetaData.allowedOAuthFlows,
  callbackUrLs: applicationMetaData.callbackUrLs,
  supportedIdentityProviders: applicationMetaData.supportedIdentityProviders,
});

/** Step 7. API-Gateway */
const apiGateway = new APIGatewayStack(
  app,
  applicationMetaData.apiGatewayStackName,
  {
    ecsServiceAppLoadBalance: ecsServiceAlb.service,
    ecsService: ecsService.service,
    userPool: cognito.userPool,
    vpcLinkName: applicationMetaData.vpcLinkName,
    vpcLinkDescription: applicationMetaData.vpcLinkDescription,
    stageName: applicationMetaData.stageName,
    identitySource: applicationMetaData.identitySource,
    dataTraceEnabled: applicationMetaData.dataTraceEnabled,
    tracingEnabled: applicationMetaData.tracingEnabled,
    restApiName: applicationMetaData.restApiName,
  }
);

/** Step 8 */
bastionHost.addDependency(vpc);
cluster.addDependency(vpc);
ecsService.addDependency(cluster);
apiGateway.addDependency(cognito);
apiGateway.addDependency(ecsService);
