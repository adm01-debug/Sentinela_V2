import React, { useState, ReactNode } from 'react';
import { ModalContext } from './ModalContext';
export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return <ModalContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>{children}</ModalContext.Provider>;
};