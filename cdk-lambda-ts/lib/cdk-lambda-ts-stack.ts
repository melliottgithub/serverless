import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";

export class CdkLambdaTsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    //create lambda function
    const lbfn = new lambda.Function(this, "lambdaid", {
      handler: "lambda_function.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, "../services")),
      functionName: "cdk-lambda",
    });

    //add cloudwatch alarm
    const alarm = new cloudwatch.Alarm(this, "Alarm", {
      metric: lbfn.metricErrors(),
      threshold: 1,
      evaluationPeriods: 1,
    });
  }
}
