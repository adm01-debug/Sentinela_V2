import { StatefulSetController, StatefulSet } from '../../src/statefulSets';

describe('StatefulSetController', () => {
  let controller: StatefulSetController;

  beforeEach(() => {
    controller = new StatefulSetController();
  });

  it('should create statefulset with replicas', () => {
    const ss: StatefulSet = {
      name: 'mysql',
      namespace: 'default',
      replicas: 3,
      serviceName: 'mysql-headless',
      selector: { app: 'mysql' },
      template: {
        metadata: { labels: { app: 'mysql' } },
        spec: { containers: [{ name: 'mysql', image: 'mysql:8.0' }] }
      },
      volumeClaimTemplates: [{
        metadata: { name: 'data' },
        spec: { accessModes: ['ReadWriteOnce'], resources: { requests: { storage: '10Gi' } } }
      }]
    };

    controller.create(ss);
    const managed = controller.get('default', 'mysql');
    
    expect(managed).toBeDefined();
    expect(managed?.pods.length).toBe(3);
  });

  it('should create ordered pod names', () => {
    controller.create({
      name: 'db',
      namespace: 'default',
      replicas: 3,
      serviceName: 'db',
      selector: {},
      template: { metadata: { labels: {} }, spec: { containers: [] } },
      volumeClaimTemplates: []
    });

    const managed = controller.get('default', 'db');
    expect(managed?.pods[0].name).toBe('db-0');
    expect(managed?.pods[1].name).toBe('db-1');
    expect(managed?.pods[2].name).toBe('db-2');
  });

  it('should scale statefulset', () => {
    controller.create({
      name: 'redis',
      namespace: 'default',
      replicas: 1,
      serviceName: 'redis',
      selector: {},
      template: { metadata: { labels: {} }, spec: { containers: [] } },
      volumeClaimTemplates: []
    });

    controller.scale('default', 'redis', 5);
    const managed = controller.get('default', 'redis');
    expect(managed?.pods.length).toBe(5);
  });
});
