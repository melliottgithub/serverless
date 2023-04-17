import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime, Function, Code } from "aws-cdk-lib/aws-lambda";

export class CronJobStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    // add lambnda function
    const lambda = new Function(this, "CronJob", {
      runtime: Runtime.PYTHON_3_9,
      handler: "index.handler",
      code: Code.fromAsset("lambda"),
      functionName: "CronJob",
      description: "Cron Job",
    });
  }
}
