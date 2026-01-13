import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
export interface FormSelectOption { value: string; label: string; }
export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { register?: UseFormRegisterReturn; options: FormSelectOption[]; error?: string; label?: string; placeholder?: string; }
export const FormSelect: React.FC<FormSelectProps> = ({ register, options, error, label, placeholder, className, ...props }) => (
  <div className={className}>
    {label && <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}</label>}
    <select {...register} {...props} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${error ? '#ff4d4f' : '#d9d9d9'}`, borderRadius: 6, fontSize: 14, outline: 'none', backgroundColor: '#fff' }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{error}</p>}
  </div>
);
export default FormSelect;
