import React, { useRef, useState } from 'react';
export interface FormFileUploadProps { onUpload?: (files: FileList) => void; accept?: string; multiple?: boolean; label?: string; error?: string; maxSize?: number; disabled?: boolean; className?: string; }
export const FormFileUpload: React.FC<FormFileUploadProps> = ({ onUpload, accept, multiple, label, error, maxSize, disabled, className }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const handleFiles = (files: FileList | null) => { if (files && onUpload) onUpload(files); };
  return (
    <div className={className}>
      {label && <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>{label}</label>}
      <div onClick={() => inputRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        style={{ padding: 24, border: `2px dashed ${dragOver ? '#1890ff' : '#d9d9d9'}`, borderRadius: 8, textAlign: 'center', cursor: disabled ? 'not-allowed' : 'pointer', backgroundColor: dragOver ? '#e6f7ff' : '#fafafa' }}>
        <p style={{ margin: 0, color: '#666' }}>Click or drag files here</p>
        {maxSize && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#999' }}>Max size: {maxSize}MB</p>}
      </div>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={e => handleFiles(e.target.files)} disabled={disabled} style={{ display: 'none' }} />
      {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff4d4f' }}>{error}</p>}
    </div>
  );
};
export default FormFileUpload;
