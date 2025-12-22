import { useState } from 'react';
export function useUser() { const [user, setUser] = useState(null); return { user, update: () => {} }; }