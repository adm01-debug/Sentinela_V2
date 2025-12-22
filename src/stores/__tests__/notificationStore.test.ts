import { describe, it, expect } from 'vitest';
import { useNotificationStore } from '../notificationStore';

describe('notificationStore', () => {
  it('should have initial state', () => {
    const store = useNotificationStore.getState();
    expect(store).toBeDefined();
  });
});