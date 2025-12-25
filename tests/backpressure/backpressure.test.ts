import { BackpressureController, BackpressureStrategy } from '../../backpressure';

describe('BackpressureController', () => {
  let controller: BackpressureController;

  beforeEach(() => {
    controller = new BackpressureController({
      highWaterMark: 100,
      lowWaterMark: 20,
      strategy: 'drop-oldest'
    });
  });

  afterEach(() => {
    controller.dispose();
  });

  it('should accept items when below high water mark', () => {
    for (let i = 0; i < 50; i++) {
      const accepted = controller.push({ id: i });
      expect(accepted).toBe(true);
    }
  });

  it('should signal backpressure when at high water mark', () => {
    for (let i = 0; i < 100; i++) {
      controller.push({ id: i });
    }

    expect(controller.isPressured()).toBe(true);
  });

  it('should drop oldest when strategy is drop-oldest', () => {
    const dropOldest = new BackpressureController({
      highWaterMark: 5,
      lowWaterMark: 2,
      strategy: 'drop-oldest'
    });

    for (let i = 0; i < 10; i++) {
      dropOldest.push({ id: i });
    }

    const items = dropOldest.drain();
    // Should have items 5-9 (oldest dropped)
    expect(items[0].id).toBe(5);
    
    dropOldest.dispose();
  });

  it('should emit drain event when below low water mark', (done) => {
    for (let i = 0; i < 100; i++) {
      controller.push({ id: i });
    }

    controller.on('drain', () => {
      expect(controller.isPressured()).toBe(false);
      done();
    });

    // Consume items
    while (controller.size() > 10) {
      controller.pull();
    }
  });
});
