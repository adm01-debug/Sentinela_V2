// Toast Store Tests for Sentinela v17
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useToastStore, toast } from '../toastStore';

describe('toastStore', () => {
  beforeEach(() => {
    useToastStore.getState().removeAll();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with no toasts', () => {
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('should add a success toast', () => {
    const id = useToastStore.getState().success('Success message');
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0].type).toBe('success');
    expect(id).toBeDefined();
  });

  it('should add an error toast', () => {
    useToastStore.getState().error('Error message');
    expect(useToastStore.getState().toasts[0].type).toBe('error');
  });

  it('should add a warning toast', () => {
    useToastStore.getState().warning('Warning message');
    expect(useToastStore.getState().toasts[0].type).toBe('warning');
  });

  it('should add an info toast', () => {
    useToastStore.getState().info('Info message');
    expect(useToastStore.getState().toasts[0].type).toBe('info');
  });

  it('should add a loading toast', () => {
    useToastStore.getState().loading('Loading...');
    expect(useToastStore.getState().toasts[0].type).toBe('loading');
  });

  it('should remove a toast by id', () => {
    const id = useToastStore.getState().success('Test');
    useToastStore.getState().remove(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('should remove all toasts', () => {
    useToastStore.getState().success('Test 1');
    useToastStore.getState().error('Test 2');
    useToastStore.getState().removeAll();
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('should respect max toasts limit', () => {
    useToastStore.getState().setMaxToasts(2);
    useToastStore.getState().success('1');
    useToastStore.getState().success('2');
    useToastStore.getState().success('3');
    expect(useToastStore.getState().toasts).toHaveLength(2);
  });

  it('should update toast', () => {
    const id = useToastStore.getState().loading('Loading');
    useToastStore.getState().update(id, { type: 'success', message: 'Done' });
    expect(useToastStore.getState().toasts[0].type).toBe('success');
  });

  it('should work with convenience toast object', () => {
    toast.success('Test');
    expect(useToastStore.getState().toasts).toHaveLength(1);
  });
});
