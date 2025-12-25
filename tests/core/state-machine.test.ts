import { StateMachine } from '../../core/state-machine';
describe('StateMachine', () => {
  it('should transition states', () => {
    const sm = new StateMachine('idle', { idle: { start: 'running' }, running: { stop: 'idle' } });
    sm.transition('start');
    expect(sm.state).toBe('running');
  });
});
