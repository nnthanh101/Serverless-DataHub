import { Bucket, BucketEncryption, EventType } from "@aws-cdk/aws-s3";
import { SnsDestination } from "@aws-cdk/aws-s3-notifications";
import { ITopic } from "@aws-cdk/aws-sns";
import * as cdk from "@aws-cdk/core";

export interface S3ConstructProps {
    readonly bucketName: string
    readonly encryption: BucketEncryption,
    readonly bucketKeyEnabled: boolean,
    readonly enforceSSL: boolean,
    readonly topic: ITopic
}

/**
 * S3 Bucket
 */
export class S3Construct extends cdk.Construct {
    bucket: Bucket

    constructor(parent: cdk.Construct, id: string, props: S3ConstructProps) {
        super(parent, id);

        this.bucket = new Bucket(parent, id + "SFTP-Bucket", {
            bucketName: props.bucketName.toLowerCase(),
            encryption: props.encryption,
            bucketKeyEnabled: props.bucketKeyEnabled,
            enforceSSL: props.enforceSSL,
        });
 
        const snsNotification = new SnsDestination(props.topic);
        this.bucket.addEventNotification(EventType.OBJECT_CREATED, snsNotification);
        this.bucket.addEventNotification(EventType.OBJECT_REMOVED, snsNotification);

        new cdk.CfnOutput(parent, id + 'bucketArn', {
            value: this.bucket.bucketArn,
            exportName: id + 'bucketArn'
        });

    }

}
