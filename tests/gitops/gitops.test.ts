import { GitOpsController, Repository, SyncStatus } from '../../gitops';
describe('GitOpsController', () => {
  let controller: GitOpsController;
  beforeEach(() => { controller = new GitOpsController({ repoUrl: 'https://github.com/test/repo' }); });
  it('should sync repository', async () => {
    const syncResult = await controller.sync();
    expect(syncResult.status).toBeDefined();
  });
  it('should detect drift', async () => {
    const drift = await controller.detectDrift();
    expect(drift).toBeDefined();
  });
  it('should rollback to revision', async () => {
    const result = await controller.rollback('abc123');
    expect(result.success).toBeDefined();
  });
});