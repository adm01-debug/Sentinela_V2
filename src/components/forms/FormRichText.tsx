import React from 'react';
export interface FormRichTextProps { value?: string; onChange?: (value: string) => void; label?: string; error?: string; placeholder?: string; minHeight?: number; disabled?: boolean; className?: string; }
export const FormRichText: React.FC<FormRichTextProps> = ({ value = '', onChange, label, error, placeholder, minHeight = 200, disabled, className }) => (
  <div className={className}>
    {label && <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}</label>}
    <div contentEditable={!disabled} onInput={e => onChange?.((e.target as HTMLDivElement).innerHTML)} dangerouslySetInnerHTML={{ __html: value }} style={{ minHeight, padding: 12, border: `1px solid ${error ? '#ff4d4f' : '#d9d9d9'}`, borderRadius: 6, outline: 'none' }} />
    {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{error}</p>}
    <p style={{ margin: '4px 0 0', fontSize: 10, color: '#999' }}>Tip: Use Ctrl+B for bold, Ctrl+I for italic</p>
  </div>
);
export default FormRichText;
