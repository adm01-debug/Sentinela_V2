import React, { useState, ReactNode } from 'react';
import { SettingsContext } from './SettingsContext';
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState({});
  return <SettingsContext.Provider value={{ settings, update: setSettings }}>{children}</SettingsContext.Provider>;
};