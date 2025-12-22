import React, { useState, ReactNode } from 'react';
import { ToastContext } from './ToastContext';
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState([]);
  return <ToastContext.Provider value={{ toasts, show: (t: any) => setToasts([...toasts, t]) }}>{children}</ToastContext.Provider>;
};