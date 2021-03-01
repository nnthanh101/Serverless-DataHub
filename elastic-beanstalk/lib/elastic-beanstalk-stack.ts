import {Stack, Construct, CfnOutput, Environment} from '@aws-cdk/core';
import {CfnApplication, CfnEnvironment, CfnApplicationVersion} from '@aws-cdk/aws-elasticbeanstalk';
import {Asset} from '@aws-cdk/aws-s3-assets' ;
import {Vpc, IVpc, SecurityGroup, InstanceClass, InstanceType, InstanceSize, AmazonLinuxImage, Port, Peer}  from '@aws-cdk/aws-ec2';
import {Role, CfnInstanceProfile} from '@aws-cdk/aws-iam';
import {ServicePrincipal } from '@aws-cdk/aws-iam';
import {ApplicationLoadBalancer, ListenerAction} from '@aws-cdk/aws-elasticloadbalancingv2';
import {envVars } from '../config/config';
import {IBucket } from '@aws-cdk/aws-s3';

/**
 * 
 */
export interface EBStackProps {
  readonly vpc: IVpc;
  readonly elbApplication: CfnApplication | null;
  readonly alb: ApplicationLoadBalancer;
  readonly albSecurityGroup: SecurityGroup;
  readonly pathSourceZIP: string;
  readonly platforms: string;
  readonly description: string;
  readonly ec2KeyName: string;
  readonly measureName: string;
  readonly unit: string;
  readonly lowerThreshold: string;
  readonly upperThreshold: string;
  readonly minSize: string;
  readonly maxSize: string;
  readonly instanceType: string;
  readonly optionsOthers: string[][]
  readonly env?: Environment;
  readonly tags?: {
    [key: string]: string;
  };
}

/**
 * FIXME
 * AutoScaling
 * JSON
 */
export class ElasticBeanstalkStack extends Stack {
  readonly vpc: IVpc;
  readonly elbApp: CfnApplication;
  readonly elbEnv: CfnEnvironment;
  readonly elbAppVer: CfnApplicationVersion;
  readonly instanceSecurityGroup: SecurityGroup;
  readonly s3artifact: IBucket;
  constructor(scope: Construct, id: string, props: EBStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // const vpc = getGetVpc(this);
    this.vpc = props.vpc;
    
    
    // Construct an S3 asset from the ZIP located from directory up.cd
    const elbZipArchive = new Asset(this, id+'-ElbAppZip', {
      path: props.pathSourceZIP,
    });
    
    this.s3artifact = elbZipArchive.bucket;
    new CfnOutput(this, id+'-S3BucketSourceCode', { value: elbZipArchive.s3BucketName })

    const appName = envVars.EB_APP_NAME;
    if(props.elbApplication === null){
      this.elbApp = new CfnApplication(this, id+'-ELBApplication', {
        applicationName: appName,
      });
    }else{
      this.elbApp = props.elbApplication;
    }

    // This is the role that your application will assume
    const ebRole = new Role(this, id+'-CustomEBRole', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
    });

    // This is the Instance Profile which will allow the application to use the above role
    const ebInstanceProfile = new CfnInstanceProfile(this, id+'-CustomEBInstanceProfile', {
      roles: [ebRole.roleName],
    });

    
    this.instanceSecurityGroup = new SecurityGroup(this, id+'-instanceEBSecurityGroup', {
      allowAllOutbound: true,
      securityGroupName: id+'-ins-sg',
      vpc: this.vpc,
    });
    this.instanceSecurityGroup.addIngressRule(props.albSecurityGroup, Port.tcp(80));
    

    const optionSettingProperties: CfnEnvironment.OptionSettingProperty[] = [
      {
          namespace: 'aws:autoscaling:launchconfiguration',
          optionName: 'SecurityGroups',
          value: this.instanceSecurityGroup.securityGroupId,
      },
      {
        namespace: 'aws:ec2:vpc',
        optionName: 'VPCId',
        value: this.vpc.vpcId,
      },
      {
        namespace: 'aws:ec2:vpc',
        optionName: 'ELBSubnets',
        value: this.vpc.publicSubnets.map(value => value.subnetId).join(','),
      },
      {
        namespace: 'aws:ec2:vpc',
        optionName: 'Subnets',
        value: this.vpc.privateSubnets.map(value => value.subnetId).join(','),
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
          namespace: 'aws:elasticbeanstalk:container:tomcat:jvmoptions',
          optionName: 'Xms',
          value: '256m',
      },
      {
        namespace: 'aws:elasticbeanstalk:container:tomcat:jvmoptions',
        optionName: 'Xmx',
        value: '512m  ',
      },
      {
        namespace: 'aws:elasticbeanstalk:environment:proxy',
        optionName: 'ProxyServer',
        value: 'apache',
      },
      { namespace: 'aws:autoscaling:launchconfiguration',
        optionName: 'EC2KeyName',
        value: props.ec2KeyName
      },
      {
          namespace: 'aws:elasticbeanstalk:environment:process:default',
          optionName: 'StickinessEnabled',
          value: 'true',
      },
      
      //Loadbalance
      { namespace: 'aws:elasticbeanstalk:environment',
        optionName: 'LoadBalancerType',
        value: 'application',
      },
      { namespace: 'aws:elasticbeanstalk:environment',
        optionName: 'LoadBalancerIsShared',
        value: 'true',
      },
      { namespace: 'aws:elbv2:loadbalancer',
        optionName: 'SharedLoadBalancer',
        value: props.alb.loadBalancerArn,
      },
      {
          namespace: 'aws:elbv2:loadbalancer',
          optionName: 'SecurityGroups',
          value: props.albSecurityGroup.securityGroupId,
      },
      
      //Scale
      {
          namespace: 'aws:autoscaling:trigger',
          optionName: 'LowerThreshold',
          value: props.lowerThreshold,
      },
      {
          namespace: 'aws:autoscaling:trigger',
          optionName: 'MeasureName',
          value: props.measureName,
      },
      {
          namespace: 'aws:autoscaling:trigger',
          optionName: 'Unit',
          value: props.unit,
      },
      {
          namespace: 'aws:autoscaling:trigger',
          optionName: 'UpperThreshold',
          value: props.upperThreshold,
      },
      {
        namespace: 'aws:autoscaling:asg',
        optionName: 'MinSize',
        value: props.minSize,
      },
      {
        namespace: 'aws:autoscaling:asg',
        optionName: 'MaxSize',
        value: props.maxSize,
      },
      {
        namespace: 'aws:autoscaling:launchconfiguration',
        optionName: 'InstanceType',
        value: props.instanceType,
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
    this.elbAppVer = new CfnApplicationVersion(this, id+'-EBAppVersion', {
      applicationName: appName,
      sourceBundle: {
          s3Bucket: elbZipArchive.s3BucketName,
          s3Key: elbZipArchive.s3ObjectKey,
      },
    }); 

    // eslint-disable-next-line @typescript-eslint/no-unused-vars  aws elasticbeanstalk list-available-solution-stacks (command)
    this.elbEnv = new CfnEnvironment(this, id+'-EBEnvironment', {
      environmentName: id+'-EBEnvironment',
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