import { TaintManager, Toleration, TaintEffect } from '../../taintsTolerations';
describe('TaintManager', () => {
  let manager: TaintManager;
  beforeEach(() => { manager = new TaintManager(); });
  it('should create taint', () => {
    const taint = manager.createTaint('dedicated', 'gpu', 'NoSchedule');
    expect(taint.key).toBe('dedicated');
    expect(taint.value).toBe('gpu');
    expect(taint.effect).toBe('NoSchedule');
  });
  it('should create toleration', () => {
    const toleration = manager.createToleration({
      key: 'dedicated',
      operator: 'Equal',
      value: 'gpu',
      effect: 'NoSchedule'
    });
    expect(toleration.key).toBe('dedicated');
  });
  it('should match taint with toleration', () => {
    const taint = manager.createTaint('key', 'value', 'NoSchedule');
    const toleration = manager.createToleration({ key: 'key', operator: 'Equal', value: 'value', effect: 'NoSchedule' });
    expect(manager.tolerates(toleration, taint)).toBe(true);
  });
  it('should tolerate all with Exists operator', () => {
    const taint = manager.createTaint('any-key', 'any-value', 'NoExecute');
    const toleration = manager.createToleration({ key: 'any-key', operator: 'Exists', effect: 'NoExecute' });
    expect(manager.tolerates(toleration, taint)).toBe(true);
  });
});