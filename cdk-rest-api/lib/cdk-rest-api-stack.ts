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
    const factTable = new Table(this, "FactTable", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: "factsTable",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // lambda function
    const factHandler = new Function(this, "GetFactsHandler", {
      functionName: "get-facts",
      runtime: Runtime.PYTHON_3_9,
      code: Code.fromAsset(join(__dirname, "../package.zip")),
      handler: "app.lambda_handler",
      environment: {
        TABLE_NAME: factTable.tableName,
      },
    });
    //grant lambda function to read from dynamodb table
    factTable.grantReadWriteData(factHandler);
    // api gateway rest api
    const api = new RestApi(this, "FactApiGateway", {
      description: "API Gateway for getting facts",
      restApiName: "FactApiGateway",
    });
    // api gateway resource
    const factsResource = api.root.addResource("facts");
    const factResource = api.root.addResource("{factId}");
    // api gateway integration
    const getFactsIntegration = new LambdaIntegration(factHandler);
    // api gateway method
    factsResource.addMethod("GET", getFactsIntegration);
    factsResource.addMethod("POST", getFactsIntegration);
    factResource.addMethod("GET", getFactsIntegration);
    factResource.addMethod("PUT", getFactsIntegration);
    factResource.addMethod("DELETE", getFactsIntegration);
  }
}
