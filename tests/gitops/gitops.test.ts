import { GitOpsReconciler } from '../../gitops';

describe('GitOpsReconciler', () => {
  let reconciler: GitOpsReconciler;
  beforeEach(() => { reconciler = new GitOpsReconciler({ repo: 'org/config' }); });

  it('should detect drift', async () => {
    const drift = await reconciler.detectDrift();
    expect(drift).toBeDefined();
  });

  it('should reconcile state', async () => {
    await reconciler.reconcile();
    const status = reconciler.getStatus();
    expect(status.lastReconcile).toBeDefined();
  });
});
