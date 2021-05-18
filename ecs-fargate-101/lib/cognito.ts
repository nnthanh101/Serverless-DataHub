import core = require("@aws-cdk/core");
import {
  UserPool,
  CfnUserPoolClient,
} from "@aws-cdk/aws-cognito";

export interface CognitoStackProps {
  readonly userPoolName: string;
  readonly clientName: string;
  readonly refreshTokenValidity: number
  readonly generateSecret: boolean
  readonly explicitAuthFlows: string[]
  readonly domainPrefix: string
  readonly allowedOAuthScopes: string[]
  readonly allowedOAuthFlowsUserPoolClient: boolean
  readonly allowedOAuthFlows: string[]
  readonly callbackUrLs: string[]
  readonly supportedIdentityProviders: string[]
  readonly tags?: {
    [key: string]: string;
  };
}

/**
 * Creating Cognito User-Pool
 */
export class CognitoStack extends core.Stack {
  public readonly userPool: UserPool;
  constructor(parent: core.App, name: string, props: CognitoStackProps) {
    super(parent, name, {
      tags: props.tags,
    });

    this.userPool = new UserPool(this, "UserPool", {
      userPoolName: props.userPoolName,
    });
    this.userPool.addDomain("cognito_domain",{
      cognitoDomain: {
        domainPrefix: props.domainPrefix
      }
    })

    const userPoolClient: CfnUserPoolClient = new CfnUserPoolClient(
      this,
      "UserPoolClient",
      {
        userPoolId: this.userPool.userPoolId,
        clientName: props.clientName,
        refreshTokenValidity: props.refreshTokenValidity,
        explicitAuthFlows: props.explicitAuthFlows,
        generateSecret: props.generateSecret,
        allowedOAuthScopes: props.allowedOAuthScopes,
        allowedOAuthFlowsUserPoolClient: props.allowedOAuthFlowsUserPoolClient,
        allowedOAuthFlows: props.allowedOAuthFlows,
        callbackUrLs: props.callbackUrLs,
        supportedIdentityProviders: props.supportedIdentityProviders
      }
    );
  }
}
