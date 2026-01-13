import React from 'react';
export interface FormSliderProps { value?: number; onChange?: (value: number) => void; min?: number; max?: number; step?: number; label?: string; showValue?: boolean; disabled?: boolean; className?: string; }
export const FormSlider: React.FC<FormSliderProps> = ({ value = 50, onChange, min = 0, max = 100, step = 1, label, showValue = true, disabled, className }) => (
  <div className={className}>
    {label && <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}{showValue && <span style={{ float: 'right', color: '#666' }}>{value}</span>}</label>}
    <input type="range" value={value} onChange={e => onChange?.(Number(e.target.value))} min={min} max={max} step={step} disabled={disabled} style={{ width: '100%', accentColor: '#1890ff' }} />
  </div>
);
export default FormSlider;
