import React, { useState, ReactNode } from 'react';
import { NotificationContext } from './NotificationContext';
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState([]);
  return <NotificationContext.Provider value={{ notifications, add: (n: any) => setNotifications([...notifications, n]) }}>{children}</NotificationContext.Provider>;
};