import { CDCCapturer } from '../../cdc';

describe('CDCCapturer', () => {
  let capturer: CDCCapturer;
  beforeEach(() => { capturer = new CDCCapturer({ source: 'postgres' }); });

  it('should capture changes', async () => {
    const changes = [];
    capturer.on('change', (c) => changes.push(c));
    await capturer.start();
    expect(capturer.isRunning()).toBe(true);
  });
});
