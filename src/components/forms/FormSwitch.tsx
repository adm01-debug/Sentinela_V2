import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
export interface FormSwitchProps { register?: UseFormRegisterReturn; label?: string; checked?: boolean; onChange?: (checked: boolean) => void; disabled?: boolean; className?: string; }
export const FormSwitch: React.FC<FormSwitchProps> = ({ register, label, checked, onChange, disabled, className }) => (
  <label className={className} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
    <div style={{ width: 44, height: 22, backgroundColor: checked ? '#1890ff' : '#d9d9d9', borderRadius: 11, position: 'relative', transition: '0.2s' }}>
      <input type="checkbox" {...register} checked={checked} onChange={e => onChange?.(e.target.checked)} disabled={disabled} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'inherit' }} />
      <div style={{ width: 18, height: 18, backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: checked ? 24 : 2, transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
    </div>
    {label && <span>{label}</span>}
  </label>
);
export default FormSwitch;
