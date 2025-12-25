import { MessageReplay, ReplayConfig, ReplayResult } from '../../messageReplay';
describe('MessageReplay', () => {
  let replay: MessageReplay;
  beforeEach(() => { replay = new MessageReplay(); });
  it('should store messages', async () => {
    await replay.store({ id: '1', topic: 'orders', payload: { data: 'test' } });
    const messages = await replay.getMessages('orders');
    expect(messages.length).toBe(1);
  });
  it('should replay messages', async () => {
    const handler = jest.fn();
    await replay.store({ id: '1', topic: 'events', payload: {} });
    await replay.store({ id: '2', topic: 'events', payload: {} });
    await replay.replay('events', handler);
    expect(handler).toHaveBeenCalledTimes(2);
  });
  it('should replay from offset', async () => {
    const handler = jest.fn();
    await replay.store({ id: '1', topic: 't', payload: {}, offset: 0 });
    await replay.store({ id: '2', topic: 't', payload: {}, offset: 1 });
    await replay.store({ id: '3', topic: 't', payload: {}, offset: 2 });
    await replay.replay('t', handler, { fromOffset: 1 });
    expect(handler).toHaveBeenCalledTimes(2);
  });
  it('should replay by time range', async () => {
    const handler = jest.fn();
    const now = Date.now();
    await replay.store({ id: '1', topic: 't', payload: {}, timestamp: now - 10000 });
    await replay.store({ id: '2', topic: 't', payload: {}, timestamp: now });
    await replay.replay('t', handler, { after: new Date(now - 5000) });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});