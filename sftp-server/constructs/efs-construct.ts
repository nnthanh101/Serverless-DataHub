import * as cdk from "@aws-cdk/core";
import {
    Vpc, IVpc, SecurityGroup, SubnetType, GatewayVpcEndpointAwsService,
    ISecurityGroup, SubnetSelection, IInterfaceVpcEndpointService, InterfaceVpcEndpoint, Peer, Port
} from "@aws-cdk/aws-ec2";
import { AccessPoint, FileSystem } from "@aws-cdk/aws-efs";

export interface EFSConstructProps {
    readonly vpc: IVpc,
    readonly fileSystemName: string,
    readonly vpcSubnets?: SubnetSelection,
    readonly path: string
}

/**
 * S3 --> Lambda --> EFS
 */
export class EFSConstruct extends cdk.Construct {
    filesystem: FileSystem;
    accessPoint: AccessPoint;

    constructor(parent: cdk.Construct, id: string, props: EFSConstructProps) {
        super(parent, id);

        const efsSecurityGrp = new SecurityGroup(parent, id + '-efsSG', {
            allowAllOutbound: true,
            securityGroupName: id + 'efsSG',
            vpc: props.vpc,
        });

        efsSecurityGrp.addIngressRule(Peer.ipv4("0.0.0.0/0"), Port.tcp(2049), "open file sharing port");


        this.filesystem = new FileSystem(parent, id + "filesystem", {
            vpc: props.vpc,
            fileSystemName: id + "filesystem",
            vpcSubnets: {
                subnetType: SubnetType.ISOLATED,
                onePerAz: true
            },
            securityGroup: efsSecurityGrp
        });

        // create a new access point from the filesystem
        this.accessPoint = this.filesystem.addAccessPoint(id + 'accesspoint', {
            // set /mnt/sftp as the root of the access point
            path: props.path, /** ex: /lambda */
            // as /mnt/sftp does not exist in a new efs filesystem, the efs will create the directory with the following createAcl
            createAcl: {
                ownerUid: '1000',
                ownerGid: '1000',
                permissions: '777',
            },
            // enforce the POSIX identity so lambda function will access with this identity
            posixUser: {
                uid: '1000',
                gid: '1000',
            },
        });

        new cdk.CfnOutput(parent, id + 'fileSystemId', {
            value: this.filesystem.fileSystemId,
            exportName: id + 'fileSystemId'
        });

        new cdk.CfnOutput(parent, id + 'accessPointId', {
            value: this.accessPoint.accessPointId,
            exportName: id + 'accessPointId'
        });
    }

}
