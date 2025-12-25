import { AdmissionController } from '../../admissionControllers';
describe('AdmissionController', () => {
  let ctrl: AdmissionController;
  beforeEach(() => { ctrl = new AdmissionController(); });
  it('should validate requests', async () => {
    ctrl.addValidator(req => req.kind === 'Pod');
    expect((await ctrl.validate({ kind: 'Pod', spec: {} })).allowed).toBe(true);
    expect((await ctrl.validate({ kind: 'Secret', spec: {} })).allowed).toBe(false);
  });
  it('should mutate requests', async () => {
    ctrl.addMutator(() => [{ op: 'add', path: '/metadata/labels', value: {} }]);
    const result = await ctrl.mutate({ kind: 'Pod', spec: {} });
    expect(result.patches.length).toBe(1);
  });
});
