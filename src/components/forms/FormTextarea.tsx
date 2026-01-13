import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { register?: UseFormRegisterReturn; error?: string; label?: string; }
export const FormTextarea: React.FC<FormTextareaProps> = ({ register, error, label, className, ...props }) => (
  <div className={className}>
    {label && <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}</label>}
    <textarea {...register} {...props} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${error ? '#ff4d4f' : '#d9d9d9'}`, borderRadius: 6, fontSize: 14, outline: 'none', minHeight: 100, resize: 'vertical' }} />
    {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{error}</p>}
  </div>
);
export default FormTextarea;
