import { useEffect, useCallback } from 'react';
import { useCommandStore } from '@/stores/commandStore';

export function useCommandPalette() {
  const store = useCommandStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        store.toggle();
      }
      if (e.key === 'Escape' && store.isOpen) {
        store.close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);

  const executeCommand = useCallback((commandId) => {
    const command = store.groups.flatMap(g => g.commands).find(c => c.id === commandId);
    if (command) {
      command.action();
      store.addToRecent(commandId);
      store.close();
    }
  }, [store]);

  return { ...store, executeCommand };
}
