import core = require("@aws-cdk/core");

import {
  VpcLink,
  RestApi,
  CfnAuthorizer,
  AuthorizationType,
  EndpointType,
  Integration,
  IntegrationType,
  ConnectionType,
  Model,
  MethodLoggingLevel,
} from "@aws-cdk/aws-apigateway";

import { NetworkLoadBalancedFargateService } from "@aws-cdk/aws-ecs-patterns";
import { ApplicationLoadBalancedFargateService } from "@aws-cdk/aws-ecs-patterns";
import { UserPool } from "@aws-cdk/aws-cognito";

export interface APIGatewayStackProps {
  readonly ecsService: NetworkLoadBalancedFargateService;
  readonly ecsServiceAppLoadBalance: ApplicationLoadBalancedFargateService;
  readonly userPool: UserPool;
  readonly vpcLinkName: string;
  readonly vpcLinkDescription: string;
  readonly stageName: string;
  readonly identitySource: string;
  readonly dataTraceEnabled: boolean;
  readonly tracingEnabled: boolean;
  readonly restApiName: string;
  readonly tags?: {
    [key: string]: string;
  };
}

export class APIGatewayStack extends core.Stack {
  constructor(parent: core.App, name: string, props: APIGatewayStackProps) {
    super(parent, name, {
      tags: props.tags,
    });

    /* Creating VPC link */
    const apiGatewayVPCLink = new VpcLink(this, "APIGatewayVPCLink", {
      targets: [props.ecsService.loadBalancer],
      vpcLinkName: props.vpcLinkName,
      description: props.vpcLinkDescription,
    });

    /* Creating the REST API */
    const restAPI = new RestApi(this, "MyRestAPI", {
      endpointTypes: [EndpointType.REGIONAL],
      restApiName: props.restApiName,
      deployOptions: {
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: props.dataTraceEnabled,
        stageName: props.stageName,
        tracingEnabled: props.tracingEnabled,
      },
    });

    /* Creating Congnito Authorizer */

    const congitoAuthorizer = new CfnAuthorizer(this, "congitoAuthorizer", {
      restApiId: restAPI.restApiId,
      name: "congito-auth",
      identitySource: props.identitySource,
      providerArns: [props.userPool.userPoolArn],
      type: "COGNITO_USER_POOLS",
    });

    /* Adding the root resource */
    const student = restAPI.root.addResource("tralvel");

    /* Adding GET method */
    student.addMethod(
      "GET",
      new Integration({
        type: IntegrationType.HTTP_PROXY,
        integrationHttpMethod: "GET",
        options: {
          connectionType: ConnectionType.VPC_LINK,
          vpcLink: apiGatewayVPCLink,
        },
        uri: `http://${props.ecsService.loadBalancer.loadBalancerDnsName}/api`,
      }),
      {
        authorizationType: AuthorizationType.COGNITO,
        authorizer: { authorizerId: congitoAuthorizer.ref },
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Content-Type": true,
              "method.response.header.Access-Control-Allow-Origin": true,
              "method.response.header.Access-Control-Allow-Credentials": true,
            },
            responseModels: {
              "application/json": Model.EMPTY_MODEL,
            },
          },
        ],
      }
    );

    /* Adding POST method */
    student.addMethod(
      "POST",
      new Integration({
        type: IntegrationType.HTTP_PROXY,
        integrationHttpMethod: "POST",
        options: {
          connectionType: ConnectionType.VPC_LINK,
          vpcLink: apiGatewayVPCLink,
        },
        uri: `http://${props.ecsService.loadBalancer.loadBalancerDnsName}/api`,
      }),
      {
        authorizationType: AuthorizationType.COGNITO,
        authorizer: { authorizerId: congitoAuthorizer.ref },
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Content-Type": true,
              "method.response.header.Access-Control-Allow-Origin": true,
              "method.response.header.Access-Control-Allow-Credentials": true,
            },
            responseModels: {
              "application/json": Model.EMPTY_MODEL,
            },
          },
        ],
      }
    );

    /* Adding PUT method */
    student.addMethod(
      "PUT",
      new Integration({
        type: IntegrationType.HTTP_PROXY,
        integrationHttpMethod: "PUT",
        options: {
          connectionType: ConnectionType.VPC_LINK,
          vpcLink: apiGatewayVPCLink,
        },
        uri: `http://${props.ecsService.loadBalancer.loadBalancerDnsName}/api`,
      }),
      {
        authorizationType: AuthorizationType.COGNITO,
        authorizer: { authorizerId: congitoAuthorizer.ref },
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Content-Type": true,
              "method.response.header.Access-Control-Allow-Origin": true,
              "method.response.header.Access-Control-Allow-Credentials": true,
            },
            responseModels: {
              "application/json": Model.EMPTY_MODEL,
            },
          },
        ],
      }
    );

    /* Adding DELETE method */
    student.addMethod(
      "DELETE",
      new Integration({
        type: IntegrationType.HTTP_PROXY,
        integrationHttpMethod: "DELETE",
        options: {
          connectionType: ConnectionType.VPC_LINK,
          vpcLink: apiGatewayVPCLink,
        },
        uri: `http://${props.ecsService.loadBalancer.loadBalancerDnsName}/api`,
      }),
      {
        authorizationType: AuthorizationType.COGNITO,
        authorizer: { authorizerId: congitoAuthorizer.ref },
        methodResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Content-Type": true,
              "method.response.header.Access-Control-Allow-Origin": true,
              "method.response.header.Access-Control-Allow-Credentials": true,
            },
            responseModels: {
              "application/json": Model.EMPTY_MODEL,
            },
          },
        ],
      }
    );

    /* Adding CORS */
    student.addCorsPreflight({
      allowOrigins: ["*"],
      allowHeaders: ["*"],
      allowMethods: ["*"],
    });
  }
}
