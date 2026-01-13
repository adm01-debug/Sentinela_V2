import React, { useState, useMemo } from 'react';
export interface AutocompleteOption { value: string; label: string; }
export interface FormAutocompleteProps { options: AutocompleteOption[]; value?: string; onChange?: (value: string) => void; label?: string; error?: string; placeholder?: string; disabled?: boolean; className?: string; }
export const FormAutocomplete: React.FC<FormAutocompleteProps> = ({ options, value = '', onChange, label, error, placeholder, disabled, className }) => {
  const [input, setInput] = useState(value);
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => options.filter(o => o.label.toLowerCase().includes(input.toLowerCase())), [options, input]);
  return (
    <div className={className} style={{ position: 'relative' }}>
      {label && <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}</label>}
      <input value={input} onChange={e => { setInput(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} placeholder={placeholder} disabled={disabled} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${error ? '#ff4d4f' : '#d9d9d9'}`, borderRadius: 6 }} />
      {open && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 200, overflow: 'auto', backgroundColor: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, zIndex: 10 }}>
          {filtered.map(o => <div key={o.value} onClick={() => { setInput(o.label); onChange?.(o.value); setOpen(false); }} style={{ padding: '8px 12px', cursor: 'pointer' }}>{o.label}</div>)}
        </div>
      )}
      {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{error}</p>}
    </div>
  );
};
export default FormAutocomplete;
