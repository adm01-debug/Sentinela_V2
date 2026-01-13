import React from 'react';
export interface DateRange { start: string; end: string; }
export interface FormDateRangePickerProps { value?: DateRange; onChange?: (range: DateRange) => void; label?: string; error?: string; disabled?: boolean; className?: string; }
export const FormDateRangePicker: React.FC<FormDateRangePickerProps> = ({ value = { start: '', end: '' }, onChange, label, error, disabled, className }) => (
  <div className={className}>
    {label && <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}</label>}
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input type="date" value={value.start} onChange={e => onChange?.({ ...value, start: e.target.value })} disabled={disabled} style={{ flex: 1, padding: '8px 12px', border: `1px solid ${error ? '#ff4d4f' : '#d9d9d9'}`, borderRadius: 6, fontSize: 14 }} />
      <span>→</span>
      <input type="date" value={value.end} onChange={e => onChange?.({ ...value, end: e.target.value })} disabled={disabled} style={{ flex: 1, padding: '8px 12px', border: `1px solid ${error ? '#ff4d4f' : '#d9d9d9'}`, borderRadius: 6, fontSize: 14 }} />
    </div>
    {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{error}</p>}
  </div>
);
export default FormDateRangePicker;
