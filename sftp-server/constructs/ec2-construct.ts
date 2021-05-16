 
import { AmazonLinuxImage, CfnInstance, InstanceClass, InstanceSize, InstanceType } from "@aws-cdk/aws-ec2";
import { CfnInstanceProfile, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import { Bucket, BucketEncryption, EventType } from "@aws-cdk/aws-s3";
import { SnsDestination } from "@aws-cdk/aws-s3-notifications";
import { ITopic } from "@aws-cdk/aws-sns";
import * as cdk from "@aws-cdk/core";


export interface EC2ConstructProps {
   readonly imageId: string ,
   readonly instanceType: string,
   readonly networkInterfaces: cdk.IResolvable | (CfnInstance.NetworkInterfaceProperty | cdk.IResolvable)[],
   readonly userData: string, 
}

/**
 * EC2 in Isolated-Subnet
 * System Manager >> Session Manager
 */
export class EC2Construct extends cdk.Construct {

    constructor(parent: cdk.Construct, id: string, props: EC2ConstructProps) {
        super(parent, id);
 
        const ec2role = new Role(parent, id + 'ec2Role', {
            assumedBy: new ServicePrincipal('ec2.amazonaws.com')
          });
      
          ec2role.addManagedPolicy({ managedPolicyArn: "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore" })
          //create a profile to attch the role to the instance
          const profile = new CfnInstanceProfile(parent, `${id}Profile`, {
            roles: [ec2role.roleName]
          });
      
          const instance = new CfnInstance(parent, id + "ec2ins", {
            imageId: props.imageId,
            instanceType: props.instanceType,
            networkInterfaces: props.networkInterfaces,
            userData: props.userData,
            iamInstanceProfile: profile.ref 
          });
 
        new cdk.CfnOutput(parent, id + 'ec2ref', {
            value: instance.ref,
            exportName: id + 'ec2ref'
        });

    }

}
