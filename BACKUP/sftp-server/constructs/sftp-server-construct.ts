import { CfnServer } from "@aws-cdk/aws-transfer";
import * as cdk from "@aws-cdk/core";


export interface SftpServerConstructProps {
  readonly  endpointType: string,
  readonly  endpointDetails:  CfnServer.EndpointDetailsProperty
}
 
export class SftpServerConstruct extends cdk.Construct {
    server:CfnServer;

    constructor(parent: cdk.Construct, id: string, props: SftpServerConstructProps) {
        super(parent, id);
 
        this.server = new CfnServer(parent, id + "SftpServer", {
            endpointType: props.endpointType, // "VPC_ENDPOINT",
            // endpointDetails: props.endpointDetails,
            domain: "S3" // "EFS"
          });

        new cdk.CfnOutput(parent, id + 'serverlogicalId', {
            value: this.server.logicalId,
            exportName: id + 'serverlogicalId'
        });

    }

}
