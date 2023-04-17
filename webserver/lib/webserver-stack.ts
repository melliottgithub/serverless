import * as cdk from "aws-cdk-lib";
import { CfnOutput } from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { readFileSync } from "fs";

export class WebserverStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create a key pair
    const key = new ec2.CfnKeyPair(this, "KeyPair", {
      keyName: "cdk-keypair",
    });
    // output the public key
    new CfnOutput(this, "PublicKey", {
      value: key.ref,
    });

    // import default vpc
    const vpc = ec2.Vpc.fromLookup(this, "VPC", {
      isDefault: true,
    });

    // create a Security Group
    const securityGroup = new ec2.SecurityGroup(this, "SecurityGroup", {
      securityGroupName: "webserver-sg",
      vpc,
      allowAllOutbound: true,
    });

    securityGroup.addIngressRule( 
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "HTTP from anywhere"
    );
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "SSH from anywhere"
    );

    //create an ec2 instance
    const instance = new ec2.Instance(this, "webserver", {
      keyName: key.ref,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroup: securityGroup,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
    });
    // load data script from local file
    const userData = readFileSync("./lib/data.sh", "utf-8");
    instance.addUserData(userData);

    // add cfn output public dns name
    new CfnOutput(this, "PublicDNS", {
      value: instance.instancePublicDnsName,
    });
    // ip address
    new CfnOutput(this, "PublicIP", {
      value: instance.instancePublicIp,
    });
    // key name
    new CfnOutput(this, "KeyName", {
      value: key.ref,
    });
    //download key secret manager command
    new CfnOutput(this, "DownloadKeyCommand", {
      value: `aws secretsmanager get-secret-value --secret-id ${key.ref} --query SecretString --output text > ${key.ref}.pem`,
    });
    // ssh command
    new CfnOutput(this, "SSHCommand", {
      value: `ssh -i ${key.ref}.pem ec2-user@${instance.instancePublicDnsName}`,
    });
  }
}
