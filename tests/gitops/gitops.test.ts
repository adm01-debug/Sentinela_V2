import { GitOpsReconciler } from '../../gitops';
describe('GitOpsReconciler', () => {
  let reconciler: GitOpsReconciler;
  beforeEach(() => { reconciler = new GitOpsReconciler(); });
  it('should reconcile state', async () => {
    reconciler.setDesired({ replicas: 3, image: 'v2' });
    reconciler.setActual({ replicas: 2, image: 'v1' });
    const result = await reconciler.reconcile();
    expect(result.synced).toBe(false);
    expect(result.changes).toContain('replicas');
  });
});
