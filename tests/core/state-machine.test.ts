import { createMachine } from '../../core/state-machine';

describe('StateMachine', () => {
  const trafficLight = () => createMachine({
    initial: 'green',
    states: {
      green: { on: { TIMER: 'yellow' } },
      yellow: { on: { TIMER: 'red' } },
      red: { on: { TIMER: 'green' } }
    }
  });

  it('should start in initial state', () => {
    const machine = trafficLight();
    expect(machine.state).toBe('green');
  });

  it('should transition on event', () => {
    const machine = trafficLight();
    machine.send('TIMER');
    expect(machine.state).toBe('yellow');
  });

  it('should check if can transition', () => {
    const machine = trafficLight();
    expect(machine.can('TIMER')).toBe(true);
    expect(machine.can('INVALID' as any)).toBe(false);
  });

  it('should notify listeners', () => {
    const machine = trafficLight();
    const listener = jest.fn();
    machine.onTransition(listener);
    machine.send('TIMER');
    expect(listener).toHaveBeenCalledWith('green', 'yellow', 'TIMER');
  });
});
