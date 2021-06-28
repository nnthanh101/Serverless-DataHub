import {
    aws_cloudfront          as cloudfront,
    aws_route53             as route53,
    aws_certificatemanager  as certificate,
    aws_route53_targets     as route53_targets,
    aws_route53_patterns    as route53_patterns,
    aws_iam                 as iam,
    aws_s3                  as s3,
    aws_s3_deployment       as s3_deploy,
    CfnOutput
  } from 'aws-cdk-lib';
import { Construct  } from 'constructs';
import { S3Construct } from './s3-construct';
import { Route53Construct } from './route53-construct';
import { AcmConstruct } from './acm-construct';
import { CloudfrontConstruct } from './cloudfront-construct';
  
  export interface SPADeployConfig {
    readonly indexDoc:string,
    readonly errorDoc?:string,
    readonly websiteFolder: string,
    readonly certificateARN?: string,
    readonly cfBehaviors?: cloudfront.Behavior[],
    readonly cfAliases?: string[],
    readonly exportWebsiteUrlOutput?:boolean,
    readonly exportWebsiteUrlName?: string,
    readonly blockPublicAccess?:s3.BlockPublicAccess
    readonly sslMethod?: cloudfront.SSLMethod,
    readonly securityPolicy?: cloudfront.SecurityPolicyProtocol,
  }
  
  export interface HostedZoneConfig {
    readonly indexDoc:string,
    readonly errorDoc?:string,
    readonly cfBehaviors?: cloudfront.Behavior[],
    readonly websiteFolder: string,
    readonly zoneName: string,
    readonly subdomain?: string, 
  }
  
  export interface SPAGlobalConfig {
    readonly encryptBucket?:boolean,
    readonly ipFilter?:boolean,
    readonly ipList?:string[]
  }
  
  export interface SPADeployment {
    readonly websiteBucket: s3.Bucket,
  }
  
  export interface SPADeploymentWithCloudFront extends SPADeployment {
    readonly distribution: cloudfront.CloudFrontWebDistribution,
  }
  
  export class S3WebsiteConstruct extends Construct {
      globalConfig: SPAGlobalConfig;
      id: string;
  
      constructor(scope: Construct, id:string, config?:SPAGlobalConfig) {
        super(scope, id); 
        this.id=id;
  
        if (typeof config !== 'undefined') {
          this.globalConfig = config;
        } else {
          this.globalConfig = {
            encryptBucket: false,
            ipFilter: false,
          };
        }
      }
  
      /**
       * Helper method to provide a configured s3 bucket
       */
      private getS3Bucket(config:SPADeployConfig, isForCloudFront: boolean) {
        
        const bucketConfig:any = {
          websiteIndexDocument: config.indexDoc,
          websiteErrorDocument: config.errorDoc,
          publicReadAccess: true,
        };
  
        if (this.globalConfig.encryptBucket === true) {
          bucketConfig.encryption = s3.BucketEncryption.S3_MANAGED;
        }
  
        if (this.globalConfig.ipFilter === true || isForCloudFront === true) {
          bucketConfig.publicReadAccess = false;
          if (typeof config.blockPublicAccess !== 'undefined') {
            bucketConfig.blockPublicAccess = config.blockPublicAccess;
          }
        }
        
        const bucket =new S3Construct(this, this.id+'-S3construct', bucketConfig).s3Bucket;
        // const bucket = new s3.Bucket(this, this.id+'-WebsiteBucket', bucketConfig);
  
        if (this.globalConfig.ipFilter === true && isForCloudFront === false) {
          if (typeof this.globalConfig.ipList === 'undefined') {
            // this.node.addError('When IP Filter is true then the IP List is required');
          }
  
          const bucketPolicy = new iam.PolicyStatement();
          bucketPolicy.addAnyPrincipal();
          bucketPolicy.addActions('s3:GetObject');
          bucketPolicy.addResources(`${bucket.bucketArn}/*`);
          bucketPolicy.addCondition('IpAddress', {
            'aws:SourceIp': this.globalConfig.ipList,
          });
  
          bucket.addToResourcePolicy(bucketPolicy);
        }
  
        return bucket;
      }
  
      /**
       * Helper method to provide configuration for cloudfront
       */
      private getCFConfig(websiteBucket:s3.Bucket, config:any, accessIdentity: cloudfront.OriginAccessIdentity, cert?:certificate.DnsValidatedCertificate) {
        const cfConfig:any = {
          originConfigs: [
            {
              s3OriginSource: {
                s3BucketSource: websiteBucket,
                originAccessIdentity: accessIdentity,
              },
              behaviors: config.cfBehaviors ? config.cfBehaviors : [{ isDefaultBehavior: true }],
            },
          ],
          // We need to redirect all unknown routes back to index.html for angular routing to work
          errorConfigurations: [{
            errorCode: 403,
            responsePagePath: (config.errorDoc ? `/${config.errorDoc}` : `/${config.indexDoc}`),
            responseCode: 200,
          },
          {
            errorCode: 404,
            responsePagePath: (config.errorDoc ? `/${config.errorDoc}` : `/${config.indexDoc}`),
            responseCode: 200,
          }],
        }; 
  
        if (typeof config.certificateARN !== 'undefined' && typeof config.cfAliases !== 'undefined') {
          cfConfig.aliasConfiguration = {
            acmCertRef: config.certificateARN,
            names: config.cfAliases,
          };
        }
        if (typeof config.sslMethod !== 'undefined') {
          cfConfig.aliasConfiguration.sslMethod = config.sslMethod;
        }
  
        if (typeof config.securityPolicy !== 'undefined') {
          cfConfig.aliasConfiguration.securityPolicy = config.securityPolicy;
        }
  
        if (typeof config.zoneName !== 'undefined' && typeof cert !== 'undefined') {
          cfConfig.viewerCertificate = cloudfront.ViewerCertificate.fromAcmCertificate(cert, {
            aliases: [config.subdomain ? `${config.subdomain}.${config.zoneName}` : config.zoneName],

          });
        }
  
        return cfConfig;
      }
  
      /**
       * Basic setup needed for a non-ssl, non vanity url, non cached s3 website
       */
      public createBasicSite(config:SPADeployConfig): SPADeployment {
        const websiteBucket = this.getS3Bucket(config, false);
  
        new s3_deploy.BucketDeployment(this, this.id+'-BucketDeployment', {
          sources: [s3_deploy.Source.asset(config.websiteFolder)],
          destinationBucket: websiteBucket,
        });
  
        const cfnOutputConfig:any = {
          description: 'The url of the website',
          value: websiteBucket.bucketWebsiteUrl,
        };
  
        if (config.exportWebsiteUrlOutput === true) {
          if (typeof config.exportWebsiteUrlName === 'undefined' || config.exportWebsiteUrlName === '') {
            // this.node.addError('When Output URL as AWS Export property is true then the output name is required');
          }
          cfnOutputConfig.exportName = config.exportWebsiteUrlName;
        }
  
        new CfnOutput(this, this.id+'-URL', cfnOutputConfig);
  
        return { websiteBucket };
      }
  
      /**
       * This will create an s3 deployment fronted by a cloudfront distribution
       * It will also setup error forwarding and unauth forwarding back to indexDoc
       */
      public createSiteWithCloudfront(config:SPADeployConfig): SPADeploymentWithCloudFront {
        const websiteBucket = this.getS3Bucket(config, true);
        const accessIdentity = new cloudfront.OriginAccessIdentity(this, this.id+'-OriginAccessIdentity', { comment: `${websiteBucket.bucketName}-access-identity` });
        const distribution = new cloudfront.CloudFrontWebDistribution(this, this.id+'cfDistribution', this.getCFConfig(websiteBucket, config, accessIdentity));
  
        new s3_deploy.BucketDeployment(this, this.id+'-BucketDeployment', {
          sources: [s3_deploy.Source.asset(config.websiteFolder)],
          destinationBucket: websiteBucket,
          // Invalidate the cache for / and index.html when we deploy so that cloudfront serves latest site
          distribution,
          distributionPaths: ['/', `/${config.indexDoc}`],
        });
  
        new CfnOutput(this, 'cloudfront domain', {
          description: 'The domain of the website',
          value: distribution.distributionDomainName,
        });
  
        return { websiteBucket, distribution };
      }
  
      /**
       * S3 Deployment, cloudfront distribution, ssl cert and error forwarding auto
       * configured by using the details in the hosted zone provided
       */
      public createSiteFromHostedZone(config:HostedZoneConfig): SPADeploymentWithCloudFront {
        const websiteBucket = this.getS3Bucket(config, true);
        const zone = new Route53Construct(this, this.id+'-R53construct', { domainName: config.zoneName }).newHostedZone;
        // const zone = HostedZone.fromLookup(this, this.id+'-HostedZone', { domainName: config.zoneName });
        const domainName = config.subdomain ? `${config.subdomain}.${config.zoneName}` : config.zoneName;

        const cert = new AcmConstruct(this, this.id+'-AcmConstruct', {
          hostedZone: zone,
          domainName,
          region: 'us-east-1', /** cloudfront cert "MUST" created in us-east-1 */
        }).newCert;
  
        const accessIdentity = new cloudfront.OriginAccessIdentity(this, this.id+'-OriginAccessIdentity', { comment: `${websiteBucket.bucketName}-access-identity` });
        // const distribution = new CloudFrontWebDistribution(this, this.id+'CfDistribution', this.getCFConfig(websiteBucket, config, accessIdentity, cert));
        const distribution = new CloudfrontConstruct(this, this.id+'CFConstruct', this.getCFConfig(websiteBucket, config, accessIdentity, cert)).newDistribution;

        new s3_deploy.BucketDeployment(this, this.id+'-BucketDeployment', { 
          sources: [s3_deploy.Source.asset(config.websiteFolder)],
          destinationBucket: websiteBucket,
          // Invalidate the cache for / and index.html when we deploy so that cloudfront serves latest site
          distribution,
          distributionPaths: ['/', `/${config.indexDoc}`],
        });
  
        new route53.ARecord(this, this.id+'-Alias', {
          zone,
          recordName: domainName,
          target: route53.RecordTarget.fromAlias(new route53_targets.CloudFrontTarget(distribution)),
        });
  
        if (!config.subdomain) {
          new route53_patterns.HttpsRedirect(this, this.id+'-Redirect', {
              zone,
              recordNames: [`www.${config.zoneName}`],
              targetDomain: config.zoneName,
          });          
        }
  
        return { websiteBucket, distribution };
      }
  }