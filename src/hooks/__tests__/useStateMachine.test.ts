import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useStateMachine } from '../useStateMachine';

describe('useStateMachine', () => {
  it('should transition states', () => {
    const machine = { idle: { START: 'running' }, running: { STOP: 'idle' } };
    const { result } = renderHook(() => useStateMachine(machine, 'idle'));
    expect(result.current.state).toBe('idle');
    act(() => { result.current.send('START'); });
    expect(result.current.state).toBe('running');
  });
});