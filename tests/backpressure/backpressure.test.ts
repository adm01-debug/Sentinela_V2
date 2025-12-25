import { BackpressureController } from '../../backpressure';

describe('BackpressureController', () => {
  let controller: BackpressureController;
  beforeEach(() => { controller = new BackpressureController({ highWaterMark: 100, lowWaterMark: 20 }); });

  it('should signal when high water mark reached', () => {
    for (let i = 0; i < 100; i++) { controller.increment(); }
    expect(controller.shouldPause()).toBe(true);
  });

  it('should resume when below low water mark', () => {
    for (let i = 0; i < 100; i++) { controller.increment(); }
    for (let i = 0; i < 85; i++) { controller.decrement(); }
    expect(controller.shouldResume()).toBe(true);
  });
});
