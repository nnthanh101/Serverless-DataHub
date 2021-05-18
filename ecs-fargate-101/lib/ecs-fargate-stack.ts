import * as cdk          from '@aws-cdk/core';
import * as ec2          from '@aws-cdk/aws-ec2';
import * as iam          from '@aws-cdk/aws-iam';
import * as ecs          from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
// import { Repository } from "@aws-cdk/aws-ecr";
// import { ApplicationTargetGroup, ApplicationLoadBalancer, IpAddressType, ApplicationProtocol, TargetType, ApplicationListener} as elb2 from "@aws-cdk/aws-elasticloadbalancingv2";
// import { Bucket, BucketEncryption } from "@aws-cdk/aws-s3";
// import { Repository } from "@aws-cdk/aws-codecommit";
// import { Pipeline, Artifact } from "@aws-cdk/aws-codepipeline";
// import { Project, LinuxBuildImage, BuildSpec, PipelineProject } from "@aws-cdk/aws-codebuild";
// import { CodeBuildAction, CodeCommitSourceAction, EcsDeployAction } from "@aws-cdk/aws-codepipeline-actions";


/**
 * 
 */
export class EcsFargateStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    /**
     * 1. Create a new VPC with NO NAT Gateway --> reduce cost!
     */
    const vpc = new ec2.Vpc(this, 'ECS-VPC', {
      maxAzs: 2,
      cidr: '10.0.0.0/18',
      natGateways: 0
    })


    /**
     * 2. ECS Cluster: IAM Role, ECS-Logs, ECS-Tasks Role
     */    
    const clusterAdmin = new iam.Role(this, 'AdminRole', {
      assumedBy: new iam.AccountRootPrincipal()
    });

    const cluster = new ecs.Cluster(this, "ecs-cluster", {
      vpc: vpc,
    });

    const logging = new ecs.AwsLogDriver({
      streamPrefix: "ecs-logs"
    });

    const taskRole = new iam.Role(this, `ecs-taskRole-${this.stackName}`, {
      roleName: `ecs-taskRole-${this.stackName}`,
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
    });
    

    /**
     * 3. ECS Contructs
     */

    const executionRolePolicy =  new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ]
    });

    const taskDef = new ecs.FargateTaskDefinition(this, "ecs-taskdef", {
      taskRole: taskRole
    });

    taskDef.addToExecutionRolePolicy(executionRolePolicy);

    /**
     * codelocation: "react"      --> /react/*
     * codelocation: "springboot" --> /springboot/*
     */
    const container = taskDef.addContainer('react', {
      image: ecs.ContainerImage.fromRegistry("nnthanh101/react:latest"),
      memoryLimitMiB: 256,
      cpu: 256,
      logging
    });

    container.addPortMappings({
      containerPort: 80,
      protocol: ecs.Protocol.TCP
    });

    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "ecs-service", {
      cluster: cluster,
      taskDefinition: taskDef,
      publicLoadBalancer: true,
      desiredCount: 3,
      listenerPort: 80
    });

    const scaling = fargateService.service.autoScaleTaskCount({ maxCapacity: 6 });
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 10,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60)
    });  
    
    
    // /**
    //  * 4. PIPELINE CONSTRUCTS
    //  */
    
    // /** 4.1. ECR - repo */
    // const ecrRepo = new ecr.Repository(this, 'EcrRepo');

    // const gitHubSource = codebuild.Source.gitHub({
    //   owner: 'nnthanh101',
    //   repo: 'cdk',
    //   webhook: true, // optional, default: true if `webhookFilteres` were provided, false otherwise
    //   webhookFilters: [
    //     codebuild.FilterGroup.inEventOf(codebuild.EventAction.PUSH).andBranchIs('main'),
    //   ], // optional, by default all pushes and Pull Requests will trigger a build
    // });

    // /** 4.2. CODEBUILD - project */
    // const project = new codebuild.Project(this, 'MyProject', {
    //   projectName: `${this.stackName}`,
    //   source: gitHubSource,
    //   environment: {
    //     buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_2,
    //     privileged: true
    //   },
    //   environmentVariables: {
    //     'CLUSTER_NAME': {
    //       value: `${cluster.clusterName}`
    //     },
    //     'ECR_REPO_URI': {
    //       value: `${ecrRepo.repositoryUri}`
    //     }
    //   },
    //   buildSpec: codebuild.BuildSpec.fromObject({
    //     version: "0.2",
    //     phases: {
    //       pre_build: {
    //         commands: [
    //           'env',
    //           'export TAG=${CODEBUILD_RESOLVED_SOURCE_VERSION}'
    //         ]
    //       },
    //       build: {
    //         commands: [
    //           'cd flask-docker-app',
    //           `docker build -t $ECR_REPO_URI:$TAG .`,
    //           '$(aws ecr get-login --no-include-email)',
    //           'docker push $ECR_REPO_URI:$TAG'
    //         ]
    //       },
    //       post_build: {
    //         commands: [
    //           'echo "In Post-Build Stage"',
    //           'cd ..',
    //           "printf '[{\"name\":\"react\",\"imageUri\":\"%s\"}]' $ECR_REPO_URI:$TAG > imagedefinitions.json",
    //           "pwd; ls -al; cat imagedefinitions.json"
    //         ]
    //       }
    //     },
    //     artifacts: {
    //       files: [
    //         'imagedefinitions.json'
    //       ]
    //     }
    //   })
    // });

    // /**
    //  * 5. PIPELINE ACTIONS
    //  */
    // const sourceOutput = new codepipeline.Artifact();
    // const buildOutput = new codepipeline.Artifact();

    // const sourceAction = new codepipeline_actions.GitHubSourceAction({
    //   actionName: 'GitHub_Source',
    //   owner: 'nnthanh101',
    //   repo: 'cdk',
    //   branch: 'main',
    //   oauthToken: cdk.SecretValue.secretsManager("/my/github/token"),
    //   //oauthToken: cdk.SecretValue.plainText('<plain-text>'),
    //   output: sourceOutput
    // });

    // const buildAction = new codepipeline_actions.CodeBuildAction({
    //   actionName: 'CodeBuild',
    //   project: project,
    //   input: sourceOutput,
    //   outputs: [buildOutput], // optional
    // });

    // const manualApprovalAction = new codepipeline_actions.ManualApprovalAction({
    //   actionName: 'Approve',
    // });

    // const deployAction = new codepipeline_actions.EcsDeployAction({
    //   actionName: 'DeployAction',
    //   service: fargateService.service,
    //   imageFile: new codepipeline.ArtifactPath(buildOutput, `imagedefinitions.json`)
    // });


    // /** PIPELINE STAGES */
    // new codepipeline.Pipeline(this, 'MyECSPipeline', {
    //   stages: [
    //     {
    //       stageName: 'Source',
    //       actions: [sourceAction],
    //     },
    //     {
    //       stageName: 'Build',
    //       actions: [buildAction],
    //     },
    //     {
    //       stageName: 'Approve',
    //       actions: [manualApprovalAction],
    //     },
    //     {
    //       stageName: 'Deploy-to-ECS',
    //       actions: [deployAction],
    //     }
    //   ]
    // });

    // ecrRepo.grantPullPush(project.role!)
    // project.addToRolePolicy(new iam.PolicyStatement({
    //   actions: [
    //     "ecs:DescribeCluster",
    //     "ecr:GetAuthorizationToken",
    //     "ecr:BatchCheckLayerAvailability",
    //     "ecr:BatchGetImage",
    //     "ecr:GetDownloadUrlForLayer"
    //     ],
    //   resources: [`${cluster.clusterArn}`],
    // }));


    // /**
    //  * 6. OUTPUT
    //  */
    // new cdk.CfnOutput(this, 'LoadBalancerDNS', { value: fargateService.loadBalancer.loadBalancerDnsName });

  }
}
