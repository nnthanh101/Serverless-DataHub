import { StackProps, Stack, Construct, App }    from '@aws-cdk/core';
import { applicationMetaData }                  from '../config/config';
import { VpcConstruct }                         from '../constructs/vpc-construct';
// import { VpcNoNatConstruct } from './vpc-no-nat-construct';
import { RDSConstruct }                         from '../constructs/rds-construct';
import { ApplicationLoadBalancerConstruct }     from '../constructs/alb-construct';
import { ElasticBeanstalkConstruct }            from '../constructs/elastic-beanstalk-construct';
import { CicdPipelineConstruct }                from '../constructs/cicd-pipeline-construct';
import { Cloud9Construct }                      from '../constructs/cloud9-construct';

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

    /** 3 RDS MySQL */
    const rdsmysql =  new RDSConstruct(this, id + '-MysqlRDS', {
      vpc:                 vpc.vpc,
      rdsType:             'MYSQL',
      rdsInstanceName:     applicationMetaData.RDS_MYSQL_INSTANCE_NAME,
      rdsCredentiallUser:  applicationMetaData.RDS_MYSQL_CREDENTIAL_USERNAME,
      rdsCredentialPass:   applicationMetaData.RDS_MYSQL_CREDENTIAL_PAWSSWORD,
      rdsDatabaseName:     applicationMetaData.RDS_MYSQL_DATABASE_NAME,
      allocatedStorage:    applicationMetaData.RDS_MYSQL_ALLOCATED_STORAGE,
      maxAllocatedStorage: applicationMetaData.RDS_MYSQL_MAX_ALLOCATED_STORAGE,
      port:                applicationMetaData.RDS_MYSQL_PORT
    });

    /** 4. Application Load Balancer */
    const loadbalancer =  new ApplicationLoadBalancerConstruct(this, id + '-LB', {
      vpc: vpc.vpc,
      route53HostedZone:           applicationMetaData.route53HostedZone,
      route53HostedZoneRecordName: applicationMetaData.route53HostedZoneRecordName,
      listerPort:                  applicationMetaData.listenerPort,
      acmArn:                      applicationMetaData.acmArn || '',
      publicLoadBalancer:          applicationMetaData.publicLoadBalancer
    });
    
  
    /** 5. ElasticBeanstalk Springboot */
    /** https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options-general.html */
    const configDynamicSpringBoot = [
        ['aws:elasticbeanstalk:application:environment'                 , 'spring.datasource.password'      ,applicationMetaData.RDS_MYSQL_CREDENTIAL_PAWSSWORD],
        ['aws:elasticbeanstalk:application:environment'                 , 'spring.datasource.username'      ,applicationMetaData.RDS_MYSQL_CREDENTIAL_USERNAME],
        ['aws:elasticbeanstalk:application:environment'                 , 'spring.datasource.url'           ,rdsmysql.jdbcConnection],
        ['aws:elasticbeanstalk:application:environment'                 , 'spring.datasource.initialize'    ,'yes'],
        ['aws:elasticbeanstalk:application:environment'                 , 'spring.profiles.active'          ,'mysql'],
        ['aws:elasticbeanstalk:application:environment'                 , 'SERVER_PORT'                     ,'5000'],
        /** Config use VPC */
        ['aws:ec2:vpc'                                                  , 'VPCId'                           ,vpc.vpc.vpcId],
        ['aws:ec2:vpc'                                                  , 'ELBSubnets'                      ,vpc.vpc.publicSubnets.map(value => value.subnetId).join(',')],
        ['aws:ec2:vpc'                                                  , 'Subnets'                         ,vpc.vpc.privateSubnets.map(value => value.subnetId).join(',')],
        /** Config use Shared Load Balancer */
        ['aws:elasticbeanstalk:environment'                             , 'LoadBalancerType'                ,'application'],
        ['aws:elasticbeanstalk:environment'                             , 'LoadBalancerIsShared'            ,'true'],
        ['aws:elbv2:loadbalancer'                                       , 'SharedLoadBalancer'              ,loadbalancer.lb.loadBalancerArn],
        ['aws:elbv2:loadbalancer'                                       , 'SecurityGroups'                  ,loadbalancer.albSecurityGroup.securityGroupId],
        // ['aws:elbv2:listenerrule:tomcat'                                , 'HostHeaders'             ,applicationMetaData.route53HostedZoneRecordName + applicationMetaData.route53HostedZone],
        // ['aws:elbv2:listenerrule:springboot'                            , 'PathPatterns'            ,'/springboot/*'],
        // ['aws:elbv2:listener:80'                                        , 'Rules'                   ,'springboot'],
    ];
    const elasticBeanstalkSpringBoot = new ElasticBeanstalkConstruct(this, id + '-EBJava', {
      vpc:               vpc.vpc,
      elbApplication:    null,
      albSecurityGroup:  loadbalancer.albSecurityGroup,
      appName:           applicationMetaData.EB_APP_NAME_JAVA,
      pathSourceZIP:     applicationMetaData.EB_PATH_SOURCE_ZIP_JAVA,
      platforms:         applicationMetaData.EB_PLATFORMS_JAVA,
      description:       applicationMetaData.EB_DESCRIPTION_JAVA,
      optionsOthers:     configDynamicSpringBoot,
      pathConfigStatic:  applicationMetaData.EB_PATH_CONFIG_JSON_JAVA,
    });
    

    /** 6. CI/CD CodePipeline Springboot */
    const cicdSpringboot = new CicdPipelineConstruct(this, id + '-Cicd-SB', {
          applicationName: elasticBeanstalkSpringBoot.elbApp.applicationName || '',
          environmentName: elasticBeanstalkSpringBoot.elbEnv.environmentName || '',
          s3artifact:      elasticBeanstalkSpringBoot.s3artifact,
          repoName:        applicationMetaData.SPRINGBOOT_REPO,
          pathBuildSpec:   applicationMetaData.PATH_BUILDSPEC_SPRINGBOOT
    });

    
  }}
