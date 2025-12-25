import { Emitter } from '../../core/emitter';
describe('Emitter', () => {
  it('should emit events', () => {
    const emitter = new Emitter<{ test: string }>();
    let received = '';
    emitter.on('test', data => { received = data; });
    emitter.emit('test', 'hello');
    expect(received).toBe('hello');
  });
  it('should support once', () => {
    const emitter = new Emitter<{ test: number }>();
    let count = 0;
    emitter.once('test', () => { count++; });
    emitter.emit('test', 1);
    emitter.emit('test', 2);
    expect(count).toBe(1);
  });
});
