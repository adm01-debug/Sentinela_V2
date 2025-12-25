import { DeadLetterQueue, DLQMessage, RetryPolicy } from '../../deadLetter';

describe('DeadLetterQueue', () => {
  let dlq: DeadLetterQueue;

  beforeEach(() => {
    dlq = new DeadLetterQueue({
      maxRetries: 3,
      retryDelay: 100
    });
  });

  afterEach(() => {
    dlq.dispose();
  });

  it('should add failed message to DLQ', async () => {
    await dlq.add({
      originalMessage: { id: '1', data: 'test' },
      error: new Error('Processing failed'),
      attempts: 3
    });

    const messages = await dlq.getMessages();
    expect(messages.length).toBe(1);
  });

  it('should retry message', async () => {
    const processor = jest.fn().mockResolvedValue(undefined);
    
    await dlq.add({
      originalMessage: { id: '1', data: 'test' },
      error: new Error('Failed'),
      attempts: 1
    });

    await dlq.retry('1', processor);
    expect(processor).toHaveBeenCalled();
  });

  it('should not retry if max attempts reached', async () => {
    const processor = jest.fn();
    
    await dlq.add({
      originalMessage: { id: '1', data: 'test' },
      error: new Error('Failed'),
      attempts: 3
    });

    await expect(dlq.retry('1', processor)).rejects.toThrow('Max retries exceeded');
  });

  it('should purge old messages', async () => {
    await dlq.add({
      originalMessage: { id: '1' },
      error: new Error('Old error'),
      attempts: 3,
      timestamp: new Date(Date.now() - 100000)
    });

    await dlq.purge(50000);
    const messages = await dlq.getMessages();
    
    expect(messages.length).toBe(0);
  });
});
