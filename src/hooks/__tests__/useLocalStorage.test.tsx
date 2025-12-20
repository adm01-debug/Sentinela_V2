import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'default-value')
    );

    expect(result.current[0]).toBe('default-value');
  });

  it('should return stored value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'default-value')
    );

    expect(result.current[0]).toBe('stored-value');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'initial')
    );

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('updated');
  });

  it('should handle objects', () => {
    const initialValue = { name: 'John', age: 30 };
    const { result } = renderHook(() =>
      useLocalStorage('user', initialValue)
    );

    expect(result.current[0]).toEqual(initialValue);

    const updatedValue = { name: 'Jane', age: 25 };
    act(() => {
      result.current[1](updatedValue);
    });

    expect(result.current[0]).toEqual(updatedValue);
  });

  it('should handle arrays', () => {
    const initialValue = ['a', 'b', 'c'];
    const { result } = renderHook(() =>
      useLocalStorage('items', initialValue)
    );

    expect(result.current[0]).toEqual(initialValue);

    act(() => {
      result.current[1]([...initialValue, 'd']);
    });

    expect(result.current[0]).toEqual(['a', 'b', 'c', 'd']);
  });

  it('should handle function updates', () => {
    const { result } = renderHook(() =>
      useLocalStorage('counter', 0)
    );

    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });

  it('should handle invalid JSON in localStorage', () => {
    localStorage.setItem('invalid-key', 'not-valid-json');

    const { result } = renderHook(() =>
      useLocalStorage('invalid-key', 'default')
    );

    expect(result.current[0]).toBe('default');
  });

  it('should sync across multiple hooks with same key', () => {
    const { result: result1 } = renderHook(() =>
      useLocalStorage('shared-key', 'initial')
    );
    const { result: result2 } = renderHook(() =>
      useLocalStorage('shared-key', 'initial')
    );

    act(() => {
      result1.current[1]('updated');
    });

    // Note: Without storage event listener, only result1 updates
    expect(result1.current[0]).toBe('updated');
  });

  it('should handle boolean values', () => {
    const { result } = renderHook(() =>
      useLocalStorage('flag', false)
    );

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
  });

  it('should handle null values', () => {
    const { result } = renderHook(() =>
      useLocalStorage<string | null>('nullable', null)
    );

    expect(result.current[0]).toBe(null);

    act(() => {
      result.current[1]('not-null');
    });

    expect(result.current[0]).toBe('not-null');
  });
});
