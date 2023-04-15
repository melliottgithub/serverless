import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import { join } from "path";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib/core";

export class CdkRestApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // dynamodb table
    const factsTable = new Table(this, "factsTable", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: "factsTable",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // lambda function
    const handlerFn = new Function(this, "getfactslogicalid", {
      functionName: "get-facts",
      runtime: Runtime.PYTHON_3_9,
      code: Code.fromAsset(join(__dirname, "../package.zip")),
      handler: "app.lambda_handler",
      environment: {
        TABLE_NAME: factsTable.tableName,
      },
    });
    //grant lambda function to read from dynamodb table
    factsTable.grantReadWriteData(handlerFn);
    // api gateway rest api
    const api = new RestApi(this, "getfactsapi", {
      description: "API Gateway for getting facts",
      restApiName: "get-facts-api",
    });
    // api gateway resource
    const facts = api.root.addResource("getfacts");
    // api gateway integration
    const getFactsIntegration = new LambdaIntegration(handlerFn);
    // api gateway method
    facts.addMethod("GET", getFactsIntegration);
    facts.addMethod("POST", getFactsIntegration);
    facts.addMethod("PUT", getFactsIntegration);
    facts.addMethod("DELETE", getFactsIntegration);
    
  }
}
