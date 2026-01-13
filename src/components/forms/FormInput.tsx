import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> { register?: UseFormRegisterReturn; error?: string; label?: string; }
export const FormInput: React.FC<FormInputProps> = ({ register, error, label, className, ...props }) => (
  <div className={className}>
    {label && <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}</label>}
    <input {...register} {...props} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${error ? '#ff4d4f' : '#d9d9d9'}`, borderRadius: 6, fontSize: 14, outline: 'none' }} />
    {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{error}</p>}
  </div>
);
export default FormInput;
