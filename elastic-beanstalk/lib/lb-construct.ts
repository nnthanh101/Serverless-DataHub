import {Vpc, IVpc, SecurityGroup, Port, Peer} from '@aws-cdk/aws-ec2';
import {ApplicationLoadBalancer, ListenerAction, IpAddressType, ILoadBalancerV2, ApplicationListener, ApplicationProtocol, ListenerCertificate} from '@aws-cdk/aws-elasticloadbalancingv2';
import {Construct, CfnOutput, Environment} from '@aws-cdk/core';
import {HostedZone,ARecord,RecordTarget,IHostedZone} from "@aws-cdk/aws-route53";
import { LoadBalancerTarget } from '@aws-cdk/aws-route53-targets';
import { Certificate } from '@aws-cdk/aws-certificatemanager';

export interface ALBConstructProps {
  readonly vpc: IVpc;
  readonly route53HostedZone: string;
  readonly route53HostedZoneRecordName: string;
  readonly listerPort: number;
  readonly acmArn: string;
  readonly publicLoadBalancer: boolean;
  readonly tags?: {
    [key: string]: string;
  };
}

/**
 * 
 */
export class LoadBalancerConstruct extends Construct {
  readonly vpc: IVpc;
  readonly albSecurityGroup: SecurityGroup;
  readonly lb: ApplicationLoadBalancer;
  readonly hostedZone: IHostedZone;
  readonly loadBalancerListener: ApplicationListener;
  constructor(scope: Construct, id: string, props: ALBConstructProps) {
    super(scope, id);
    
    this.vpc = props.vpc;

    this.albSecurityGroup = new SecurityGroup(scope, id + '-albSG', {
      allowAllOutbound: true,
      securityGroupName: id + '-alb-sg',
      vpc: this.vpc,
    });
    this.albSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80));
    this.albSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(443));

    this.lb = new ApplicationLoadBalancer(scope, id + '-alb', {
      vpc: this.vpc,
      internetFacing: props.publicLoadBalancer,
      ipAddressType: IpAddressType.IPV4,
      securityGroup: this.albSecurityGroup // Optional - will be automatically created otherwise
    });
    
    new CfnOutput(scope, id+"ApplicationLoadBalancerDNS", {
        value: this.lb.loadBalancerDnsName,
    });
    
    if(props.route53HostedZone!=""){
        /**
        * 2. Route53
        */
       const zone = HostedZone.fromLookup(scope, id+'HostedZone', {
         domainName: props.route53HostedZone + '',
       });
       this.hostedZone=zone;
 
       let ialb: ILoadBalancerV2 = this.lb;
        
       /** @deprecated */
       // new route53.ARecord(parent, 'WWWAliasRecord', {
       //   zone,
       //   recordName: 'www.' + props.route53HostedZone,
       //   target: route53.RecordTarget.fromAlias(new LoadBalancerTarget(ialb)),
       // });
 
       new ARecord(scope, id+ 'AliasRecord', {
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
        const certificate = Certificate.fromCertificateArn(scope,id+ 'Certificate', props.acmArn);
        this.loadBalancerListener = this.lb.addListener(id+"HTTPSListener", {
          protocol: ApplicationProtocol.HTTPS,
          port: 443,
          open: true,
          defaultAction: ListenerAction.redirect({protocol: 'HTTPS', port: '443',path:'/'}), 
          certificates: [ListenerCertificate.fromCertificateManager(certificate)]
        });
  
      } else {
        this.loadBalancerListener = this.lb.addListener(id+"HTTPListener", {
          protocol: ApplicationProtocol.HTTP,
          port: 80,
          open: true,
           defaultAction: ListenerAction.redirect({protocol: 'HTTP', port: '80',path:'/' }),
          //defaultTargetGroups: [targetGrp], 
        });
  
      }
  }
}