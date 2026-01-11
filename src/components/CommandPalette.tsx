import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Activity, FileText, Bell, Settings } from 'lucide-react';
import { useUIStore } from '@/stores';
import { ROUTES } from '@/constants';
import { Input } from './ui/Input';

const commands = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: Activity, action: ROUTES.DASHBOARD },
  { id: 'employees', label: 'Go to Employees', icon: Users, action: ROUTES.EMPLOYEES },
  { id: 'reports', label: 'Go to Reports', icon: FileText, action: ROUTES.REPORTS },
  { id: 'alerts', label: 'Go to Alerts', icon: Bell, action: ROUTES.ALERTS },
  { id: 'settings', label: 'Go to Settings', icon: Settings, action: ROUTES.SETTINGS },
];

export const CommandPalette = () => {
  const { commandPaletteOpen, closeCommandPalette } = useUIStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = useCallback((action: string) => { navigate(action); closeCommandPalette(); setQuery(''); }, [navigate, closeCommandPalette]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); useUIStore.getState().openCommandPalette(); }
      if (e.key === 'Escape') closeCommandPalette();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeCommandPalette]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="fixed inset-0 bg-black/50" onClick={closeCommandPalette} />
      <div className="relative w-full max-w-lg bg-background rounded-lg shadow-lg">
        <div className="flex items-center px-4 border-b">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input className="flex-1 px-4 py-3 bg-transparent border-0 outline-none" placeholder="Search commands..." value={query} onChange={e => setQuery(e.target.value)} autoFocus />
        </div>
        <div className="max-h-80 overflow-auto p-2">
          {filtered.map(cmd => (
            <button key={cmd.id} onClick={() => handleSelect(cmd.action)} className="flex items-center gap-3 w-full px-4 py-2 rounded-md hover:bg-muted">
              <cmd.icon className="h-5 w-5" /><span>{cmd.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};