import React, { createContext, useContext, useState, ReactNode } from 'react';
const AuthContext = createContext<any>(null);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};
export const useAuthContext = () => useContext(AuthContext);