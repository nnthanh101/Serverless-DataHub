import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { applicationMetaData } from '../config/config';
import * as ServerlessWebapp from '../lib/serverless-webapp-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ServerlessWebapp.ServerlessWebappStack(app, 'MyTestStack', {
      domainName: applicationMetaData.domainName,
      // FIXME #3
      // certificate: applicationMetaData.certificate,
      // table: db.table,
      // monitoring
    });
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
