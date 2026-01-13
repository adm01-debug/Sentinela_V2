import React, { useState } from 'react';
export interface MultiSelectOption { value: string; label: string; }
export interface FormMultiSelectProps { options: MultiSelectOption[]; value?: string[]; onChange?: (values: string[]) => void; label?: string; error?: string; placeholder?: string; disabled?: boolean; className?: string; }
export const FormMultiSelect: React.FC<FormMultiSelectProps> = ({ options, value = [], onChange, label, error, placeholder = 'Select...', disabled, className }) => {
  const [open, setOpen] = useState(false);
  const toggle = (v: string) => onChange?.(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  return (
    <div className={className} style={{ position: 'relative' }}>
      {label && <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}</label>}
      <div onClick={() => !disabled && setOpen(!open)} style={{ padding: '8px 12px', border: `1px solid ${error ? '#ff4d4f' : '#d9d9d9'}`, borderRadius: 6, minHeight: 38, cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {value.length ? value.map(v => <span key={v} style={{ padding: '2px 8px', backgroundColor: '#e6f7ff', borderRadius: 4, fontSize: 12 }}>{options.find(o => o.value === v)?.label}</span>) : <span style={{ color: '#999' }}>{placeholder}</span>}
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 200, overflow: 'auto', backgroundColor: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, zIndex: 10 }}>
          {options.map(o => <div key={o.value} onClick={() => toggle(o.value)} style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: value.includes(o.value) ? '#e6f7ff' : 'transparent' }}>{o.label}</div>)}
        </div>
      )}
      {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{error}</p>}
    </div>
  );
};
export default FormMultiSelect;
