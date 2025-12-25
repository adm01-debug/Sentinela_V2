import { ContainerOrchestrator } from '../../containerOrchestration';

describe('ContainerOrchestrator', () => {
  it('should deploy container', async () => {
    const orchestrator = new ContainerOrchestrator();
    const result = await orchestrator.deploy({ image: 'nginx:latest', replicas: 3 });
    expect(result.status).toBe('deployed');
  });
});
