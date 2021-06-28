import { Construct  } from '@aws-cdk/core';
import { HostedZone, HostedZoneProviderProps, IHostedZone } from '@aws-cdk/aws-route53';

export class Route53Construct extends Construct {
    newHostedZone : IHostedZone;
    /** Define new bucket variables here: */

    constructor( scope: Construct, id: string,props:HostedZoneProviderProps) {
        super(scope, id)

        function __get_hostedzone(id: string,props:HostedZoneProviderProps) {
             
            const hostedZone = HostedZone.fromLookup(scope, id+'-HostedZone', props);

            return hostedZone;
        }

        this.newHostedZone=__get_hostedzone(id,props);

    }
}