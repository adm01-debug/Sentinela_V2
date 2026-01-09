import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTabs } from '../useTabs';

describe('useTabs', () => {
  it('should initialize with first tab', () => {
    const { result } = renderHook(() => useTabs(['tab1', 'tab2', 'tab3']));
    expect(result.current.activeTab).toBe('tab1');
  });

  it('should switch tabs', () => {
    const { result } = renderHook(() => useTabs(['tab1', 'tab2']));
    act(() => { result.current.setActiveTab('tab2'); });
    expect(result.current.activeTab).toBe('tab2');
  });
});