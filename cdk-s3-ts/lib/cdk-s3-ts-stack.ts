import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkS3TsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // s3 bucket
    const bucket = new s3.Bucket(this, "CdkS3Ts", {
      bucketName: "cdk-s3-ts-04092023",
      versioned: false,
      publicReadAccess: false,
    });

    // example resource
    // const queue = new sqs.Queue(this, 'CdkS3TsQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
