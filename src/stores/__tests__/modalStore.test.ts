// Modal Store Tests for Sentinela v17
import { describe, it, expect, beforeEach } from 'vitest';
import { useModalStore } from '../modalStore';

describe('modalStore', () => {
  beforeEach(() => {
    useModalStore.getState().closeAll();
  });

  it('should initialize with no modals open', () => {
    const state = useModalStore.getState();
    expect(state.modals).toEqual([]);
    expect(state.isAnyOpen).toBe(false);
  });

  it('should open a modal', () => {
    useModalStore.getState().open({ id: 'test', component: 'TestModal' });
    expect(useModalStore.getState().modals).toHaveLength(1);
    expect(useModalStore.getState().isAnyOpen).toBe(true);
  });

  it('should close a modal by id', () => {
    useModalStore.getState().open({ id: 'test', component: 'TestModal' });
    useModalStore.getState().close('test');
    expect(useModalStore.getState().modals).toHaveLength(0);
  });

  it('should close all modals', () => {
    useModalStore.getState().open({ id: 'modal1', component: 'Modal1' });
    useModalStore.getState().open({ id: 'modal2', component: 'Modal2' });
    useModalStore.getState().closeAll();
    expect(useModalStore.getState().modals).toHaveLength(0);
    expect(useModalStore.getState().isAnyOpen).toBe(false);
  });

  it('should open confirm dialog', () => {
    useModalStore.getState().confirm({
      title: 'Confirm',
      message: 'Are you sure?',
      onConfirm: () => {},
    });
    expect(useModalStore.getState().confirmDialog).not.toBeNull();
    expect(useModalStore.getState().isAnyOpen).toBe(true);
  });

  it('should update modal props', () => {
    useModalStore.getState().open({ id: 'test', component: 'TestModal', props: { title: 'Old' } });
    useModalStore.getState().updateModal('test', { title: 'New' });
    expect(useModalStore.getState().modals[0].props?.title).toBe('New');
  });
});
