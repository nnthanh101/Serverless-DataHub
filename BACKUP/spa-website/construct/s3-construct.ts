import { Construct  } from 'constructs';
// import { PolicyStatement, Effect, AnyPrincipal, Stack, App } from 'aws-cdk-lib';
import {aws_s3 as s3} from 'aws-cdk-lib';

export class S3Construct extends Construct {
    s3Bucket: s3.Bucket;
    /** Define new bucket variables here: */

    constructor( scope: Construct, id: string,props:any) {
        super(scope, id)

        /**
         * Function to create a new bucket with preset SSE AES encryption, block public read, and resource policy to deny Http access on objects. 
         */
        // function __create_bucket(id: string, bucketName : string) {
        //     const newBucket = new s3.Bucket(scope, id, {
        //         versioned: true,
        //         bucketName: bucketName,
        //         encryption: s3.BucketEncryption.S3_MANAGED,
        //         publicReadAccess: false,
        //         blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
        //     })
        //     newBucket.addToResourcePolicy(new PolicyStatement({
        //         effect: Effect.DENY,
        //         actions: ['s3:*'],
        //         resources: [newBucket.bucketArn],
        //         principals: [new AnyPrincipal()],
        //         conditions: {'Bool' : {'aws:SecureTransport': false }}
        //     }))
        //     return newBucket
        // }
        /**
         * function create bucket that allow passing bucket prop from outside
         */
        function __create_bucket(id: string) {
            
            const newBucket = new s3.Bucket(scope, id+'-bucket', props);
            
            return newBucket
        }
        /** 
         * Call function here to create a new bucket 
         * */ 
        // this.s3Bucket = __create_bucket('S3BucketId', 's3-bucket-raw');
        this.s3Bucket = __create_bucket(id);
        /** 
         * Add additional buckets below by calling the same function `__create_bucket`: 
         * 
         * i.e this.s3Bucket2 = __create_bucket('s3BucketId2', 's3-bucket-datalake')
         * */ 
        
    }
}