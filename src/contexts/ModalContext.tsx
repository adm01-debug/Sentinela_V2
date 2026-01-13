import { createContext, useContext, useState, ReactNode } from "react";
const ModalContext = createContext<{ isOpen: boolean; open: () => void; close: () => void }>({ isOpen: false, open: () => {}, close: () => {} });
export const ModalProvider = ({ children }: { children: ReactNode }) => { const [isOpen, setIsOpen] = useState(false); return <ModalContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>{children}</ModalContext.Provider>; };
export const useModal = () => useContext(ModalContext);
