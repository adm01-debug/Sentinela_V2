import { useState } from 'react';
export function useTheme() { const [isDark, setIsDark] = useState(false); return { isDark, toggle: () => setIsDark(!isDark) }; }