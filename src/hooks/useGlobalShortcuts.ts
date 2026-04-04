import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  category: string;
  action: () => void;
}

/**
 * Global keyboard shortcuts registry.
 * Ignores shortcuts when typing in inputs/textareas.
 */
export function useGlobalShortcuts(onToggleHelp: () => void) {
  const navigate = useNavigate();
  const helpToggle = useRef(onToggleHelp);
  helpToggle.current = onToggleHelp;

  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    { key: 'd', alt: true, description: 'Ir para Dashboard', category: 'Navegação', action: () => navigate(ROUTES.DASHBOARD) },
    { key: 'e', alt: true, description: 'Ir para Funcionários', category: 'Navegação', action: () => navigate(ROUTES.EMPLOYEES) },
    { key: 'a', alt: true, description: 'Ir para Alertas', category: 'Navegação', action: () => navigate(ROUTES.ALERTS) },
    { key: 'r', alt: true, description: 'Ir para Relatórios', category: 'Navegação', action: () => navigate(ROUTES.REPORTS) },
    { key: 's', alt: true, description: 'Ir para Configurações', category: 'Navegação', action: () => navigate(ROUTES.SETTINGS) },
    // Actions
    { key: '?', shift: true, description: 'Mostrar atalhos', category: 'Geral', action: () => helpToggle.current() },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const tag = target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable) return;

    for (const s of shortcuts) {
      const ctrlMatch = s.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
      const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = s.alt ? e.altKey : !e.altKey;

      if (e.key.toLowerCase() === s.key.toLowerCase() && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault();
        s.action();
        return;
      }
    }
  }, [navigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

/** Group shortcuts by category */
export function groupShortcuts(shortcuts: KeyboardShortcut[]) {
  return shortcuts.reduce<Record<string, KeyboardShortcut[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});
}

/** Format shortcut key combo for display */
export function formatShortcutKey(s: KeyboardShortcut): string {
  const parts: string[] = [];
  if (s.ctrl) parts.push('Ctrl');
  if (s.alt) parts.push('Alt');
  if (s.shift) parts.push('Shift');
  parts.push(s.key.toUpperCase());
  return parts.join(' + ');
}
