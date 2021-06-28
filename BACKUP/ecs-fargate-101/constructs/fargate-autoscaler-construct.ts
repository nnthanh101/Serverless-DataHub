import * as cdk from "@aws-cdk/core";
import { ScalableTarget, ServiceNamespace, StepScalingPolicy, TargetTrackingScalingPolicy, StepScalingAction, AdjustmentType, MetricAggregationType } from '@aws-cdk/aws-applicationautoscaling';
import { Cluster, FargateService } from "@aws-cdk/aws-ecs";
import { Metric, Alarm, ComparisonOperator } from "@aws-cdk/aws-cloudwatch";
import {
  ApplicationLoadBalancer
} from "@aws-cdk/aws-elasticloadbalancingv2";
import { Duration } from "@aws-cdk/core";
import { ApplicationScalingAction } from "@aws-cdk/aws-cloudwatch-actions";

export interface FargateAutoscalerProps {
  readonly cluster: Cluster;
  readonly ecsService: FargateService;
  readonly alb: ApplicationLoadBalancer;


  readonly minCapacity: number;
  readonly maxCapacity: number;

  readonly cpuTargetValue: number; //  cpu(%) 
  readonly memoryTargetValue: number; //  Memory(%)


  //Scale Out Action Config
  readonly scaleOutCooldown: number;
  readonly scaleOutAvgPeriod: number; //second
  readonly scaleOutAvgNumber: number; //quantity number

  //Scale In Action Config
  readonly scaleInCooldown: number;
  readonly scaleInAvgPeriod: number; //second
  readonly scaleInAvgNumber: number; //quantity number

}


/**
 * Test script
 * ab -n 10000000 -c 1000 https://job4u.vn/
 */
export class FargateAutoscalerConstruct extends cdk.Construct {
  constructor(parent: cdk.Construct, name: string, props: FargateAutoscalerProps) {
    super(parent, name);

    const ecsFargateServiceScaling = new ScalableTarget(parent, name + 'ecsFargateServiceScaling', {
      scalableDimension: 'ecs:service:DesiredCount',
      minCapacity: props.minCapacity,
      maxCapacity: props.maxCapacity,
      serviceNamespace: ServiceNamespace.ECS,
      resourceId: `service/${props.cluster.clusterName}/${props.ecsService.serviceName}`
    });

    /** Scaling policy type: scale To Track Metric 
     * 
    * Desc: Auto scaling base on CPU and Memory usage metrics
    * 
    * Default Scale Out period: 3 minutes
    * Default Scale In period: 15 minutes 
    * 
    */


    // ecsFargateServiceScaling.scaleToTrackMetric('scaleCPU', {
    //   customMetric: props.ecsService.metricCpuUtilization(),
    //   targetValue:  props.cpuTargetValue,  
    //   scaleInCooldown:  cdk.Duration.minutes(props.scaleInCooldown),  
    //   scaleOutCooldown: cdk.Duration.minutes(props.scaleOutCooldown)  
    // });

    // ecsFargateServiceScaling.scaleToTrackMetric('scaleMemory', {
    //   customMetric: props.ecsService.metricMemoryUtilization(),
    //   targetValue:  props.memoryTargetValue, 
    //   scaleInCooldown:  cdk.Duration.minutes(props.scaleInCooldown),   
    //   scaleOutCooldown: cdk.Duration.minutes(props.scaleOutCooldown)  
    // });

    /** Scaling policy type: Target Tracking Scaling
      * 
     * Desc: Base on cloudwatch metrics and custom alarm 
     * 
     */

    //Scale out 
    const scaleOutalarm = new Alarm(parent, name + 'ScaleOutAlarm', {
      metric: props.alb.metricActiveConnectionCount({ statistic: "avg", period: Duration.seconds(props.scaleOutAvgPeriod), }),
      threshold: props.scaleOutAvgNumber,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD
    });

    const ecsStepScalingOutAction = new StepScalingAction(parent, name + "ScalingOutAction", {
      scalingTarget: ecsFargateServiceScaling,
      adjustmentType: AdjustmentType.CHANGE_IN_CAPACITY,
      cooldown: Duration.minutes(props.scaleOutCooldown),
      metricAggregationType: MetricAggregationType.AVERAGE,
    });

    // lower and uper bound explained: https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-applicationautoscaling.ScalingInterval.html
    // step scaling explain: https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-simple-step.html 
    ecsStepScalingOutAction.addAdjustment({ adjustment: 1, lowerBound: 0, upperBound: props.scaleOutAvgNumber });
    ecsStepScalingOutAction.addAdjustment({ adjustment: 2, lowerBound: props.scaleOutAvgNumber });

    scaleOutalarm.addAlarmAction(new ApplicationScalingAction(ecsStepScalingOutAction));

    //Scale in 
    const scaleInalarm = new Alarm(parent, name + 'ScaleInAlarm', {
      metric: props.alb.metricActiveConnectionCount({ statistic: "avg", period: Duration.seconds(props.scaleInAvgPeriod), }),
      threshold: props.scaleInAvgNumber,
      evaluationPeriods: 1,
      datapointsToAlarm: 1,
      comparisonOperator: ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD
    });

    const ecsStepScalingInAction = new StepScalingAction(parent, name + "ScalingInAction", {
      scalingTarget: ecsFargateServiceScaling,
      adjustmentType: AdjustmentType.CHANGE_IN_CAPACITY,
      cooldown: Duration.minutes(props.scaleInCooldown),
      metricAggregationType: MetricAggregationType.AVERAGE,
    });

    ecsStepScalingInAction.addAdjustment({ adjustment: -1, upperBound: 0 });

    scaleInalarm.addAlarmAction(new ApplicationScalingAction(ecsStepScalingInAction));

    new cdk.CfnOutput(this, name+"ScaleOutAlarm", {
      value: scaleOutalarm.alarmName,
      exportName: name+'ScaleOutAlarm'
    });

    new cdk.CfnOutput(this, name+"ScalerInAlarm", {
      value: scaleInalarm.alarmName,
      exportName: name+'ScalerInAlarm'
    });

  }
}