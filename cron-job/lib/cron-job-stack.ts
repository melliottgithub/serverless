import * as cdk from "aws-cdk-lib";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { Runtime, Code, Function } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { join } from "path";
import targets = require("aws-cdk-lib/aws-events-targets");

export class CronJobStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambda = new Function(this, "CronJob", {
      runtime: Runtime.PYTHON_3_9,
      handler: "app.handler",
      code: Code.fromAsset(join(__dirname, "../lambdas")),
      functionName: "CronJob",
      description: "Cron Job",
      timeout: cdk.Duration.seconds(300),
    });
    // create a cron job rule
    const rule = new Rule(this, "CronJobRule", {
      schedule: Schedule.expression("cron(30 7 ? * MON-FRI *)"),
    });

    // add target to rule
    rule.addTarget(new targets.LambdaFunction(lambda));
  }
}
