import { useCallback, useState } from 'react';
import { Upload, X, File } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatFileSize } from '@/utils/file';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

export function FileUpload({ accept, multiple, maxSize = 10 * 1024 * 1024, onFilesSelected, className }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const validFiles = Array.from(newFiles).filter(f => f.size <= maxSize);
    setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
    onFilesSelected(validFiles);
  }, [maxSize, multiple, onFilesSelected]);

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn('border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors', dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25')}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => document.getElementById('file-input')?.click()}>
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Arraste arquivos ou clique para selecionar</p>
        <input id="file-input" type="file" accept={accept} multiple={multiple} className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>
      {files.map((file, i) => (
        <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded">
          <File className="h-4 w-4" /><span className="flex-1 text-sm truncate">{file.name}</span>
          <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
          <button onClick={() => removeFile(i)}><X className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  );
}
