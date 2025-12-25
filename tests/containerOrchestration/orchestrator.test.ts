import { ContainerOrchestrator, Container, Pod } from '../../containerOrchestration';
describe('ContainerOrchestrator', () => {
  let orchestrator: ContainerOrchestrator;
  beforeEach(() => { orchestrator = new ContainerOrchestrator(); });
  it('should deploy container', async () => {
    const result = await orchestrator.deploy({
      name: 'web-app', image: 'nginx:latest', replicas: 3
    });
    expect(result.success).toBe(true);
  });
  it('should scale deployment', async () => {
    await orchestrator.deploy({ name: 'api', image: 'node:18', replicas: 1 });
    await orchestrator.scale('api', 5);
    const status = await orchestrator.getStatus('api');
    expect(status.replicas).toBe(5);
  });
  it('should rollback deployment', async () => {
    await orchestrator.deploy({ name: 'svc', image: 'app:v1', replicas: 1 });
    await orchestrator.deploy({ name: 'svc', image: 'app:v2', replicas: 1 });
    await orchestrator.rollback('svc');
    const status = await orchestrator.getStatus('svc');
    expect(status.image).toBe('app:v1');
  });
});