import React from 'react';
export interface FormFieldProps { label?: string; error?: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string; }
export const FormField: React.FC<FormFieldProps> = ({ label, error, required, hint, children, className }) => (
  <div className={className} style={{ marginBottom: 16 }}>
    {label && <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}{required && <span style={{ color: '#ff4d4f' }}> *</span>}</label>}
    {children}
    {hint && !error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#666' }}>{hint}</p>}
    {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{error}</p>}
  </div>
);
export default FormField;
