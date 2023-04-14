import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
//codepipeline
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "aws-cdk-lib/pipelines";
export class AwsCdkPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // aws ci cd pipeline and add oath token const pipeline = new CodePipeline(this, "Pipeline", {

    const pipeline = new CodePipeline(this, "Pipeline", {
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.gitHub("melliottgithub/serverless", "main", {
          authentication: cdk.SecretValue.secretsManager("github-token", {
            jsonField: "github-token",
          }),
        }),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });
  }
}
