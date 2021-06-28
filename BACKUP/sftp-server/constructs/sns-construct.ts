import { ITopicSubscription, Topic } from "@aws-cdk/aws-sns";

import * as cdk from "@aws-cdk/core";

export interface SNSConstructProps {
    readonly displayName: string,
    readonly subscription: ITopicSubscription
}
 
/**
 * S3 --> SNS --> Lambda
 */
export class SNSConstruct extends cdk.Construct {
    topic: Topic;

    constructor(parent: cdk.Construct, id: string, props: SNSConstructProps) {
        super(parent, id);

        this.topic = new Topic(parent, id + 'Topic', {
            displayName: props.displayName,

        });

        this.topic.addSubscription(props.subscription);

        new cdk.CfnOutput(parent, id + 'topicArn', {
            value: this.topic.topicArn,
            exportName: id + 'topicArn'
        });

    }

}
