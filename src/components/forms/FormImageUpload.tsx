import React, { useRef, useState } from 'react';
export interface FormImageUploadProps { value?: string; onUpload?: (file: File) => void; label?: string; error?: string; maxSize?: number; disabled?: boolean; className?: string; }
export const FormImageUpload: React.FC<FormImageUploadProps> = ({ value, onUpload, label, error, maxSize = 5, disabled, className }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(value);
  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > maxSize * 1024 * 1024) { alert(`Max size is ${maxSize}MB`); return; }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    onUpload?.(file);
  };
  return (
    <div className={className}>
      {label && <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}</label>}
      <div onClick={() => inputRef.current?.click()} style={{ width: 128, height: 128, border: '2px dashed #d9d9d9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'not-allowed' : 'pointer', overflow: 'hidden', backgroundColor: '#fafafa' }}>
        {preview ? <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#666' }}>+</span>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0])} disabled={disabled} style={{ display: 'none' }} />
      {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{error}</p>}
    </div>
  );
};
export default FormImageUpload;
