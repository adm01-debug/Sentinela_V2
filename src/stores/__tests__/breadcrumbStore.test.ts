import { describe, it, expect, beforeEach } from 'vitest';
import { useBreadcrumbStore } from '../breadcrumbStore';

describe('breadcrumbStore', () => {
  beforeEach(() => { useBreadcrumbStore.getState().reset(); });

  it('should have correct initial state', () => {
    expect(useBreadcrumbStore.getState().items).toEqual([]);
  });

  it('should set breadcrumb items', () => {
    const { setItems } = useBreadcrumbStore.getState();
    setItems([{ label: 'Home', href: '/' }]);
    expect(useBreadcrumbStore.getState().items).toHaveLength(1);
  });

  it('should push breadcrumb item', () => {
    const { push } = useBreadcrumbStore.getState();
    push({ label: 'Page1', href: '/p1' });
    push({ label: 'Page2', href: '/p2' });
    expect(useBreadcrumbStore.getState().items).toHaveLength(2);
  });

  it('should pop breadcrumb item', () => {
    const store = useBreadcrumbStore.getState();
    store.setItems([{ label: 'A' }, { label: 'B' }]);
    store.pop();
    expect(useBreadcrumbStore.getState().items).toHaveLength(1);
  });
});
