import { BackpressureController } from '../../backpressure';
describe('BackpressureController', () => {
  it('should pause when high water mark reached', () => {
    const ctrl = new BackpressureController({ highWaterMark: 10, lowWaterMark: 5 });
    for (let i = 0; i < 10; i++) ctrl.increment();
    expect(ctrl.shouldPause()).toBe(true);
  });
  it('should resume when low water mark reached', () => {
    const ctrl = new BackpressureController({ highWaterMark: 10, lowWaterMark: 5 });
    for (let i = 0; i < 10; i++) ctrl.increment();
    for (let i = 0; i < 6; i++) ctrl.decrement();
    expect(ctrl.shouldResume()).toBe(true);
  });
});
