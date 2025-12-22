import React, { useState, ReactNode } from 'react';
import { UserContext } from './UserContext';
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};