import React, { createContext, useContext, useState, useCallback } from 'react';

interface ModalContextType { isOpen: boolean; content: React.ReactNode | null; openModal: (c: React.ReactNode) => void; closeModal: () => void; }

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<React.ReactNode | null>(null);

  const openModal = useCallback((c: React.ReactNode) => { setContent(c); setIsOpen(true); }, []);
  const closeModal = useCallback(() => { setIsOpen(false); setContent(null); }, []);

  return <ModalContext.Provider value={{ isOpen, content, openModal, closeModal }}>{children}</ModalContext.Provider>;
}

export const useModal = () => { const ctx = useContext(ModalContext); if (!ctx) throw new Error('useModal must be used within ModalProvider'); return ctx; };
