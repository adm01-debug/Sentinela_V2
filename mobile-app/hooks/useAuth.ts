import { useState } from 'react';
export function useAuth() { const [user, setUser] = useState(null); return { user, login: async () => {}, logout: async () => {} }; }