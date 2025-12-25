import { getContext, setContext, runWithContext } from '../../core/context';
describe('Context', () => {
  it('should get and set context', () => { setContext({ requestId: '123' }); expect(getContext().requestId).toBe('123'); });
  it('should run with context', () => {
    const result = runWithContext({ userId: 'user1' }, () => getContext().userId);
    expect(result).toBe('user1');
  });
});
