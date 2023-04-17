import { Duration, Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Function, Runtime, Code, LayerVersion } from "aws-cdk-lib/aws-lambda";
import { join } from "path";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";

export class ThumbnailConverterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const handler = new Function(this, "ThumbnailConverterHandler", {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset(join(__dirname, "../package.zip")),
      handler: "index.handler",
      timeout: Duration.seconds(20),
      functionName: "ThumbnailConverterHandler",
      environment: {
        BUCKET_NAME: "thumbnail-converter-bucket",
        THUMBNAIL_SIZE: "128",
      },
    });
    //create a bucket
    const bucket = new Bucket(this, "ThumbnailConverterBucket", {
      bucketName: "thumbnail-converter-bucket",
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    bucket.grantReadWrite(handler);

    bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(handler)
    );
    handler.addToRolePolicy(
      new PolicyStatement({
        actions: ["s3:*"],
        resources: [bucket.bucketArn + "/*"],
        effect: Effect.ALLOW,
      })
    );
  }
}
