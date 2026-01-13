import { createContext, useContext, useState, ReactNode } from "react";
const LoadingContext = createContext<{ loading: boolean; setLoading: (l: boolean) => void }>({ loading: false, setLoading: () => {} });
export const LoadingProvider = ({ children }: { children: ReactNode }) => { const [loading, setLoading] = useState(false); return <LoadingContext.Provider value={{ loading, setLoading }}>{children}</LoadingContext.Provider>; };
export const useLoading = () => useContext(LoadingContext);
