import { CfnOutput, Construct } from "@aws-cdk/core";
import { Repository } from "@aws-cdk/aws-codecommit";
import { Project, Source, LinuxBuildImage, BuildSpec } from "@aws-cdk/aws-codebuild";
import { Artifact, Pipeline } from "@aws-cdk/aws-codepipeline";
import { CodeCommitSourceAction, CodeBuildAction, ManualApprovalAction } from "@aws-cdk/aws-codepipeline-actions";
import { PolicyStatement } from "@aws-cdk/aws-iam";
import {Bucket, IBucket } from '@aws-cdk/aws-s3';
import {ElasticBeanstalkDeployAction } from '../lib/code-deploy-eb-action';

export interface CicdPipelineProps {
  readonly applicationName: string;
  readonly environmentName: string;
  readonly s3artifact: IBucket | null;
  readonly repoName:string;
  readonly pathBuildSpec:string;
  readonly tags?: {
    [key: string]: string;
  };
}

export class CicdPipelineConstruct extends Construct {
  readonly s3artifact: IBucket;
  constructor(scope: Construct, name: string, props: CicdPipelineProps) {
    super(scope, name);
    
    
    if(props.s3artifact === null){
      this.s3artifact = new Bucket(scope,name+'-artifactbucket');
    }else{
      this.s3artifact = props.s3artifact;
    }
    
    // ***CodeCommit Contructs***
    const codecommitRepo = new Repository(scope, props.repoName, { repositoryName: props.repoName });

    

    // ***CodeBuild Contructs***  
    const project = new Project(scope, name + '-Project', {
      projectName: name + '-Project',
      source: Source.codeCommit({ repository: codecommitRepo }),
      //TODO: Save artifact in 1 s3 bucket
      // artifacts: Artifacts.s3({
      //   bucket: props.s3artifact,
      //   path:`/codebuild-project/${name}/`
      // }) ,
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_2,
        privileged: true,

      },
      buildSpec: BuildSpec.fromSourceFilename(props.pathBuildSpec)
    }); 

    // ***PIPELINE ACTIONS***

    const sourceOutput = new Artifact(name+"sourceOutputArtifact" );
    const buildOutput = new Artifact(name+"buildOutputArtifact");

    const sourceAction = new CodeCommitSourceAction({
      actionName: 'CodeCommit_Source',
      repository: codecommitRepo,
      output: sourceOutput, 
    })

    const buildAction = new CodeBuildAction({
      actionName: 'CodeBuild',
      project: project,
      input: sourceOutput,
      outputs: [buildOutput],
    });



    // PIPELINE STAGES 
    const myPipeline = new Pipeline(scope, name + '-Pipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'Build',
          actions: [buildAction],
        },
      ],
      artifactBucket: this.s3artifact
    });


    // const manualApprovalAction = new ManualApprovalAction({
    //   actionName: 'Approve',
    // });

    // ecsPipeline.addStage({
    //   stageName: 'Approve',
    //   actions: [manualApprovalAction],
    // });


    project.addToRolePolicy(new PolicyStatement({
      actions: [
        "*"
      ],
      resources: [`*`],
    }));

    myPipeline.addToRolePolicy(new PolicyStatement({
      actions: [
        "*"
      ],
      resources: [`*`],
    }));
    const deployAction = new ElasticBeanstalkDeployAction({
        actionName: 'DeployAction',
        ebsEnvironmentName: props.environmentName,
        ebsApplicationName: props.applicationName,
        input: buildOutput,
        // role: deployActionRole,
    });

    myPipeline.addStage({
      stageName: 'Deploy-to-ElasticBeanstalk',
      actions: [deployAction],
    });

    new CfnOutput(scope, name + `-CodeCommit`, {
      exportName: name + '-URL',
      value: codecommitRepo.repositoryCloneUrlHttp
    });

  }
}