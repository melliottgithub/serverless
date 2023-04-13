import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
// s3 notification to lambda
import * as s3n from "aws-cdk-lib/aws-s3-notifications";

export class S3LambdaDdbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // add iam role to access s3 bucket and dynamodb and lambda
    const iamdatabaserole = new iam.Role(this, "iamrolelogicalid", {
      roleName: "database-lambda-role-041223",
      description:
        "iam role for lambda to access s3 bucket, dynamodb and lambda",
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    // add managed policy to role full access to s3 bucket
    iamdatabaserole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")
    );
    // add managed policy to role full access to dynamodb
    iamdatabaserole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess")
    );
    // add managed policy to role full access to cloudwatch
    iamdatabaserole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccess")
    );

    // lambda function tha triggers when s3 bucket is updated and sends data to dynamodb
    const dbs3 = new s3.Bucket(this, "s3logicalid", {
      bucketName: "db-041223",
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const dblambdafn = new lambda.Function(this, "lambdafnlogicalid", {
      runtime: lambda.Runtime.PYTHON_3_9,
      functionName: "db041223",
      code: lambda.Code.fromAsset(path.join(__dirname, "../services")),
      handler: "lambda_function.lambda_handler",
      role: iamdatabaserole,
      environment: {
        BUCKET: dbs3.bucketName,
        TABLE_NAME: "db041223",
      },
    });
    // add dependency between lambda bucket and iam role
    dblambdafn.node.addDependency(iamdatabaserole);

    // s3 notification
    dbs3.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(dblambdafn)
    );

    //dynmodb table
    const dbtable = new dynamodb.Table(this, "dbtablelogicalid", {
      tableName: "db041223",
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "customername",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
