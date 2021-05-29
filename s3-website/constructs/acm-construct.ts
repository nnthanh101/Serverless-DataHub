import { Construct } from '@aws-cdk/core';
import { DnsValidatedCertificate, DnsValidatedCertificateProps } from '@aws-cdk/aws-certificatemanager';

export class AcmConstruct extends Construct {
    newCert: DnsValidatedCertificate;
    /** Define new bucket variables here: */

    constructor(scope: Construct, id: string, props: DnsValidatedCertificateProps) {
        super(scope, id)

        function __get_cert(id: string, props: DnsValidatedCertificateProps) {

            const cert = new DnsValidatedCertificate(scope, id+'-DnsCert', props);

            return cert;
        }

        this.newCert = __get_cert(id, props);


    }
}