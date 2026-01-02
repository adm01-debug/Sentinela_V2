// ============================================================
// EXPORT BUTTON COMPONENT
// Botão com dropdown para exportação em múltiplos formatos
// ============================================================

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, FileJson, Loader2 } from 'lucide-react';
import { useExport, type ExportColumn, type ExportFormat } from '@/hooks/useExport';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  filename?: string;
  columns?: ExportColumn<T>[];
  title?: string;
  subtitle?: string;
  formats?: ExportFormat[];
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

// ============================================================
// FORMAT CONFIG
// ============================================================

const formatConfig: Record<ExportFormat, { label: string; icon: React.ReactNode; description: string }> = {
  csv: {
    label: 'CSV',
    icon: <FileText className="h-4 w-4" />,
    description: 'Arquivo de texto separado por vírgulas',
  },
  excel: {
    label: 'Excel',
    icon: <FileSpreadsheet className="h-4 w-4" />,
    description: 'Planilha Microsoft Excel (.xlsx)',
  },
  pdf: {
    label: 'PDF',
    icon: <FileText className="h-4 w-4" />,
    description: 'Documento PDF para impressão',
  },
  json: {
    label: 'JSON',
    icon: <FileJson className="h-4 w-4" />,
    description: 'Formato de dados estruturado',
  },
};

// ============================================================
// COMPONENT
// ============================================================

export function ExportButton<T extends Record<string, unknown>>({
  data,
  filename = 'export',
  columns,
  title,
  subtitle,
  formats = ['csv', 'excel', 'pdf'],
  disabled = false,
  variant = 'outline',
  size = 'sm',
  className,
  showLabel = true,
}: ExportButtonProps<T>) {
  const { exportCSV, exportExcel, exportPDF, exportJSON, isExporting } = useExport<T>();

  const handleExport = async (format: ExportFormat) => {
    const options = { filename, columns, title, subtitle };

    switch (format) {
      case 'csv':
        exportCSV(data, options);
        break;
      case 'excel':
        await exportExcel(data, options);
        break;
      case 'pdf':
        await exportPDF(data, options);
        break;
      case 'json':
        exportJSON(data, options);
        break;
    }
  };

  const isDisabled = disabled || data.length === 0 || isExporting;

  // ============================================================
  // SINGLE FORMAT BUTTON
  // ============================================================

  if (formats.length === 1) {
    const format = formats[0];
    const config = formatConfig[format];

    return (
      <Button
        variant={variant}
        size={size}
        disabled={isDisabled}
        onClick={() => handleExport(format)}
        className={cn('gap-2', className)}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          config.icon
        )}
        {showLabel && <span>Exportar {config.label}</span>}
      </Button>
    );
  }

  // ============================================================
  // MULTI FORMAT DROPDOWN
  // ============================================================

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isDisabled}
          className={cn('gap-2', className)}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {showLabel && <span>Exportar</span>}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar {data.length} registro{data.length !== 1 ? 's' : ''}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {formats.map((format) => {
          const config = formatConfig[format];
          return (
            <DropdownMenuItem
              key={format}
              onClick={() => handleExport(format)}
              className="flex flex-col items-start gap-0.5 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {config.icon}
                <span className="font-medium">{config.label}</span>
              </div>
              <span className="text-xs text-muted-foreground pl-6">
                {config.description}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================
// SPECIALIZED VARIANTS
// ============================================================

export function ExportCSVButton<T extends Record<string, unknown>>(
  props: Omit<ExportButtonProps<T>, 'formats'>
) {
  return <ExportButton {...props} formats={['csv']} />;
}

export function ExportExcelButton<T extends Record<string, unknown>>(
  props: Omit<ExportButtonProps<T>, 'formats'>
) {
  return <ExportButton {...props} formats={['excel']} />;
}

export function ExportPDFButton<T extends Record<string, unknown>>(
  props: Omit<ExportButtonProps<T>, 'formats'>
) {
  return <ExportButton {...props} formats={['pdf']} />;
}

export default ExportButton;
