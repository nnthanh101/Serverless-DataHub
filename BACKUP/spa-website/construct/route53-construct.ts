import { Construct  } from 'constructs';
import { aws_route53 as route53 } from 'aws-cdk-lib';

export class Route53Construct extends Construct {
    newHostedZone : route53.IHostedZone;
    /** Define new bucket variables here: */

    constructor( scope: Construct, id: string,props:route53.HostedZoneProviderProps) {
        super(scope, id)

        function __get_hostedzone(id: string,props:route53.HostedZoneProviderProps) {
             
            const hostedZone = route53.HostedZone.fromLookup(scope, id+'-HostedZone', props);

            return hostedZone;
        }

        this.newHostedZone=__get_hostedzone(id,props);

    }
}