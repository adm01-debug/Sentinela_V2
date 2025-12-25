import { AdmissionController, AdmissionReview, AdmissionResponse } from '../../admissionControllers';
describe('AdmissionController', () => {
  let controller: AdmissionController;
  beforeEach(() => { controller = new AdmissionController(); });
  it('should register validating webhook', () => {
    controller.registerValidator({
      name: 'validate-pods',
      resources: ['pods'],
      validate: async (review) => ({ allowed: true })
    });
    expect(controller.getValidators()).toContain('validate-pods');
  });
  it('should register mutating webhook', () => {
    controller.registerMutator({
      name: 'inject-sidecar',
      resources: ['pods'],
      mutate: async (review) => ({ allowed: true, patch: [] })
    });
    expect(controller.getMutators()).toContain('inject-sidecar');
  });
  it('should validate request', async () => {
    controller.registerValidator({
      name: 'deny-privileged',
      resources: ['pods'],
      validate: async (review) => {
        const privileged = review.object?.spec?.containers?.some(c => c.securityContext?.privileged);
        return { allowed: !privileged, message: privileged ? 'Privileged not allowed' : undefined };
      }
    });
    const result = await controller.validate({ object: { spec: { containers: [{ securityContext: { privileged: true } }] } } });
    expect(result.allowed).toBe(false);
  });
});