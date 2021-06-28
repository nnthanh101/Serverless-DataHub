import * as cdk from '@aws-cdk/core';
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';

/**
 * Interface that downstream stacks expect to monitoring subsystem.
 */
export interface IMonitoring {
  addGraphs(title: string, ...widgets: cloudwatch.IWidget[]): void;
}

/**
 * Class with monitoring facilities.
 */
export class MonitoringStack extends cdk.Stack implements IMonitoring {
  private dashboard: cloudwatch.Dashboard;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.dashboard = new cloudwatch.Dashboard(this, 'Serverless-Webapp Dashboard');
  }

  public addGraphs(title: string, ...widgets: cloudwatch.IWidget[]): void {
    this.dashboard.addWidgets(new cloudwatch.TextWidget({
      markdown: `# ${title}`,
    }));
    this.dashboard.addWidgets(...widgets);
  }

}