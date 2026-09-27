import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("my-bucket");

const bucketVersioning = new aws.s3.BucketVersioning("my-bucket-versioning", {
    bucket: bucket.id,
    versioningConfiguration: {
        status: "Enabled",
    },
});

// Create sg
const ec2_sg = new aws.ec2.SecurityGroup("web-server-sg", {
    description: "Enable HTTP and SSH access",
    ingress: [
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["200.192.99.147/32"] },
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["200.192.99.147/32"] }
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }
    ]
});

// Create EC2 instances
const instancesNames = ["web-server", "web-server-2"];

const ec2_instances =  instancesNames.map( name => 
    new aws.ec2.Instance(name, {    
        ami: "ami-0fef201115eefe936", // Amazon Linux 2 AMI
        instanceType: "t3.nano",
        keyName: "new-test",
        tags: {
            Name: name,
            env: "dev",
        },
        vpcSecurityGroupIds: [ec2_sg.id]
    })
)

// Export outputs
export const instanceIp = ec2_instances.map(
    instance => instance.publicIp
);
export const instanceUrl = ec2_instances.map(
    instance => instance.publicDns.apply(d => `http://${d}`)
);