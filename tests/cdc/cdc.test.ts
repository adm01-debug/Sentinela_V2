import { CDCCapturer } from '../../cdc';
describe('CDCCapturer', () => {
  it('should emit change events', () => {
    const capturer = new CDCCapturer();
    const events: any[] = [];
    capturer.onChange(e => events.push(e));
    capturer.emit({ table: 'users', operation: 'INSERT', after: { id: 1 }, timestamp: Date.now() });
    expect(events.length).toBe(1);
    expect(events[0].operation).toBe('INSERT');
  });
});
