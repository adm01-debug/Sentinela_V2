import { StackBuilder, StackExecutor, ResourceFactory } from '../../src/iac';

describe('StackBuilder', () => {
  it('should build infrastructure stack', () => {
    const builder = new StackBuilder();
    
    const stack = builder
      .name('production')
      .resource('vpc', { type: 'aws:ec2:Vpc', cidr: '10.0.0.0/16' })
      .resource('subnet', { type: 'aws:ec2:Subnet', vpcId: '${vpc.id}', cidr: '10.0.1.0/24' })
      .resource('instance', { type: 'aws:ec2:Instance', subnetId: '${subnet.id}' })
      .build();

    expect(stack.name).toBe('production');
    expect(stack.resources.length).toBe(3);
  });

  it('should resolve dependencies', () => {
    const builder = new StackBuilder();
    
    const stack = builder
      .name('test')
      .resource('db', { type: 'aws:rds:Instance' })
      .resource('app', { type: 'aws:ecs:Service', dbHost: '${db.endpoint}' })
      .build();

    const order = stack.getExecutionOrder();
    const dbIndex = order.findIndex(r => r.name === 'db');
    const appIndex = order.findIndex(r => r.name === 'app');
    
    expect(dbIndex).toBeLessThan(appIndex);
  });
});

describe('ResourceFactory', () => {
  it('should create VPC resource', () => {
    const vpc = ResourceFactory.create('VPC', {
      cidr: '10.0.0.0/16',
      enableDnsHostnames: true
    });

    expect(vpc.type).toBe('VPC');
    expect(vpc.properties.cidr).toBe('10.0.0.0/16');
  });

  it('should create Security Group resource', () => {
    const sg = ResourceFactory.create('SecurityGroup', {
      vpcId: 'vpc-123',
      ingress: [{ port: 443, protocol: 'tcp' }]
    });

    expect(sg.type).toBe('SecurityGroup');
  });
});
