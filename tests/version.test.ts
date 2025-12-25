import { VERSION, getVersion, getBuildInfo } from '../version';
describe('Version', () => {
  it('should have version', () => { expect(VERSION).toBe('13.0.0'); expect(getVersion()).toBe('13.0.0'); });
  it('should get build info', () => {
    const info = getBuildInfo();
    expect(info.version).toBe('13.0.0');
    expect(info.license).toBe('MIT');
    expect(info.repo).toContain('github.com');
  });
});
