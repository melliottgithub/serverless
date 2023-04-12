import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";

export class ApigLbfnS3TsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const dbs3 = new s3.Bucket(this, "s3logicalid", {
      bucketName: "db-041123",
    });

    // add iam role to access s3 bucket
    const iamdatabaserole = new iam.Role(this, "iamrolelogicalid", {
      roleName: "database-lambda-role-041123",
      description: "iam role for lambda to access s3 bucket",
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    // add managed policy to role full access to s3 bucket
    iamdatabaserole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")
    );
    // add lambda function to access s3 bucket
    const dblambdafn = new lambda.Function(this, "lambdafnlogicalid", {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, "../services")),
      handler: "lambda_function.lambda_handler",
      role: iamdatabaserole,
    });
  }
}
