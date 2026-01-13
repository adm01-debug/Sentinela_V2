import { createContext, useContext, useState, ReactNode } from "react";
const ErrorContext = createContext<{ error: Error | null; setError: (e: Error | null) => void }>({ error: null, setError: () => {} });
export const ErrorProvider = ({ children }: { children: ReactNode }) => { const [error, setError] = useState<Error | null>(null); return <ErrorContext.Provider value={{ error, setError }}>{children}</ErrorContext.Provider>; };
export const useError = () => useContext(ErrorContext);
