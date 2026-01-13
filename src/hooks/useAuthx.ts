import { useState, useCallback, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function useAuthx() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("authx_user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    const user: User = { id: crypto.randomUUID(), email, name: email.split("@")[0], role: "user" };
    localStorage.setItem("authx_user", JSON.stringify(user));
    setUser(user);
    setLoading(false);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("authx_user");
    setUser(null);
  }, []);

  return { user, loading, isAuthenticated: !!user, login, logout };
}
