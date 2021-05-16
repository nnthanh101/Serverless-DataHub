import { CfnOutput, Construct } from "@aws-cdk/core";
import { Repository as EcrRepository } from "@aws-cdk/aws-ecr";
import { Repository } from "@aws-cdk/aws-codecommit";
import { Artifacts, Project, Source, LinuxBuildImage, BuildSpec, BuildEnvironmentVariableType } from "@aws-cdk/aws-codebuild";
import { Artifact, ArtifactPath, Pipeline } from "@aws-cdk/aws-codepipeline";
import { CodeCommitSourceAction, CodeBuildAction, ManualApprovalAction, EcsDeployAction } from "@aws-cdk/aws-codepipeline-actions";
import { PolicyStatement, Effect, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { FargateService } from "@aws-cdk/aws-ecs";
import { Secret } from '@aws-cdk/aws-secretsmanager'; // Secret Manager vs. Params Store ?
import {Bucket } from '@aws-cdk/aws-s3';


export interface CiCdPipelineConstructProps {
  readonly clusterName: string;
  readonly ecsService: FargateService;
  readonly containerName: string;
  // readonly dockerCredentialSecretArn: string;
  readonly dockerUsername: string;
  // readonly runtimeEnv: string;
  readonly s3artifact: Bucket;
  readonly repoName:string;
}

/**
 * 
 */
export class CiCdPipelineConstruct extends Construct {
  constructor(parent: Construct, name: string, props: CiCdPipelineConstructProps) {
    super(parent, name);

    const ecrRepo = new EcrRepository(parent, name + "EcrRepo");

    // ***CodeCommit Contructs***
    const codecommitRepo = new Repository(parent, props.repoName, { repositoryName: props.repoName });

    
    // const dockerCredential = Secret.fromSecretCompleteArn(parent, name + "dockeruser", props.dockerCredentialSecretArn);

    // const stringValue =  StringParameter.fromStringParameterAttributes(this, 'MyValue', {
    //   parameterName: 'dockerpassword', 
    // }).stringValue;

    

    // ***CodeBuild Contructs***  
    const project = new Project(parent, name + 'Project', {
      projectName: name + 'Project',
      source: Source.codeCommit({ repository: codecommitRepo }),
      //TODO: Save artifact in 1 s3 bucket
      artifacts: Artifacts.s3({
        bucket: props.s3artifact,
        path:`/codebuild-project/${name}/`
      }) ,
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_2,
        privileged: true,

      },
      environmentVariables: {
        'CLUSTER_NAME': {
          value: props.clusterName
        },
        'ECR_REPO_URI': {
          value: ecrRepo.repositoryUri
        },
        'DOCKER_USER': {
          value: props.dockerUsername,
        },
        'DOCKER_PASSWORD': {
          /** Secrets Manager */
          // value: props.runtimeEnv + "/" + dockerCredential.secretName,
          // type: BuildEnvironmentVariableType.SECRETS_MANAGER 
          value: "ecs-dockerpassword",
          type: BuildEnvironmentVariableType.PARAMETER_STORE
        }
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'docker login -u $DOCKER_USER -p $DOCKER_PASSWORD'
            ]
          },
          pre_build: {
            commands: [
              'env',
            ]
          },
          build: {
            commands: [
              `docker build -t $ECR_REPO_URI .`,
              '$(aws ecr get-login --no-include-email)',
              'docker push $ECR_REPO_URI'
            ]
          },
          post_build: {
            commands: [
              'echo "In Post-Build Stage"',
              `printf '[{\"name\":\"${props.containerName}\",\"imageUri\":\"%s\"}]' $ECR_REPO_URI:latest > imagedefinitions.json`,
              "pwd; ls -al; cat imagedefinitions.json"
            ]
          }
        },
        artifacts: {
          files: [
            'imagedefinitions.json'
          ],

        }
      })
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
    const ecsPipeline = new Pipeline(this, name + 'RepoPipeline', {
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
      artifactBucket: props.s3artifact
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

    ecsPipeline.addToRolePolicy(new PolicyStatement({
      actions: [
        "*"
      ],
      resources: [`*`],
    }));
    ecrRepo.grantPullPush(project.role!);

    const deployAction = new EcsDeployAction({
      actionName: 'DeployAction',
      service: props.ecsService,
      imageFile: new ArtifactPath(buildOutput, `imagedefinitions.json`)
    });

    ecsPipeline.addStage({
      stageName: 'Deploy-to-ECS',
      actions: [deployAction],
    });

    new CfnOutput(parent, name + `-CodeCommit`, {
      exportName: name + '-URL',
      value: codecommitRepo.repositoryCloneUrlHttp
    });

  }
}