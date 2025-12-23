import React, { createContext, useContext, useState, useCallback } from 'react';

interface ModalState { isOpen: boolean; component: React.ReactNode | null; props?: any; }
interface ModalContextType { modal: ModalState; openModal: (component: React.ReactNode, props?: any) => void; closeModal: () => void; }

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalState>({ isOpen: false, component: null });

  const openModal = useCallback((component: React.ReactNode, props?: any) => setModal({ isOpen: true, component, props }), []);
  const closeModal = useCallback(() => setModal({ isOpen: false, component: null }), []);

  return <ModalContext.Provider value={{ modal, openModal, closeModal }}>{children}{modal.isOpen && modal.component}</ModalContext.Provider>;
}

export const useModal = () => { const ctx = useContext(ModalContext); if (!ctx) throw new Error('useModal must be within ModalProvider'); return ctx; };
