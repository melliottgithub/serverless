import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class CdkDynamodbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dynamodbtable = new dynamodb.Table(this, "dynamodbid", {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      tableName: "dynamodbtbl",
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkDynamodbQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
