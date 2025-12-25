import { ContainerOrchestrator, Container, Deployment } from '../../containerOrchestration';
describe('ContainerOrchestrator', () => {
  let orch: ContainerOrchestrator;
  beforeEach(() => { orch = new ContainerOrchestrator(); });
  it('should deploy container', async () => {
    const deployment = await orch.deploy({
      name: 'web',
      image: 'nginx:latest',
      replicas: 3
    });
    expect(deployment.id).toBeDefined();
  });
  it('should scale deployment', async () => {
    await orch.deploy({ name: 'api', image: 'node:18', replicas: 2 });
    const result = await orch.scale('api', 5);
    expect(result.replicas).toBe(5);
  });
  it('should list deployments', async () => {
    await orch.deploy({ name: 'd1', image: 'img1', replicas: 1 });
    const deployments = await orch.list();
    expect(deployments.length).toBeGreaterThan(0);
  });
  it('should delete deployment', async () => {
    await orch.deploy({ name: 'temp', image: 'temp', replicas: 1 });
    await orch.delete('temp');
    const deployments = await orch.list();
    expect(deployments.find(d => d.name === 'temp')).toBeUndefined();
  });
});