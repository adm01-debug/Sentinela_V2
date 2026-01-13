import React, { useState } from 'react';
export interface FormTagInputProps { value?: string[]; onChange?: (tags: string[]) => void; label?: string; error?: string; placeholder?: string; disabled?: boolean; className?: string; }
export const FormTagInput: React.FC<FormTagInputProps> = ({ value = [], onChange, label, error, placeholder = 'Add tag...', disabled, className }) => {
  const [input, setInput] = useState('');
  const addTag = () => { if (input.trim() && !value.includes(input.trim())) { onChange?.([...value, input.trim()]); setInput(''); } };
  const removeTag = (tag: string) => onChange?.(value.filter(t => t !== tag));
  return (
    <div className={className}>
      {label && <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}</label>}
      <div style={{ padding: 8, border: `1px solid ${error ? '#ff4d4f' : '#d9d9d9'}`, borderRadius: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {value.map(tag => <span key={tag} style={{ padding: '2px 8px', backgroundColor: '#f0f0f0', borderRadius: 4, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>{tag}<button onClick={() => removeTag(tag)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>×</button></span>)}
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder={placeholder} disabled={disabled} style={{ border: 'none', outline: 'none', flex: 1, minWidth: 100 }} />
      </div>
      {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{error}</p>}
    </div>
  );
};
export default FormTagInput;
