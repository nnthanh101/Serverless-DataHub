import { StackProps, Stack, Construct, App }  from '@aws-cdk/core';
import { applicationMetaData } from '../config/config';
import { VpcConstruct } from './vpc-construct';
// import { VpcNoNatConstruct } from './vpc-no-nat-construct';
import { RDSMySQLConstruct } from './rds-construct';
import { LoadBalancerConstruct } from './lb-construct';
import { ElasticBeanstalkConstruct } from './elastic-beanstalk-construct';
import { CicdPipelineConstruct } from './cicd-pipeline-construct';
import { Cloud9Construct } from './cloud9-construct';

export class ElasticBeanstalkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    
    /** 1.1. VpcConstruct: NAT-Gateway >= 1 */
    const vpc = new VpcConstruct(this, applicationMetaData.vpcConstructId, {
        maxAzs: applicationMetaData.maxAzs,
        cidr: applicationMetaData.cidr,
        ports: applicationMetaData.publicPorts,
        natGateways: applicationMetaData.natGateways,
        useDefaultVpc: applicationMetaData.useDefaultVpc,
        vpcId: applicationMetaData.vpcId,
        useExistVpc: applicationMetaData.useExistVpc
    });
    
    /** 1.2. VpcNoNatConstruct: NAT-Gateway == 0 */
    // const vpc = new VpcNoNatConstruct(this, applicationMetaData.vpcConstructId, {
    //   maxAzs: applicationMetaData.maxAzs,
    //   cidr: applicationMetaData.cidr,
    //   ports: applicationMetaData.publicPorts,
    //   natGateways: applicationMetaData.natGateways,
    //   useDefaultVpc: applicationMetaData.useDefaultVpc,
    //   vpcId: applicationMetaData.vpcId,
    //   useExistVpc: applicationMetaData.useExistVpc
    // });
    
    /** 2. Cloud9 Development Environment  */
    const c9Env = new Cloud9Construct(this, id + '-C9', {
          vpc: vpc.vpc
    });

    /** 3. RDS */
    const rdsmysql =  new RDSMySQLConstruct(this, id + '-MysqlRDS', {
      vpc:                 vpc.vpc,
      rdsInstanceName:     applicationMetaData.RDS_INSTANCE_NAME,
      rdsCredentiallUser:  applicationMetaData.RDS_CREDENTIAL_USERNAME,
      rdsCredentialPass:   applicationMetaData.RDS_CREDENTIAL_PAWSSWORD,
      rdsDatabaseName:     applicationMetaData.RDS_DATABASE_NAME,
      allocatedStorage:    applicationMetaData.RDS_ALLOCATED_STORAGE,
      maxAllocatedStorage: applicationMetaData.RDS_MAX_ALLOCATED_STORAGE
    });

    /** 4. Application Load Balancer */
    const loadbalancer =  new LoadBalancerConstruct(this, id + '-LB', {
      vpc: vpc.vpc
    });
    
    /** https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options-general.html */
    const configDynamic = [
        ['aws:elasticbeanstalk:application:environment', 'JDBC_PWD'                ,applicationMetaData.RDS_CREDENTIAL_PAWSSWORD],
        ['aws:elasticbeanstalk:application:environment', 'JDBC_UID'                ,applicationMetaData.RDS_CREDENTIAL_USERNAME],
        ['aws:elasticbeanstalk:application:environment', 'JDBC_CONNECTION_STRING'  ,rdsmysql.jdbcConnection],
        /** Config use VPC */
        ['aws:ec2:vpc'                                 , 'VPCId'                   ,vpc.vpc.vpcId],
        ['aws:ec2:vpc'                                 , 'ELBSubnets'              ,vpc.vpc.publicSubnets.map(value => value.subnetId).join(',')],
        ['aws:ec2:vpc'                                 , 'Subnets'                 ,vpc.vpc.privateSubnets.map(value => value.subnetId).join(',')],
        /** Config use Shared Load Balancer */
        ['aws:elasticbeanstalk:environment'            , 'LoadBalancerType'        ,'application'],
        ['aws:elasticbeanstalk:environment'            , 'LoadBalancerIsShared'    ,'true'],
        ['aws:elbv2:loadbalancer'                      , 'SharedLoadBalancer'      ,loadbalancer.lb.loadBalancerArn],
        ['aws:elbv2:loadbalancer'                      , 'SecurityGroups'          ,loadbalancer.albSecurityGroup.securityGroupId],
        /** Config EC2 key-pair to securely log into your EC2 instance. */
        // ['aws:autoscaling:launchconfiguration'         , 'EC2KeyName'             ,'asg-ec2-keypair'],

    ];
  
    /** 5. ElasticBeanstalk Tomcat */
    const elasticBeanstalk = new ElasticBeanstalkConstruct(this, id + '-EB', {
      vpc:               vpc.vpc,
      elbApplication:    null,
      albSecurityGroup:  loadbalancer.albSecurityGroup,
      pathSourceZIP:     applicationMetaData.EB_PATH_SOURCE_ZIP,
      platforms:         applicationMetaData.EB_PLATFORMS,
      description:       applicationMetaData.EB_DESCRIPTION,
      optionsOthers:     configDynamic,
      pathConfigStatic:  applicationMetaData.EB_PATH_CONFIG_JSON,
    });

    /** 6. CI/CD CodePipeline */
    const cicd = new CicdPipelineConstruct(this, id + '-Cicd', {
          applicationName: elasticBeanstalk.elbApp.applicationName || '',
          environmentName: elasticBeanstalk.elbEnv.environmentName || '',
          s3artifact:      elasticBeanstalk.s3artifact,
          repoName:        'SpringBootWithTomcat'
    });

    
  }}
