import { StackProps, Stack, Construct, App }  from '@aws-cdk/core';
import { VpcConstruct }              from './vpc-construct';
import { RDSMySQLConstruct }         from './rds-construct';
import { LoadBalancerConstruct }         from './lb-construct';
import { ElasticBeanstalkConstruct } from './elastic-beanstalk-construct';
import { envVars }               from '../config/config';


export class ElasticBeanstalkStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    
    /** 1. VPC */
    const vpc = new VpcConstruct(this, id + '-vpc',
    {
        cidr:          envVars.VPC_CIDR,
        maxAzs:        envVars.VPC_MAX_AZ,
        natGateways:   envVars.VPC_NAT_GW,
        cidrPublic:    envVars.VPC_PUBLIC_CIDRMASK,
        cidrPrivate:   envVars.VPC_PRIVATE_CIDRMASK,
        cidrIsolated:  envVars.VPC_ISOLATED_CIDRMASK,
        useDefaultVpc: envVars.USE_DEFAULT_VPC,
        useExistVpc:   envVars.USE_EXIST_VPC,
        vpcId:         envVars.VPC_ID,
        vpcName:       envVars.VPC_NAME
    });
    
    /** 2. RDS */
    const rdsmysql =  new RDSMySQLConstruct(this, id + '-MysqlRDS', {
        vpc:                 vpc.vpc,
        rdsInstanceName:     envVars.RDS_INSTANCE_NAME,
        rdsCredentiallUser:  envVars.RDS_CREDENTIAL_USERNAME,
        rdsCredentialPass:   envVars.RDS_CREDENTIAL_PAWSSWORD,
        rdsDatabaseName:     envVars.RDS_DATABASE_NAME,
        allocatedStorage:    envVars.RDS_ALLOCATED_STORAGE,
        maxAllocatedStorage: envVars.RDS_MAX_ALLOCATED_STORAGE,
        env: {
            account: process.env.AWS_ACCOUNT, 
            region: process.env.AWS_REGION,
        }
    });
    
    /** 3. Application Loadbalancer */
    const loadbalancer =  new LoadBalancerConstruct(this, id + '-LB', {
        vpc: vpc.vpc,
        env: {
            account: process.env.AWS_ACCOUNT, 
            region: process.env.AWS_REGION,
        }
    });
    
    
    /** https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options-general.html */
    const configDynamic = [
        ['aws:elasticbeanstalk:application:environment', 'JDBC_PWD'                ,envVars.RDS_CREDENTIAL_PAWSSWORD],
        ['aws:elasticbeanstalk:application:environment', 'JDBC_UID'                ,envVars.RDS_CREDENTIAL_USERNAME],
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
    ];

    /** 4. ElasticBeanstalk Tomcat */
    const elbTomcat = new ElasticBeanstalkConstruct(this, id + '-elbTomcat', {
        elbApplication:    null,
        albSecurityGroup:  loadbalancer.albSecurityGroup,
        pathSourceZIP:     envVars.EB_PATH_SOURCE_ZIP,
        platforms:         envVars.EB_PLATFORMS,
        description:       envVars.EB_DESCRIPTION,
        optionsOthers:     configDynamic,
        pathConfigStatic:  envVars.EB_PATH_CONFIG_JSON,
        env: {
            account: process.env.AWS_ACCOUNT, 
            region:  process.env.AWS_REGION,
        }
    });
    
  }
}