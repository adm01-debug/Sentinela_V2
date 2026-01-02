// ============================================================
// FILE IMPORTER COMPONENT
// Importação de arquivos CSV/Excel com validação e preview
// ============================================================

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  X,
} from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { importCSV, formatFileSize, type ImportResult } from '@/lib/csvImporter';
import { importExcel } from '@/lib/excelImporter';

// ============================================================
// TYPES
// ============================================================

type FileType = 'csv' | 'excel' | 'both';

interface FileImporterProps<T> {
  schema: z.ZodSchema<T>;
  onImport: (data: T[]) => Promise<void>;
  fileType?: FileType;
  templateUrl?: string;
  maxFileSize?: number; // bytes
  maxRows?: number;
  title?: string;
  description?: string;
  onClose?: () => void;
  showPreview?: boolean;
  previewRows?: number;
}

interface ImportState<T> {
  status: 'idle' | 'reading' | 'validating' | 'previewing' | 'importing' | 'done' | 'error';
  file: File | null;
  result: ImportResult<T> | null;
  error: string | null;
  progress: number;
}

// ============================================================
// COMPONENT
// ============================================================

export function FileImporter<T>({
  schema,
  onImport,
  fileType = 'both',
  templateUrl,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxRows = 10000,
  title = 'Importar Dados',
  description = 'Selecione um arquivo CSV ou Excel para importar',
  onClose,
  showPreview = true,
  previewRows = 5,
}: FileImporterProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<ImportState<T>>({
    status: 'idle',
    file: null,
    result: null,
    error: null,
    progress: 0,
  });

  // ============================================================
  // FILE HANDLING
  // ============================================================

  const acceptedTypes = {
    csv: '.csv',
    excel: '.xlsx,.xls',
    both: '.csv,.xlsx,.xls',
  }[fileType];

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validar tamanho
      if (file.size > maxFileSize) {
        setState((s) => ({
          ...s,
          status: 'error',
          error: `Arquivo muito grande. Máximo: ${formatFileSize(maxFileSize)}`,
        }));
        return;
      }

      setState((s) => ({ ...s, status: 'reading', file, progress: 10 }));

      try {
        // Detectar tipo e processar
        const isExcel = file.name.match(/\.xlsx?$/i);
        setState((s) => ({ ...s, status: 'validating', progress: 30 }));

        const result = isExcel
          ? await importExcel(file, schema, { maxRows })
          : await importCSV(file, schema, { maxRows });

        setState((s) => ({
          ...s,
          status: 'previewing',
          result,
          progress: 50,
        }));
      } catch (error) {
        setState((s) => ({
          ...s,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro ao processar arquivo',
        }));
      }
    },
    [schema, maxFileSize, maxRows]
  );

  // ============================================================
  // IMPORT ACTION
  // ============================================================

  const handleConfirmImport = async () => {
    if (!state.result || state.result.success.length === 0) return;

    setState((s) => ({ ...s, status: 'importing', progress: 60 }));

    try {
      await onImport(state.result.success);
      setState((s) => ({ ...s, status: 'done', progress: 100 }));

      // Auto close após 2 segundos
      setTimeout(() => {
        handleReset();
        onClose?.();
      }, 2000);
    } catch (error) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro ao importar dados',
      }));
    }
  };

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    setState({
      status: 'idle',
      file: null,
      result: null,
      error: null,
      progress: 0,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ============================================================
  // RENDER HELPERS
  // ============================================================

  const renderDropZone = () => (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
        'hover:border-primary hover:bg-primary/5 cursor-pointer',
        state.status === 'error' && 'border-destructive'
      )}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="flex flex-col items-center gap-4">
        {fileType === 'csv' ? (
          <FileText className="h-12 w-12 text-muted-foreground" />
        ) : fileType === 'excel' ? (
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
        ) : (
          <Upload className="h-12 w-12 text-muted-foreground" />
        )}

        <div>
          <p className="font-medium">Clique para selecionar</p>
          <p className="text-sm text-muted-foreground">
            ou arraste um arquivo aqui
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Formatos aceitos: {acceptedTypes.replace(/\./g, '').toUpperCase()}
          <br />
          Tamanho máximo: {formatFileSize(maxFileSize)}
        </p>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-4 py-4">
      <Progress value={state.progress} className="h-2" />
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>
          {state.status === 'reading' && 'Lendo arquivo...'}
          {state.status === 'validating' && 'Validando dados...'}
          {state.status === 'importing' && 'Importando...'}
        </span>
      </div>
    </div>
  );

  const renderPreview = () => {
    if (!state.result) return null;

    const { success, errors, total, duration } = state.result;
    const previewData = success.slice(0, previewRows) as Record<string, unknown>[];
    const columns = previewData.length > 0 ? Object.keys(previewData[0]) : [];

    return (
      <div className="space-y-4">
        {/* Summary */}
        <div className="flex gap-4">
          <Alert className={cn(errors.length === 0 ? 'border-green-500' : 'border-yellow-500')}>
            <div className="flex items-center gap-2">
              {errors.length === 0 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <div>
                <AlertTitle>
                  {success.length} de {total} registros válidos
                </AlertTitle>
                <AlertDescription>
                  {errors.length > 0 && `${errors.length} erros encontrados • `}
                  Processado em {duration.toFixed(0)}ms
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="max-h-32 overflow-y-auto border rounded p-2 bg-destructive/5">
            <p className="text-sm font-medium text-destructive mb-2">
              Erros encontrados:
            </p>
            {errors.slice(0, 10).map((err, i) => (
              <p key={i} className="text-xs text-destructive">
                Linha {err.row}, campo "{err.field}": {err.error}
              </p>
            ))}
            {errors.length > 10 && (
              <p className="text-xs text-muted-foreground mt-2">
                + {errors.length - 10} erros adicionais
              </p>
            )}
          </div>
        )}

        {/* Preview Table */}
        {showPreview && previewData.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">
              Preview ({previewRows} primeiros registros):
            </p>
            <ScrollArea className="h-[200px] border rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.slice(0, 5).map((col) => (
                      <TableHead key={col} className="whitespace-nowrap">
                        {col}
                      </TableHead>
                    ))}
                    {columns.length > 5 && <TableHead>...</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, i) => (
                    <TableRow key={i}>
                      {columns.slice(0, 5).map((col) => (
                        <TableCell key={col} className="max-w-[150px] truncate">
                          {String(row[col] ?? '')}
                        </TableCell>
                      ))}
                      {columns.length > 5 && <TableCell>...</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}
      </div>
    );
  };

  const renderDone = () => (
    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <AlertTitle>Importação concluída!</AlertTitle>
      <AlertDescription>
        {state.result?.success.length} registros importados com sucesso.
      </AlertDescription>
    </Alert>
  );

  const renderError = () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro na importação</AlertTitle>
      <AlertDescription>{state.error}</AlertDescription>
    </Alert>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {templateUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={templateUrl} download>
              <Download className="h-4 w-4 mr-2" />
              Template
            </a>
          </Button>
        )}
      </div>

      {/* Content */}
      {state.status === 'idle' && renderDropZone()}
      {['reading', 'validating', 'importing'].includes(state.status) && renderProgress()}
      {state.status === 'previewing' && renderPreview()}
      {state.status === 'done' && renderDone()}
      {state.status === 'error' && renderError()}

      {/* Actions */}
      {state.status === 'previewing' && state.result && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmImport}
            disabled={state.result.success.length === 0}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar {state.result.success.length} Registros
          </Button>
        </div>
      )}

      {state.status === 'error' && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleReset}>
            Tentar Novamente
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// DIALOG VARIANT
// ============================================================

interface FileImporterDialogProps<T> extends FileImporterProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileImporterDialog<T>({
  open,
  onOpenChange,
  ...props
}: FileImporterDialogProps<T>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{props.title ?? 'Importar Dados'}</DialogTitle>
          <DialogDescription>
            {props.description ?? 'Selecione um arquivo para importar'}
          </DialogDescription>
        </DialogHeader>

        <FileImporter {...props} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

export default FileImporter;
