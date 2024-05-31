import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as secret from 'aws-cdk-lib/aws-secretsmanager'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class CdkWorkshop3Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'CdkWorkshop3Queue', {
      visibilityTimeout: Duration.seconds(300)
    });

    const topic = new sns.Topic(this, 'CdkWorkshop3Topic');

    topic.addSubscription(new subs.SqsSubscription(queue));
    
    const vpc = new ec2.Vpc(this, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.30.0.0/16'),
      maxAzs: 1,
     });
     
    const publicSubnet = new ec2.PublicSubnet(this, 'MyPublicSubnet', {
      availabilityZone: 'us-east-2a',
      cidrBlock: '10.30.1.0/24',
      vpcId: vpc.vpcId ,
    });
    
    const instance = new ec2.Instance(this, 'MyInstance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC
      }
    });
    
    new secretsmanager.Secret(this, 'Metrodb-secrets', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'frank',
        }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 16,
      },
    });
    
  }
}
