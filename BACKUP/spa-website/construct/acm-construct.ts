import { Construct } from 'constructs';
import { aws_certificatemanager as cert } from 'aws-cdk-lib';

export class AcmConstruct extends Construct {
    newCert: cert.DnsValidatedCertificate;
    /** Define new bucket variables here: */

    constructor(scope: Construct, id: string, props: cert.DnsValidatedCertificateProps) {
        super(scope, id)

        function __get_cert(id: string, props: cert.DnsValidatedCertificateProps) {

            const certtificate = new cert.DnsValidatedCertificate(scope, id+'-DnsCert', props);

            return certtificate;
        }

        this.newCert = __get_cert(id, props);


    }
}