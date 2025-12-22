import React, { useState, ReactNode } from 'react';
import { SidebarContext } from './SidebarContext';
export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);
  return <SidebarContext.Provider value={{ isOpen, toggle: () => setIsOpen(!isOpen) }}>{children}</SidebarContext.Provider>;
};