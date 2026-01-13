import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
export interface RadioOption { value: string; label: string; }
export interface FormRadioGroupProps { register?: UseFormRegisterReturn; options: RadioOption[]; name: string; label?: string; error?: string; direction?: 'horizontal' | 'vertical'; className?: string; }
export const FormRadioGroup: React.FC<FormRadioGroupProps> = ({ register, options, name, label, error, direction = 'vertical', className }) => (
  <div className={className}>
    {label && <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>{label}</label>}
    <div style={{ display: 'flex', flexDirection: direction === 'horizontal' ? 'row' : 'column', gap: 8 }}>
      {options.map(opt => (
        <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="radio" value={opt.value} {...register} style={{ width: 16, height: 16, accentColor: '#1890ff' }} />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
    {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{error}</p>}
  </div>
);
export default FormRadioGroup;
