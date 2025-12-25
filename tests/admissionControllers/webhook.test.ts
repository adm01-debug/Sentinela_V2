import { AdmissionWebhook } from '../../admissionControllers';
describe('AdmissionWebhook', () => {
  it('should validate admission', async () => {
    const webhook = new AdmissionWebhook();
    const result = await webhook.validate({ kind: 'Pod', name: 'test-pod' });
    expect(result.allowed).toBeDefined();
  });
});
