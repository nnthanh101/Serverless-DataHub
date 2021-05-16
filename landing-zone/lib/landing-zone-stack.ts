import { Construct, Stage, Stack, SecretValue, CfnOutput } from '@aws-cdk/core';

import * as bootstrapKit from 'aws-bootstrap-kit';
import { CdkPipeline, SimpleSynthAction, ShellScriptAction } from '@aws-cdk/pipelines';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as iam from '@aws-cdk/aws-iam';

/**
 * Properties for create Landing Zone pipeline stack
 */
 export interface LandingZonePipelineStackProps extends bootstrapKit.AwsOrganizationsStackProps{
  /**
   * Regions for the applications to be deployed. The format of values is the region short-name (e.g. ap-southeast-1).
   *
   * We use AWS CDK to deploy applications in our application CI/CD pipeline. 
   * CDK requires some resources (e.g. AWS S3 bucket) to perform deployment. 
   * The regions specified here will be bootstraped with these resources so that it is deployable.
   *
   * See https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html
   */
  readonly pipelineDeployableRegions: string[],
}

/**
 * Stage in the Pipeline for deploying LandingZone via aws-bootstrap-kit
 */
 export class LandingZoneStage extends Stage {
  constructor(scope: Construct, id: string, props: bootstrapKit.AwsOrganizationsStackProps) {
    super(scope, id, props);

    new bootstrapKit.AwsOrganizationsStack(this, 'orgStack', props);
  }
}

/**
 * Stack to hold the Pipeline to deploy the SDLC Landing Zone.
 */
export class LandingZoneStack extends Stack {
  constructor(scope: Construct, id: string, props: LandingZonePipelineStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
  
    /**
     * 
     */
    
    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();
 
    const pipeline = new CdkPipeline(this, 'Pipeline', {
        pipelineName: 'AWSBootstrapKit-LandingZone',
        cloudAssemblyArtifact,
        sourceAction: new codepipeline_actions.GitHubSourceAction({
          actionName: 'GitHub',
          output: sourceArtifact,
          branch:  this.node.tryGetContext('github_repo_branch'),
          oauthToken: SecretValue.secretsManager('GITHUB_TOKEN'),
          owner: this.node.tryGetContext('github_alias'),
          repo: this.node.tryGetContext('github_repo_name'),
        }),
 
        synthAction: SimpleSynthAction.standardNpmSynth({
          sourceArtifact,
          cloudAssemblyArtifact,
          subdirectory: 'source/1-SDLC-organization',
          installCommand: 'npm install'
        }),
    });
 
    new CfnOutput(this, "PipelineConsoleUrl", {
      value: `https://${Stack.of(this).region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${pipeline.codePipeline.pipelineName}/view?region=${Stack.of(this).region}`,
    });

    /**
     * 
     */

    const prodStage = pipeline.addApplicationStage(new LandingZoneStage(this, 'Prod', props));
    const INDEX_START_DEPLOY_STAGE =  prodStage.nextSequentialRunOrder() - 2; // 2 = Prepare (changeSet creation) + Deploy (cfn deploy)
    prodStage.addManualApprovalAction({actionName: 'Validate', runOrder: INDEX_START_DEPLOY_STAGE});
   
    const deployableRegions = props.pipelineDeployableRegions ?? [Stack.of(this).region];
    const regionsInShellScriptArrayFormat = deployableRegions.join(' ');
   
    prodStage.addActions(new ShellScriptAction(
      {
         actionName: 'CDKBootstrapAccounts',
         commands: [
           'cd ./source/1-SDLC-organization/',
           'npm install',
           `REGIONS_TO_BOOTSTRAP="${regionsInShellScriptArrayFormat}"`,
           './lib/auto-bootstrap.sh "$REGIONS_TO_BOOTSTRAP"'
         ],
         additionalArtifacts: [sourceArtifact],
         rolePolicyStatements: [
           new iam.PolicyStatement({
             actions: [
               'sts:AssumeRole'
             ],
             resources: ['arn:aws:iam::*:role/OrganizationAccountAccessRole'],
           }),
           new iam.PolicyStatement({
             actions: [
               'organizations:ListAccounts',
               'organizations:ListTagsForResource'
             ],
             resources: ['*'],
           }),
         ],
      }
    ));

  }
}
