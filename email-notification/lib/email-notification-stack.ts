import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambdaEventSource from "aws-cdk-lib/aws-lambda-event-sources";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { join } from "path";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class EmailNotificationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //create sqs
    const queue = new sqs.Queue(this, "EmailQueue", {
      visibilityTimeout: cdk.Duration.seconds(45),
      queueName: "EmailQueue",
    });

    /// create sqs event source from lambda
    const lambdaSqsEventSource = new lambdaEventSource.SqsEventSource(queue, {
      batchSize: 10,
      enabled: true,
    });

    //create lambda
    const processInquiryFunction = new lambda.Function(
      this,
      "EmailNotificationLambda",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        code: lambda.Code.fromAsset(join(__dirname, "../lambdas")),
        handler: "index.handler",
        functionName: "EmailNotificationLambda",
      }
    );
    processInquiryFunction.addEventSource(lambdaSqsEventSource);

    processInquiryFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:*"],
        resources: ["*"],
        sid: "SendEmailPolicySid",
        effect: iam.Effect.ALLOW,
      })
    );

    // provision dynamodb table
    const inquiryTable = new dynamodb.Table(this, "EmailTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      tableName: "EmailTable",
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.DEFAULT,
      pointInTimeRecovery: false,
    });

    // create inquiry function
    const createInquiryFunction = new lambda.Function(
      this,
      "CreateInquiryLambda",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        code: lambda.Code.fromAsset(join(__dirname, "../lambdas")),
        handler: "createInquiry.handler",
        functionName: "CreateInquiryLambda",
        memorySize: 256,
        timeout: cdk.Duration.seconds(10),
        environment: {
          TABLE_NAME: inquiryTable.tableName,
          QUEUE_URL: queue.queueUrl,
          ADMIN_EMAIL: "",
        },
      }
    );
    inquiryTable.grantWriteData(createInquiryFunction);
    queue.grantSendMessages(createInquiryFunction);
    //create api gateway
    const api = new apigateway.RestApi(this, "EmailNotificationApi", {
      restApiName: "EmailNotificationApi",
      description: "This service sends email notifications",
    });

    const newInquiry = api.root.addResource("inquiry").addResource("new");

    newInquiry.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createInquiryFunction),
      {
        authorizationType: apigateway.AuthorizationType.NONE,
      }
    );
  }
}
