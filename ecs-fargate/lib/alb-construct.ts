import {Vpc, IVpc, SecurityGroup, Port, Peer} from '@aws-cdk/aws-ec2';
import {ApplicationLoadBalancer, ILoadBalancerV2, IpAddressType, ApplicationListener,ApplicationProtocol,ListenerAction,ListenerCertificate} from '@aws-cdk/aws-elasticloadbalancingv2';
import {Stack, Construct, CfnOutput, Environment} from '@aws-cdk/core';
import {HostedZone,ARecord,RecordTarget,IHostedZone} from "@aws-cdk/aws-route53";
import { LoadBalancerTarget } from '@aws-cdk/aws-route53-targets';
import { Certificate } from '@aws-cdk/aws-certificatemanager';

/**
 * 
 */
export interface ApplicationLoadBalancerConstructProps {
  readonly vpc: IVpc; 
  readonly tags?: {
    [key: string]: string;
  };

  readonly securityGrp: SecurityGroup;
  readonly route53HostedZone: string;
  readonly route53HostedZoneRecordName: string;
  readonly listerPort: number;
  readonly acmArn: string;
  readonly publicLoadBalancer: boolean;
}

export class ApplicationLoadBalancerConstruct extends Construct {
  readonly vpc: IVpc; 
  readonly alb: ApplicationLoadBalancer;
  readonly loadBalancerListener: ApplicationListener;
  readonly hostedZone: IHostedZone;
  constructor(parent: Construct, id: string, props: ApplicationLoadBalancerConstructProps) {
    super(parent, id);
     
      /**
     * 1. Application LoadBalancer
     */
    this.alb = new ApplicationLoadBalancer(
        parent,
        id + '-AlbConstruct',
        {
          vpc: props.vpc,
          internetFacing: props.publicLoadBalancer,
          ipAddressType: IpAddressType.IPV4,
          securityGroup: props.securityGrp ,
          // vpcSubnets: props.vpc.selectSubnets({
          //   subnetType: SubnetType.PUBLIC,
          // }),
          loadBalancerName: id + '-ALB',
          
        }
      );

      new CfnOutput(parent, id+"ApplicationLoadBalancerDNS", {
        value: this.alb.loadBalancerDnsName,
      });

      if(props.route53HostedZone!=""){
        /**
        * 2. Route53
        */
       const zone = HostedZone.fromLookup(parent, id+'HostedZone', {
         domainName: props.route53HostedZone + '',
       });
       this.hostedZone=zone;
 
       let ialb: ILoadBalancerV2 = this.alb;
        
       /** @deprecated */
       // new route53.ARecord(parent, 'WWWAliasRecord', {
       //   zone,
       //   recordName: 'www.' + props.route53HostedZone,
       //   target: route53.RecordTarget.fromAlias(new LoadBalancerTarget(ialb)),
       // });
 
       new ARecord(parent, id+ 'AliasRecord', {
         zone,
         recordName: props.route53HostedZoneRecordName + props.route53HostedZone,
         target: RecordTarget.fromAlias(new LoadBalancerTarget(ialb)),
       });
     }

     /**
     * 3. Application addListener
     */
    if (props.listerPort === 443) {
        /**
         * 7.1 ACM
         */
        const certificate = Certificate.fromCertificateArn(parent,id+ 'Certificate', props.acmArn);
        this.loadBalancerListener = this.alb.addListener(id+"HTTPSListener", {
          protocol: ApplicationProtocol.HTTPS,
          port: 443,
          open: true,
          defaultAction: ListenerAction.redirect({protocol: 'HTTPS', port: '443',path:'/'}), 
          certificates: [ListenerCertificate.fromCertificateManager(certificate)]
        });

        // this.alb.addListener(id+"HTTPListener", {
        //     protocol: ApplicationProtocol.HTTP,
        //     port: 80,
        //     open: true,
        //     defaultAction: ListenerAction.redirect({protocol: 'HTTPS', port: '443',path:'/web/'}), 
        //   });
  
      } else {
        this.loadBalancerListener = this.alb.addListener(id+"HTTPListener", {
          protocol: ApplicationProtocol.HTTP,
          port: 80,
          open: true,
           defaultAction: ListenerAction.redirect({protocol: 'HTTP', port: '80',path:'/beantalk/' }),
          //defaultTargetGroups: [targetGrp], 
        });

        // this.alb.addListener(id+"HTTPSListener", {
        //     protocol: ApplicationProtocol.HTTPS,
        //     port: 443,
        //     open: true,
        //     defaultAction: ListenerAction.redirect({protocol: 'HTTP', port: '80',path:'/web/'}), 
        //   });
  
      }

  }
}