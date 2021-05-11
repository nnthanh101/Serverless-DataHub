import {Construct, CfnOutput, Environment}                     from '@aws-cdk/core';
import {CfnApplication, CfnEnvironment, CfnApplicationVersion} from '@aws-cdk/aws-elasticbeanstalk';
import {IBucket }                                              from '@aws-cdk/aws-s3';
import {Asset}                                                 from '@aws-cdk/aws-s3-assets' ;
import {Vpc, IVpc, SecurityGroup, InstanceClass, InstanceType, InstanceSize, AmazonLinuxImage, Port, Peer}  from '@aws-cdk/aws-ec2';
import {Role, CfnInstanceProfile, ServicePrincipal, PolicyStatement}            from '@aws-cdk/aws-iam';
import {ApplicationLoadBalancer, ListenerAction}               from '@aws-cdk/aws-elasticloadbalancingv2';
import { applicationMetaData }                                 from '../config/config';

import fs = require('fs');

/**
 * 
 */
export interface EBConstructProps {
  readonly vpc: IVpc;
  readonly elbApplication: CfnApplication | null;
  readonly appName: string;
  readonly albSecurityGroup: SecurityGroup;
  readonly pathSourceZIP: string;
  readonly platforms: string;
  readonly description: string;
  readonly optionsOthers: string[][]
  readonly pathConfigStatic: string;
  readonly tags?: {
    [key: string]: string;
  };
}


/**
 * FIXME
 * AutoScaling
 * JSON
 */
export class ElasticBeanstalkConstruct extends Construct {
  readonly vpc: IVpc;
  readonly elbApp: CfnApplication;
  readonly elbEnv: CfnEnvironment;
  readonly elbAppVer: CfnApplicationVersion;
  readonly instanceSecurityGroup: SecurityGroup;
  readonly s3artifact: IBucket;
  constructor(scope: Construct, id: string, props: EBConstructProps) {
    super(scope, id);
    
    this.vpc = props.vpc;
    
    // Construct an S3 asset from the ZIP located from directory up.cd
    const elbZipArchive = new Asset(scope, id+'-AppZip', {
      path: props.pathSourceZIP
    });
    
    this.s3artifact = elbZipArchive.bucket;
    new CfnOutput(scope, id+'-S3BucketSourceCode', { value: elbZipArchive.s3BucketName })

    if(props.elbApplication === null){
      this.elbApp = new CfnApplication(scope, id+'-Application', {
        applicationName: props.appName,
      });
    }else{
      this.elbApp = props.elbApplication;
    }

    const ebServiceRole = new Role(scope, id+'-CustomEBServiceRole', {
      assumedBy: new ServicePrincipal('elasticbeanstalk.amazonaws.com'),
    });

    ebServiceRole.addToPolicy(new PolicyStatement({
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


    // This is the role that your application will assume
    const ebRole = new Role(scope, id+'-CustomEBRole', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
    });

    ebRole.addToPolicy(new PolicyStatement({
            resources: ['*'],
            actions: [
                'elasticbeanstalk:*',
                'autoscaling:*',
                'elasticloadbalancing:*',
                'rds:*',
                's3:*',
                'cloudwatch:*',
                'cloudformation:*',
                'logs:*'
            ],
          }));

    // This is the Instance Profile which will allow the application to use the above role
    const ebInstanceProfile = new CfnInstanceProfile(scope, id+'-CustomEBInstanceProfile', {
      roles: [ebRole.roleName],
    });

    
    this.instanceSecurityGroup = new SecurityGroup(scope, id+'-instanceEBSecurityGroup', {
      allowAllOutbound: true,
      securityGroupName: id+'-ins-sg',
      vpc: this.vpc,
    });
    this.instanceSecurityGroup.addIngressRule(props.albSecurityGroup, Port.tcp(80));
    
    
    const json = fs.readFileSync(props.pathConfigStatic, 'utf8');
    const loadConfig = JSON.parse(json.toString().replace(/(\r\n|\n|\r|\s)/gm, "")) as CfnEnvironment.OptionSettingProperty[];

    const optionSettingProperties: CfnEnvironment.OptionSettingProperty[] = [
      ...loadConfig,
      {
          namespace: 'aws:autoscaling:launchconfiguration',
          optionName: 'SecurityGroups',
          value: this.instanceSecurityGroup.securityGroupId,
      },
      {
        namespace: 'aws:autoscaling:launchconfiguration',
        optionName: 'IamInstanceProfile',
        // Here you could reference an instance profile by ARN (e.g. myIamInstanceProfile.attrArn)
        // For the default setup, leave this as is (it is assumed this role exists)
        // https://stackoverflow.com/a/55033663/6894670
        value: ebInstanceProfile.attrArn,
      },
      {
        namespace: 'aws:elasticbeanstalk:environment',
        optionName: 'ServiceRole',
        // Here you could reference an instance profile by ARN (e.g. myIamInstanceProfile.attrArn)
        // For the default setup, leave this as is (it is assumed this role exists)
        // https://stackoverflow.com/a/55033663/6894670
        value: ebServiceRole.roleArn,
      },
      
      //Config extend
      ...props.optionsOthers.map(([namespace, optionName, value]) => ({
        namespace,
        optionName,
        value,
      })),
    ];


    // Create an app version from the S3 asset defined above
    // The S3 "putObject" will occur first before CF generates the template
    this.elbAppVer = new CfnApplicationVersion(scope, id+'-AppVersion', {
      applicationName: props.appName,
      sourceBundle: {
          s3Bucket: elbZipArchive.s3BucketName,
          s3Key: elbZipArchive.s3ObjectKey,
      },
    }); 

    // eslint-disable-next-line @typescript-eslint/no-unused-vars  aws elasticbeanstalk list-available-solution-stacks (command)
    this.elbEnv = new CfnEnvironment(scope, id+'-Env', {
      environmentName: id+'-Env',
      applicationName: this.elbApp.applicationName||'',
      solutionStackName: props.platforms,
      optionSettings: optionSettingProperties,
      // cnamePrefix:'ep',
      description:props.description,
      // This line is critical - reference the label created in this same stack
      versionLabel: this.elbAppVer.ref,
    });
    // Also very important - make sure that `app` exists before creating an app version
    this.elbAppVer.addDependsOn(this.elbApp);
  
  new CfnOutput(this, id+'-EndpointUrl', { value: this.elbEnv.attrEndpointUrl })
  }
  
}