import { IVpc } from "@aws-cdk/aws-ec2";
import { Effect, PolicyStatement, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { Code, FileSystem, Runtime, Function } from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";


export interface LambdaConstructProps {
    readonly code: Code,
    readonly handler: string,
    readonly runtime: Runtime,
    readonly filesystem: FileSystem,
    readonly vpc: IVpc,
}
 
/**
 * S3 --> SNS --> Lambda
 * Lambda --> S3 to EFS
 */
export class LambdaConstruct extends cdk.Construct {
    function: Function

    constructor(parent: cdk.Construct, id: string, props: LambdaConstructProps) {
        super(parent, id);

        const lambdaRole = new Role(this, id + 'LambdaRole', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com')
        });

        lambdaRole.addManagedPolicy({ managedPolicyArn: "arn:aws:iam::aws:policy/AmazonS3FullAccess" });
        lambdaRole.addManagedPolicy({ managedPolicyArn: "arn:aws:iam::aws:policy/AmazonElasticFileSystemFullAccess" });
        lambdaRole.addManagedPolicy({ managedPolicyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole" });
        lambdaRole.addToPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            resources: ['*'],
            actions: [
                'kms:*',
                'sns:Subscribe',
                'ec2:*',
                'logs:*',
                'elasticfilesystem:*',
                's3:*'
            ]
        }));

        // create lambda
        this.function = new Function(parent, id + 'Function', {
            code: props.code,
            handler: props.handler,
            runtime: props.runtime,
            filesystem: props.filesystem,
            vpc: props.vpc,
            role: lambdaRole
        });

        new cdk.CfnOutput(parent, id + 'functionArn', {
            value: this.function.functionArn,
            exportName: id + 'functionArn'
        });

    }

}
