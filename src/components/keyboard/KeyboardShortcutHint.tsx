import { cn } from '@/utils/cn';

interface KeyboardShortcutHintProps {
  keys: string[];
  className?: string;
}

export function KeyboardShortcutHint({ keys, className }: KeyboardShortcutHintProps) {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const formatKey = (key: string) => {
    const map: Record<string, string> = {
      ctrl: isMac ? '⌘' : 'Ctrl',
      alt: isMac ? '⌥' : 'Alt',
      shift: '⇧',
      enter: '↵',
      escape: 'Esc',
      backspace: '⌫',
    };
    return map[key.toLowerCase()] || key.toUpperCase();
  };

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {keys.map((key, i) => (
        <kbd key={i} className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">{formatKey(key)}</kbd>
      ))}
    </span>
  );
}
