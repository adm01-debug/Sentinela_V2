import React from 'react';
export interface FormTimePickerProps { value?: string; onChange?: (time: string) => void; label?: string; error?: string; min?: string; max?: string; disabled?: boolean; className?: string; }
export const FormTimePicker: React.FC<FormTimePickerProps> = ({ value, onChange, label, error, min, max, disabled, className }) => (
  <div className={className}>
    {label && <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}</label>}
    <input type="time" value={value} onChange={e => onChange?.(e.target.value)} min={min} max={max} disabled={disabled} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${error ? '#ff4d4f' : '#d9d9d9'}`, borderRadius: 6, fontSize: 14 }} />
    {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{error}</p>}
  </div>
);
export default FormTimePicker;
