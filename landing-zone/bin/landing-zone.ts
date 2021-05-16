#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LandingZoneStack, LandingZoneStage } from '../lib/landing-zone-stack';
import {AccountType} from 'aws-bootstrap-kit';

const app = new cdk.App();

const email                     = app.node.tryGetContext("email");
const rootHostedZoneDNSName     = app.node.tryGetContext("domain_name");
const thirdPartyProviderDNSUsed = app.node.tryGetContext("third_party_provider_dns_used");
const forceEmailVerification    = app.node.tryGetContext("force_email_verification");
const pipelineDeployableRegions = app.node.tryGetContext("pipeline_deployable_regions");

const nestedOU = [
  {
      name: 'SharedServices',
      accounts: [
          {
              name: 'CICD',
              type: AccountType.CICD
          }
      ]
  },
  {
      name: 'SDLC',
      accounts: [
          {
              name: 'Dev',
              type: AccountType.PLAYGROUND
          },
          {
              name: 'Staging',
              type: AccountType.STAGE,
              stageName: 'staging',
              stageOrder: 1,
              hostedServices: ['ALL']
          }
      ]
  },
  {
      name: 'Prod',
      accounts: [
          {
              name: 'Prod',
              type: AccountType.STAGE,
              stageName: 'prod',
              stageOrder: 2,
              hostedServices: ['ALL']
          }
      ]
  }
];

new LandingZoneStage(app, 'Prod',{
  email,
  forceEmailVerification,
  nestedOU,
  rootHostedZoneDNSName,
  thirdPartyProviderDNSUsed
});

new LandingZoneStack(app, 'LandingZoneStack', {
  email,
  forceEmailVerification,
  pipelineDeployableRegions,
  nestedOU,
  rootHostedZoneDNSName,
  thirdPartyProviderDNSUsed
});
