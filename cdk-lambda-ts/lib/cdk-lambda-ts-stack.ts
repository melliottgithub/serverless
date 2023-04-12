import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";

export class CdkLambdaTsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    //create lambda function
    const lbfn = new lambda.Function(this, "lambdaid", {
      handler: "lambda_function.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9, 
      code: lambda.Code.fromAsset(path.join(__dirname, '../services')),
      functionName: "cdk-lambda",
    });
  }
}
