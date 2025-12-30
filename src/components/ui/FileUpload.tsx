import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, X, File, Image, FileText, Film, Music, Archive, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// ============================================
// FILE UPLOAD DROPZONE
// ============================================

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  onUpload: (files: File[]) => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  accept = '*',
  multiple = false,
  maxSize = 10,
  maxFiles = 5,
  onUpload,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback((files: File[]): File[] | null => {
    setError(null);

    if (files.length > maxFiles) {
      setError(`Máximo de ${maxFiles} arquivos permitidos`);
      return null;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (file.size > maxSize * 1024 * 1024) {
        setError(`Arquivo "${file.name}" excede ${maxSize}MB`);
        return null;
      }
      validFiles.push(file);
    }

    return validFiles;
  }, [maxSize, maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(files);
    if (validFiles) {
      onUpload(validFiles);
    }
  }, [disabled, validateFiles, onUpload]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !e.target.files) return;

    const files = Array.from(e.target.files);
    const validFiles = validateFiles(files);
    if (validFiles) {
      onUpload(validFiles);
    }
    e.target.value = '';
  }, [disabled, validateFiles, onUpload]);

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging && 'border-primary bg-primary/5',
          !isDragging && 'border-border hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Arraste arquivos ou <span className="text-primary">clique para selecionar</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {accept === '*' ? 'Qualquer tipo de arquivo' : accept} • Máx. {maxSize}MB
            </p>
          </div>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

// ============================================
// FILE ITEM
// ============================================

interface FileItemProps {
  file: {
    name: string;
    size: number;
    type: string;
    url?: string;
  };
  progress?: number;
  status?: 'uploading' | 'complete' | 'error';
  error?: string;
  onRemove?: () => void;
  onRetry?: () => void;
  className?: string;
}

const fileIcons: Record<string, React.ElementType> = {
  image: Image,
  video: Film,
  audio: Music,
  document: FileText,
  archive: Archive,
  default: File,
};

function getFileIcon(type: string): React.ElementType {
  if (type.startsWith('image/')) return fileIcons.image;
  if (type.startsWith('video/')) return fileIcons.video;
  if (type.startsWith('audio/')) return fileIcons.audio;
  if (type.includes('pdf') || type.includes('document') || type.includes('text')) return fileIcons.document;
  if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return fileIcons.archive;
  return fileIcons.default;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function FileItem({
  file,
  progress,
  status = 'complete',
  error,
  onRemove,
  onRetry,
  className,
}: FileItemProps) {
  const Icon = getFileIcon(file.type);

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-lg border bg-card', className)}>
      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(file.size)}</span>
          {status === 'uploading' && progress !== undefined && (
            <span>• {progress}%</span>
          )}
          {status === 'error' && error && (
            <span className="text-destructive">• {error}</span>
          )}
        </div>
        {status === 'uploading' && progress !== undefined && (
          <Progress value={progress} className="h-1 mt-2" />
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {status === 'uploading' && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {status === 'complete' && (
          <Check className="h-4 w-4 text-green-500" />
        )}
        {status === 'error' && onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
        {onRemove && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================
// FILE LIST
// ============================================

interface FileListProps {
  files: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    progress?: number;
    status?: 'uploading' | 'complete' | 'error';
    error?: string;
  }>;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  className?: string;
}

export function FileList({ files, onRemove, onRetry, className }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {files.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          progress={file.progress}
          status={file.status}
          error={file.error}
          onRemove={onRemove ? () => onRemove(file.id) : undefined}
          onRetry={onRetry ? () => onRetry(file.id) : undefined}
        />
      ))}
    </div>
  );
}

export default {
  FileUpload,
  FileItem,
  FileList,
};
