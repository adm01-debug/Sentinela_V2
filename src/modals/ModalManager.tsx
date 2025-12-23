import React, { createContext, useContext, useState, useCallback } from 'react';

interface ModalConfig { id: string; component: React.ComponentType<any>; props?: any; }
interface ModalManagerContextType { modals: ModalConfig[]; open: (config: Omit<ModalConfig, 'id'>) => string; close: (id: string) => void; closeAll: () => void; }

const ModalManagerContext = createContext<ModalManagerContextType | undefined>(undefined);

export function ModalManager({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = useState<ModalConfig[]>([]);

  const open = useCallback((config: Omit<ModalConfig, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setModals(prev => [...prev, { ...config, id }]);
    return id;
  }, []);

  const close = useCallback((id: string) => setModals(prev => prev.filter(m => m.id !== id)), []);
  const closeAll = useCallback(() => setModals([]), []);

  return (
    <ModalManagerContext.Provider value={{ modals, open, close, closeAll }}>
      {children}
      {modals.map(({ id, component: Component, props }) => (<Component key={id} {...props} isOpen onClose={() => close(id)} />))}
    </ModalManagerContext.Provider>
  );
}

export const useModalManager = () => { const ctx = useContext(ModalManagerContext); if (!ctx) throw new Error('useModalManager must be within ModalManager'); return ctx; };
