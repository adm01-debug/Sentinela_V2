import { AdmissionController } from '../../admissionControllers';
describe('AdmissionController', () => {
  it('should mutate request', async () => {
    const ctrl = new AdmissionController();
    const result = await ctrl.mutate({ kind: 'Pod', spec: {} });
    expect(result.patches).toBeDefined();
  });
});
