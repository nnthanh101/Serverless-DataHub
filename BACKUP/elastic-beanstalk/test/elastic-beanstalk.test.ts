import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as ElasticBeanstalk from '../lib/elastic-beanstalk-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new ElasticBeanstalk.ElasticBeanstalkStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
