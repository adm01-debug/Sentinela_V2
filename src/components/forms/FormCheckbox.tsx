import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
export interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> { register?: UseFormRegisterReturn; label: string; error?: string; }
export const FormCheckbox: React.FC<FormCheckboxProps> = ({ register, label, error, className, ...props }) => (
  <div className={className}>
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <input type="checkbox" {...register} {...props} style={{ width: 16, height: 16, accentColor: '#1890ff' }} />
      <span>{label}</span>
    </label>
    {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{error}</p>}
  </div>
);
export default FormCheckbox;
