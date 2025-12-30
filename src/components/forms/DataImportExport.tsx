import React, { memo, useState, useCallback } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// CSV Import Wizard
interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: (value: string) => any;
}

interface ImportWizardProps {
  targetFields: { key: string; label: string; required?: boolean }[];
  onImport: (data: any[], mappings: FieldMapping[]) => Promise<void>;
  templateUrl?: string;
  trigger?: React.ReactNode;
}

export const ImportWizard = memo(function ImportWizard({
  targetFields,
  onImport,
  templateUrl,
  trigger,
}: ImportWizardProps) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    // Parse CSV headers
    const text = await selectedFile.text();
    const lines = text.split('\n');
    const headerLine = lines[0];
    const parsedHeaders = headerLine.split(',').map((h) => h.trim().replace(/"/g, ''));
    setHeaders(parsedHeaders);

    // Auto-map fields with matching names
    const autoMappings: Record<string, string> = {};
    targetFields.forEach((field) => {
      const matchingHeader = parsedHeaders.find(
        (h) => h.toLowerCase() === field.key.toLowerCase() || h.toLowerCase() === field.label.toLowerCase()
      );
      if (matchingHeader) {
        autoMappings[field.key] = matchingHeader;
      }
    });
    setMappings(autoMappings);

    // Parse preview data (first 5 rows)
    const preview = lines.slice(1, 6).map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
      const row: Record<string, string> = {};
      parsedHeaders.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
    setPreviewData(preview);

    setStep(1);
  }, [targetFields]);

  const handleMappingChange = useCallback((targetField: string, sourceField: string) => {
    setMappings((prev) => ({
      ...prev,
      [targetField]: sourceField,
    }));
  }, []);

  const validateMappings = useCallback(() => {
    const missingRequired = targetFields
      .filter((field) => field.required && !mappings[field.key])
      .map((field) => field.label);

    if (missingRequired.length > 0) {
      setErrors([`Campos obrigatórios não mapeados: ${missingRequired.join(', ')}`]);
      return false;
    }

    setErrors([]);
    return true;
  }, [targetFields, mappings]);

  const handleImport = useCallback(async () => {
    if (!validateMappings() || !file) return;

    setIsProcessing(true);
    setStep(3);

    try {
      const text = await file.text();
      const lines = text.split('\n').slice(1);
      const totalLines = lines.length;
      const importData: any[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
        const row: Record<string, any> = {};

        targetFields.forEach((field) => {
          const sourceField = mappings[field.key];
          if (sourceField) {
            const headerIndex = headers.indexOf(sourceField);
            row[field.key] = values[headerIndex] || '';
          }
        });

        importData.push(row);
        setProgress(Math.round(((i + 1) / totalLines) * 100));
      }

      const fieldMappings: FieldMapping[] = Object.entries(mappings).map(([target, source]) => ({
        sourceField: source,
        targetField: target,
      }));

      await onImport(importData, fieldMappings);
      setStep(4);
    } catch (error) {
      setErrors(['Erro ao processar arquivo. Verifique o formato.']);
      setStep(2);
    } finally {
      setIsProcessing(false);
    }
  }, [file, headers, mappings, targetFields, validateMappings, onImport]);

  const resetWizard = useCallback(() => {
    setStep(0);
    setFile(null);
    setHeaders([]);
    setMappings({});
    setPreviewData([]);
    setErrors([]);
    setProgress(0);
    setIsOpen(false);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar Dados</DialogTitle>
          <DialogDescription>
            {step === 0 && 'Selecione um arquivo CSV para importar'}
            {step === 1 && 'Mapeie os campos do arquivo com os campos do sistema'}
            {step === 2 && 'Revise os dados antes de importar'}
            {step === 3 && 'Processando importação...'}
            {step === 4 && 'Importação concluída!'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 0: File Selection */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                  <span className="text-lg font-medium">Selecione um arquivo CSV</span>
                  <span className="text-sm text-muted-foreground">
                    ou arraste e solte aqui
                  </span>
                </label>
              </div>
              {templateUrl && (
                <div className="text-center">
                  <Button variant="link" asChild>
                    <a href={templateUrl} download>
                      <Download className="h-4 w-4 mr-1" />
                      Baixar template de exemplo
                    </a>
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 1: Field Mapping */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="text-sm text-muted-foreground mb-4">
                Arquivo: {file?.name}
              </div>
              <div className="space-y-3">
                {targetFields.map((field) => (
                  <div key={field.key} className="flex items-center gap-4">
                    <div className="w-1/3">
                      <span className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </span>
                    </div>
                    <div className="flex-1">
                      <Select
                        value={mappings[field.key] || ''}
                        onValueChange={(value) => handleMappingChange(field.key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um campo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Não mapear</SelectItem>
                          {headers.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetWizard}>
                  Cancelar
                </Button>
                <Button onClick={() => setStep(2)}>
                  Próximo
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Preview */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {errors.length > 0 && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  {errors.join('. ')}
                </div>
              )}
              <div className="text-sm text-muted-foreground mb-2">
                Preview (primeiras 5 linhas):
              </div>
              <div className="overflow-x-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {targetFields.filter((f) => mappings[f.key]).map((field) => (
                        <th key={field.key} className="px-3 py-2 text-left font-medium">
                          {field.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-t">
                        {targetFields.filter((f) => mappings[f.key]).map((field) => (
                          <td key={field.key} className="px-3 py-2">
                            {row[mappings[field.key]] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button onClick={handleImport}>
                  Importar Dados
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Processing */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 py-8"
            >
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="text-lg font-medium">Processando...</div>
                <Progress value={progress} className="w-full max-w-xs" />
                <div className="text-sm text-muted-foreground">{progress}%</div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 py-8"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                  <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-lg font-medium">Importação Concluída!</div>
                <Button onClick={resetWizard}>
                  Fechar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
});

// Export Button with Format Selection
interface ExportButtonProps {
  onExport: (format: 'csv' | 'xlsx' | 'json') => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export const ExportButton = memo(function ExportButton({
  onExport,
  disabled,
  className,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async (format: 'csv' | 'xlsx' | 'json') => {
    setIsExporting(true);
    try {
      await onExport(format);
    } finally {
      setIsExporting(false);
    }
  }, [onExport]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || isExporting}
        onClick={() => handleExport('csv')}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || isExporting}
        onClick={() => handleExport('xlsx')}
      >
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || isExporting}
        onClick={() => handleExport('json')}
      >
        JSON
      </Button>
    </div>
  );
});
