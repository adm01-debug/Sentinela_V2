import { StreamProcessor, StreamConfig, WindowType } from '../../streamProcessing';

describe('StreamProcessor', () => {
  let processor: StreamProcessor;

  beforeEach(() => {
    processor = new StreamProcessor({
      windowSize: 1000,
      windowType: 'tumbling'
    });
  });

  afterEach(() => {
    processor.stop();
  });

  it('should process events', async () => {
    const results: any[] = [];
    
    processor.map((event) => ({ ...event, processed: true }));
    processor.sink((event) => results.push(event));

    await processor.push({ id: 1, value: 'test' });
    
    expect(results.length).toBe(1);
    expect(results[0].processed).toBe(true);
  });

  it('should filter events', async () => {
    const results: any[] = [];
    
    processor.filter((event) => event.value > 5);
    processor.sink((event) => results.push(event));

    await processor.push({ id: 1, value: 3 });
    await processor.push({ id: 2, value: 10 });
    await processor.push({ id: 3, value: 7 });

    expect(results.length).toBe(2);
  });

  it('should aggregate in windows', async () => {
    const windowResults: any[] = [];
    
    processor.aggregate(
      (acc, event) => acc + event.value,
      0
    );
    processor.onWindow((result) => windowResults.push(result));

    await processor.push({ value: 10 });
    await processor.push({ value: 20 });
    await processor.push({ value: 30 });
    
    processor.flushWindow();

    expect(windowResults.length).toBe(1);
    expect(windowResults[0]).toBe(60);
  });
});
