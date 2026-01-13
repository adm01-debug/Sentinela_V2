import React from 'react';
export interface FormColorPickerProps { value?: string; onChange?: (color: string) => void; label?: string; presets?: string[]; disabled?: boolean; className?: string; }
const defaultPresets = ['#ff4d4f', '#fa8c16', '#fadb14', '#52c41a', '#1890ff', '#722ed1', '#eb2f96', '#000000'];
export const FormColorPicker: React.FC<FormColorPickerProps> = ({ value = '#1890ff', onChange, label, presets = defaultPresets, disabled, className }) => (
  <div className={className}>
    {label && <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}</label>}
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input type="color" value={value} onChange={e => onChange?.(e.target.value)} disabled={disabled} style={{ width: 40, height: 40, padding: 0, border: 'none', cursor: 'pointer' }} />
      <div style={{ display: 'flex', gap: 4 }}>
        {presets.map(color => (
          <button key={color} onClick={() => onChange?.(color)} disabled={disabled} style={{ width: 24, height: 24, backgroundColor: color, border: value === color ? '2px solid #000' : '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer' }} />
        ))}
      </div>
    </div>
  </div>
);
export default FormColorPicker;
