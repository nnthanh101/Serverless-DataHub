import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CdkSpa } from 'cdk-spa';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

  }
}