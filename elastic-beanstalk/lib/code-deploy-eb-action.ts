import { PolicyStatement, IRole } from "@aws-cdk/aws-iam";
import { Artifact, IAction, ActionProperties, ActionCategory, IStage, ActionBindOptions, ActionConfig } from "@aws-cdk/aws-codepipeline";
import {IRuleTarget, RuleProps, Rule } from '@aws-cdk/aws-events';
import { Construct } from "@aws-cdk/core";

export interface ElasticBeanstalkDeployActionProps {
    actionName: string;
    ebsApplicationName: string;
    ebsEnvironmentName: string;
    input: Artifact;
    role?: IRole;
}

export class ElasticBeanstalkDeployAction implements IAction {
    readonly actionProperties: ActionProperties;
    private readonly props: ElasticBeanstalkDeployActionProps;

    constructor(props: ElasticBeanstalkDeployActionProps) {
        this.actionProperties = {
            ...props,
            category: ActionCategory.DEPLOY,
            actionName: `${props.actionName}`,
            owner: 'AWS',
            provider: 'ElasticBeanstalk',

            artifactBounds: {
                minInputs: 1,
                maxInputs: 1,
                minOutputs: 0,
                maxOutputs: 0,
            },
            inputs: [props.input],
        };
        this.props = props;
    }
    bind(scope: Construct, stage: IStage, options: ActionBindOptions): ActionConfig {
        options.bucket.grantRead(options.role);
        options.role.addToPolicy(new PolicyStatement({
            resources: ['*'],
            actions: [
                'elasticbeanstalk:*',
                'autoscaling:*',
                'elasticloadbalancing:*',
                'rds:*',
                's3:*',
                'cloudwatch:*',
                'cloudformation:*'
            ],
          }));
        return {
            configuration: {
                ApplicationName: this.props.ebsApplicationName,
                EnvironmentName: this.props.ebsEnvironmentName,
            },
        };
    }

    onStateChange(name: string, target?: IRuleTarget, options?: RuleProps): Rule {
        throw new Error('not supported');
    }
}