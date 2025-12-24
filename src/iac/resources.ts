import { Resource } from './types';

export class ResourceFactory {
  static vpc(name: string, cidr: string): Resource {
    return { type: 'AWS::EC2::VPC', name, properties: { CidrBlock: cidr } };
  }
  
  static subnet(name: string, vpcRef: string, cidr: string, az: string): Resource {
    return { type: 'AWS::EC2::Subnet', name, properties: { VpcId: vpcRef, CidrBlock: cidr, AvailabilityZone: az }, dependsOn: [vpcRef] };
  }
  
  static securityGroup(name: string, vpcRef: string, rules: { port: number; cidr: string }[]): Resource {
    return { type: 'AWS::EC2::SecurityGroup', name, properties: { VpcId: vpcRef, SecurityGroupIngress: rules }, dependsOn: [vpcRef] };
  }
  
  static instance(name: string, ami: string, type: string, subnetRef: string, sgRef: string): Resource {
    return { type: 'AWS::EC2::Instance', name, properties: { ImageId: ami, InstanceType: type, SubnetId: subnetRef, SecurityGroupIds: [sgRef] }, dependsOn: [subnetRef, sgRef] };
  }
  
  static bucket(name: string, bucketName: string): Resource {
    return { type: 'AWS::S3::Bucket', name, properties: { BucketName: bucketName } };
  }
}