import { Construct, Duration, SecretValue, CfnOutput, Environment, RemovalPolicy} from '@aws-cdk/core';
import {InstanceType, InstanceClass, InstanceSize, SubnetType, Vpc, IVpc, SecurityGroup, Port, Peer} from '@aws-cdk/aws-ec2';
import {StorageType, DatabaseInstance, DatabaseInstanceEngine, LicenseModel} from '@aws-cdk/aws-rds';

export interface RDSConstructProps {
	readonly vpc: IVpc;
	readonly rdsType: string;
	readonly rdsInstanceName: string;
	readonly rdsCredentiallUser: string;
	readonly rdsCredentialPass: string;
	readonly rdsDatabaseName: string;
	readonly allocatedStorage: number;
	readonly maxAllocatedStorage: number;
	readonly port: number;
	readonly tags?: {
	  [key: string]: string;
	};
  }

/**
 * FIXME
 * Stack --> Construct
 */
export class RDSConstruct extends Construct {
	readonly vpc: IVpc;
	readonly jdbcConnection : string;
	readonly rdsSecurityGroup: SecurityGroup;
	constructor(scope: Construct, id: string, props: RDSConstructProps) {
		super(scope, id);

		// const vpc = getGetVpc(this);
		this.vpc = props.vpc;
		
		this.rdsSecurityGroup = new SecurityGroup(scope, id + '-SecurityGroup', {
			vpc: this.vpc,
			securityGroupName: id + "-SG",
			description: 'Allow http access to RDS from anywhere',
			allowAllOutbound: true,
		});
		
		
		if(props.rdsType === 'MYSQL'){
			this.rdsSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(props.port));
		
			const rdsInstance = new DatabaseInstance(scope, id +'-'+ props.rdsDatabaseName, {
				engine: DatabaseInstanceEngine.MYSQL,
				// micro database should be available on free tier
				instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
				credentials : {username:props.rdsCredentiallUser, password: SecretValue.plainText(props.rdsCredentialPass)},
				vpc: this.vpc,
				vpcPlacement: {subnetType: SubnetType.PRIVATE},
				storageType: StorageType.GP2,
				storageEncrypted: true,
				allocatedStorage: props.allocatedStorage, // GiB
				backupRetention: Duration.days(1),
				maxAllocatedStorage: props.maxAllocatedStorage, //GiB
				instanceIdentifier: props.rdsDatabaseName,
				databaseName: props.rdsDatabaseName,
				// None production we can live without multiple availability zones
				multiAz: false,
				autoMinorVersionUpgrade: false,
				securityGroups:[this.rdsSecurityGroup],
				port: props.port
			});
			this.jdbcConnection = 'jdbc:mysql://'+rdsInstance.dbInstanceEndpointAddress+':'+rdsInstance.dbInstanceEndpointPort+'/'+props.rdsDatabaseName+'?useSSL=false&autoReconnect=true';
		
		} else if(props.rdsType === 'POSTGRESQL'){
			
			this.rdsSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(props.port));
		
			const rdsInstance = new DatabaseInstance(scope, id +'-'+ props.rdsDatabaseName, {
				engine: DatabaseInstanceEngine.POSTGRES,
				// micro database should be available on free tier
				instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
				credentials : {username:props.rdsCredentiallUser, password: SecretValue.plainText(props.rdsCredentialPass)},
				vpc: this.vpc,
				vpcPlacement: {subnetType: SubnetType.PRIVATE},
				storageType: StorageType.GP2,
				storageEncrypted: true,
				allocatedStorage: props.allocatedStorage, // GiB
				backupRetention: Duration.days(1),
				maxAllocatedStorage: props.maxAllocatedStorage, //GiB
				instanceIdentifier: props.rdsDatabaseName,
				databaseName: props.rdsDatabaseName,
				// None production we can live without multiple availability zones
				multiAz: false,
				autoMinorVersionUpgrade: false,
				securityGroups:[this.rdsSecurityGroup],
				port: props.port
			});
			this.jdbcConnection = 'jdbc:postgresql://'+rdsInstance.dbInstanceEndpointAddress+':'+rdsInstance.dbInstanceEndpointPort+'/'+props.rdsDatabaseName;
		
		}
		
		
		new CfnOutput(this, 'JDBC_CONNECTION_STRING', { value: this.jdbcConnection.toString() })
	}

}