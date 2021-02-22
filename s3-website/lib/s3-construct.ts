import { Construct  } from '@aws-cdk/core';
import { PolicyStatement, Effect, AnyPrincipal } from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';

export class S3Construct extends Construct {
    s3Bucket: s3.Bucket;
    /** Define new bucket variables here: */

    constructor( scope: Construct, id: string) {
        super(scope, id)

        /**
         * Function to create a new bucket with preset SSE AES encryption, block public read, and resource policy to deny Http access on objects. 
         */
        function __create_bucket(id: string, bucketName : string) {
            const newBucket = new s3.Bucket(scope, id, {
                versioned: true,
                bucketName: bucketName,
                encryption: s3.BucketEncryption.S3_MANAGED,
                publicReadAccess: false,
                blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
            })
            newBucket.addToResourcePolicy(new PolicyStatement({
                effect: Effect.DENY,
                actions: ['s3:*'],
                resources: [newBucket.bucketArn],
                principals: [new AnyPrincipal()],
                conditions: {'Bool' : {'aws:SecureTransport': false }}
            }))
            return newBucket
        }
        /** 
         * Call function here to create a new bucket 
         * */ 
        this.s3Bucket = __create_bucket('S3BucketId', 's3-bucket-raw');

        /** 
         * Add additional buckets below by calling the same function `__create_bucket`: 
         * 
         * i.e this.s3Bucket2 = __create_bucket('s3BucketId2', 's3-bucket-datalake')
         * */ 
        
    }
}