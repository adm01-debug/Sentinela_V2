import { cn } from '@/utils/cn';

interface SwitchProps { checked: boolean; onChange: (checked: boolean) => void; label?: string; disabled?: boolean; }

export const Switch = ({ checked, onChange, label, disabled }: SwitchProps) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn('relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', checked ? 'bg-primary' : 'bg-input')}
    >
      <span className={cn('pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform', checked ? 'translate-x-5' : 'translate-x-0')} />
    </button>
    {label && <span className="text-sm">{label}</span>}
  </label>
);