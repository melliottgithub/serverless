import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";

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
    // example resource
    // const queue = new sqs.Queue(this, 'ApigLbfnS3TsQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
