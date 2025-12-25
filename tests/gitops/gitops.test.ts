import { GitOpsController, Repository, SyncStatus } from '../../gitops';
describe('GitOpsController', () => {
  let controller: GitOpsController;
  beforeEach(() => { controller = new GitOpsController({ repo: 'test/repo' }); });
  it('should sync repository', async () => {
    const result = await controller.sync();
    expect(result.synced).toBeDefined();
  });
  it('should detect drift', async () => {
    const drift = await controller.detectDrift();
    expect(drift.hasDrift).toBeDefined();
  });
  it('should get sync status', () => {
    const status = controller.getStatus();
    expect(['synced', 'pending', 'failed']).toContain(status.state);
  });
  it('should rollback', async () => {
    const result = await controller.rollback('previous-commit');
    expect(result.success).toBeDefined();
  });
});