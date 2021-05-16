import * as cdk from '@aws-cdk/core';

import {  CfnUser } from "@aws-cdk/aws-transfer";
import {  BucketEncryption } from "@aws-cdk/aws-s3";
import { CfnInstanceProfile, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { Secret } from "@aws-cdk/aws-secretsmanager";
import { Fn, Stack } from "@aws-cdk/core";
import { AssetCode,  Runtime, FileSystem as lbFS } from '@aws-cdk/aws-lambda';
import { LambdaSubscription } from '@aws-cdk/aws-sns-subscriptions';
import { SubnetType, InstanceType,
  AmazonLinuxImage, InstanceClass, InstanceSize, UserData
} from "@aws-cdk/aws-ec2";
import { VpcNoNatConstruct } from "../../../DevAx/sftp-server/constructs/vpc-no-nat-construct"; 
import { VpcEndpointConstruct } from "../constructs/vpc-endpoint-construct";
import { EFSConstruct } from "../constructs/efs-construct";
import { LambdaConstruct } from "../constructs/lambda";
import { SNSConstruct } from "../constructs/sns-construct";
import { SftpServerConstruct } from "../constructs/sftp-server-construct";
import { S3Construct } from "../../../DevAx/sftp-server/constructs/s3-construct";
// import { EC2Construct } from "../constructs/ec2-construct";
// import { Ec2Environment } from "@aws-cdk/aws-cloud9";

import { applicationMetaData } from "../config/config";

const keygen = require("ssh-keygen");

export class SftpServerStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
 
    /** 1. VPC NO NatGateway */
    const vpc = new VpcNoNatConstruct(this, applicationMetaData.vpcConstructId, {
      maxAzs:         applicationMetaData.maxAzs,
      cidr:           applicationMetaData.cidr,
      ports:          applicationMetaData.publicPorts,
      natGateways:    applicationMetaData.natGateways,
      useDefaultVpc:  applicationMetaData.useDefaultVpc,
      vpcId:          applicationMetaData.vpcId,
      useExistVpc:    applicationMetaData.useExistVpc
    }).vpc;
 
    // /** 2. .ssm & .ssmmessages */
    // const ssmVPCE = new VpcEndpointConstruct(this, id + "ssmvpce", {
    //   service: {
    //     name:             `com.amazonaws.${Stack.of(this).region}.ssm`,
    //     port:             22
    //   },
    //   vpc:                vpc,
    //   lookupSupportedAzs: true,
    //   open:               true,
    //   privateDnsEnabled:  true,
    //   subnets: {
    //     subnetType:       SubnetType.ISOLATED,
    //     onePerAz:         true
    //   }
    // });
 
    // const ssmMessagesVPCE = new VpcEndpointConstruct(this, id + "ssmmessagesvpce", {
    //   service: {
    //     name:             `com.amazonaws.${Stack.of(this).region}.ssmmessages`,
    //     port:             22
    //   },
    //   vpc:                vpc,
    //   lookupSupportedAzs: true,
    //   open:               true,
    //   privateDnsEnabled:  true,
    //   subnets: {
    //     subnetType:       SubnetType.ISOLATED,
    //     onePerAz:         true
    //   }
    // });
 
    // /** 3. .transfer & transfer.server */
    // const transferVPCE = new VpcEndpointConstruct(this, id + "transfervpce", {
    //   service: {
    //     name:             `com.amazonaws.${Stack.of(this).region}.transfer`,
    //     port:             22
    //   },
    //   vpc:                vpc,
    //   lookupSupportedAzs: true,
    //   open:               true,
    //   privateDnsEnabled:  true,
    //   subnets: {
    //     subnetType:       SubnetType.ISOLATED,
    //     onePerAz:         true
    //   }
    // });
 
    // const transferServerVPCE = new VpcEndpointConstruct(this, id + "transferservervpce", {
    //   service: {
    //     name: `com.amazonaws.${Stack.of(this).region}.transfer.server`,
    //     port: 22
    //   },
    //   vpc: vpc,
    //   lookupSupportedAzs: true,
    //   open: true,
    //   privateDnsEnabled: true,
    //   subnets: {
    //     subnetType: SubnetType.ISOLATED,
    //     onePerAz: true
    //   }
    // });
 
    /** 4. add file system to Lambda */
    const efs = new EFSConstruct(this, id + "efsfilesystem", {
      vpc: vpc,
      fileSystemName: "transferFamilyEFS",
      vpcSubnets: {
        subnetType: SubnetType.ISOLATED,
        onePerAz: true
      },
      path: "/lambda"
    });
 
    /** 5. create lambda function */
    const S3toEFSCopyFunction = new LambdaConstruct(this, id + 'Function', {
      code: new AssetCode('lambda/S3toEFSCopy'),
      handler: 'index.lambda_handler',
      runtime: Runtime.PYTHON_3_7,
      filesystem: lbFS.fromEfsAccessPoint(efs.accessPoint, '/mnt/lambda'),
      vpc: vpc,
    }).function;


    /** 6. sns */
    const topic = new SNSConstruct(this, id + 'Topic', {
      displayName: 'Customer subscription topic',
      subscription: new LambdaSubscription(S3toEFSCopyFunction)
    });
 
    /** 7. Create new Transfer Family Server >> SFTP */
    const sftpServer = new SftpServerConstruct(this, id + "SftpServer", {
      endpointType: "PUBLIC", // "VPC", "VPC_ENDPOINT"
      endpointDetails: {
        // vpcId:vpc.vpcId,
        // vpcEndpointId: transferServerVPCE.vpce.vpcEndpointId
      }
    });

    /**
     * 8. create S3 bucket that will be mapped to the user.
     * this is where the SFTP files will be synced to.
     */
    const sftpBucket = new S3Construct(this, id + "sftpBucket", {
      bucketName: id + "bucket",
      encryption: BucketEncryption.KMS,
      bucketKeyEnabled: true,
      enforceSSL: true,
      topic: topic.topic
    });
 
    // create a new role that has trust established for the transfer family service
    const transferFamilyBucketAccessRole = new Role(
      this,
      id + "BucketAccessRole",
      {
        roleName: "SFTPBucketAccessRole",
        assumedBy: new ServicePrincipal("transfer.amazonaws.com"),
      }
    );

    // grant access to the S3 bucket
    sftpBucket.bucket.grantReadWrite(transferFamilyBucketAccessRole);
 
    // define a user data script to install & launch our web server 
    const ssmaUserData = UserData.forLinux();
    // make sure the latest SSM Agent is installed.

    ssmaUserData.addCommands(`sudo yum install -y amazon-efs-utils`);
    ssmaUserData.addCommands(`cd ~`, `mkdir efs`, `sudo mount -t efs -o tls ${efs.filesystem.fileSystemId}:/ efs`);

    const sftpUserName = "sftp_user";
    this.generateSSHKeys(sftpUserName).then((keys: any) => {
      const publicKey = keys.publicKey;
      const privateKey = keys.privateKey;

      console.log("Public key: " + publicKey);
      console.log("Private key: " + privateKey);
      // create SFTP user
      const sftpUser = new CfnUser(this, "UserForSFTP", {
        userName: sftpUserName,
        serverId: sftpServer.server.attrServerId,
        role: transferFamilyBucketAccessRole.roleArn,
        homeDirectory: `/${sftpBucket.bucket.bucketName}`,
        sshPublicKeys: [publicKey],
      });

      const privateKeySecret = new Secret(this, "SftpCredential", {
        generateSecretString: {
          secretStringTemplate: JSON.stringify({
            username: sftpUserName,
            privateKeyBase64: Buffer.from(privateKey, "binary").toString(
              "base64"
            ),
          }),
          generateStringKey: "password",
        },
      });

      ssmaUserData.addCommands(`cd ~`, `cat <<EOT >> sftpkey \n
      ${privateKey} \n
      EOT`);

    });


  //   const instance = new EC2Construct(this, id + "ec2ins", {
  //     imageId: new AmazonLinuxImage().getImage(this).imageId,
  //     instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO).toString(),
  //     networkInterfaces: [
  //       {
  //         deviceIndex: "0",
  //         subnetId: vpc.isolatedSubnets[0].subnetId
  //       }
  //     ],
  //     userData: Fn.base64(ssmaUserData.render()), 
  //   });
 
  //   const c9env = new Ec2Environment(this, 'Cloud9-IDE', {
  //     vpc,
  //     subnetSelection: {
  //       subnetType: SubnetType.PUBLIC
  //     },
  //     instanceType: new InstanceType('t3.micro'),
  // });

  }

  /**
   * Generate SSH keypair
   * @param testUserName user name to be used in the comment in public key
   * @returns public and private keys
   */
  public generateSSHKeys = (testUserName: string) => {
    return new Promise(function (resolve, reject) {
      keygen(
        {
          comment: testUserName,
          read: true,
          format: "PEM",
        },
        function (err: any, out: any) {
          if (err) {
            reject(err);
          }
          resolve({ publicKey: out.pubKey, privateKey: out.key });
        }
      );
    });
  };
}
