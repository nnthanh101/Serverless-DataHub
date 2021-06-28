import { Construct } from '@aws-cdk/core';

import { IVpc, Vpc, SubnetType, SecurityGroup, InterfaceVpcEndpointAwsService, Instance, InstanceType, AmazonLinuxImage, AmazonLinuxGeneration } from '@aws-cdk/aws-ec2';
import { Role, ServicePrincipal, PolicyDocument, PolicyStatement, ManagedPolicy } from '@aws-cdk/aws-iam';
import { Bucket, CfnAccessPoint } from '@aws-cdk/aws-s3';
import { Queue } from '@aws-cdk/aws-sqs';

export interface VpcConstructProps  {
  readonly cidr?: string;
  readonly maxAzs?: number;
  readonly natGateways?: number;
  readonly ports: number[];
  readonly tags?: {
    [key: string]: string;
  };
  readonly useDefaultVpc: string;
  readonly useExistVpc: string;
  readonly vpcId: string;
}

/**
 * 
 */
export class VpcIsolatedConstruct extends Construct {
  public readonly vpc: IVpc;
  readonly securityGrp: SecurityGroup;

  constructor(parent: Construct, id: string, props: VpcConstructProps) {
    super(parent, id);

    /** Create VPC and subnet */
    const vpc = new Vpc(this, 'ISOLATED-VPC', {
      cidr: "10.0.0.0/24",
      maxAzs: 1,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Isolated',
          subnetType: SubnetType.ISOLATED
        }
      ]
    });

    /** Create VPC interface endpoints */
    vpc.addInterfaceEndpoint('sqs', {
      service: InterfaceVpcEndpointAwsService.SQS
      // Default policy is Allow * on * from *, which we want for this demo.
    });

    vpc.addInterfaceEndpoint('SSM', {
      service: InterfaceVpcEndpointAwsService.SSM,
    });

    vpc.addInterfaceEndpoint('ssm_messages', {
      service: InterfaceVpcEndpointAwsService.SSM_MESSAGES
    });

    vpc.addInterfaceEndpoint('ec2_messages', {
      service: InterfaceVpcEndpointAwsService.EC2_MESSAGES
    });

    /** Create VPC Gateway Endpoint to S3 */
    vpc.addS3Endpoint('s3', [{subnetType: SubnetType.ISOLATED}]);

    /** Create IAM Role for EC2 */
    const ec2_role = new Role(this, "IsolatedEC2", {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      inlinePolicies: {
        inline: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['sqs:*'],
              resources: ["*"]
            }),
            new PolicyStatement({
              actions: ['s3:*'],
              resources: ["*"]
            })
          ]
        })},
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')]
    });

    /** Create EC2 */
    const isolated_ec2 = new Instance(this, "ec2", {
      instanceType:      new InstanceType('t2.micro'),
      machineImage:      new AmazonLinuxImage({generation: AmazonLinuxGeneration.AMAZON_LINUX_2}),
      vpc:               vpc,
      vpcSubnets:        vpc.selectSubnets({subnetType: SubnetType.ISOLATED}),
      // Requiring IMDSv2 is not yet possible with the CDK. Waiting on https://github.com/aws/aws-cdk/issues/5137
      role: ec2_role
    });

    /** Create SQS */ 
    const queue = new Queue(this, 'queue');

    /**
     * Create S3 bucket 
     * This get's randomly named as something like `vpcisolatednconstruct-bucketXXX`
     */
    const bucket = new Bucket(this, 'bucket');

    const access_point = new CfnAccessPoint(this, 'accesspoint', {
      name: 'isolatedaccesspoint',
      bucket: bucket.bucketName,
      vpcConfiguration: {vpcId: vpc.vpcId},
    });
  }
}
