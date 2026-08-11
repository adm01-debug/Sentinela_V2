import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { exportToXlsx, type XlsxSheet } from '@/lib/exporters/xlsx';
import { useToast } from '@/hooks/use-toast';

interface Props<T extends Record<string, unknown>> {
  filename: string;
  sheets: XlsxSheet<T>[];
  disabled?: boolean;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function XlsxExportButton<T extends Record<string, unknown>>({
  filename,
  sheets,
  disabled,
  label = 'Baixar Excel',
  variant = 'outline',
  size = 'default',
}: Props<T>) {
  const { toast } = useToast();

  const handleClick = () => {
    const totalRows = sheets.reduce((n, s) => n + s.rows.length, 0);
    if (totalRows === 0) {
      toast({ title: 'Sem dados', description: 'Nada para exportar.', variant: 'destructive' });
      return;
    }
    try {
      exportToXlsx(filename, sheets);
      toast({ title: 'Exportação concluída', description: `${totalRows} registros` });
    } catch (e) {
      toast({ title: 'Erro ao exportar', description: (e as Error).message, variant: 'destructive' });
    }
  };

  return (
    <Button onClick={handleClick} disabled={disabled} variant={variant} size={size}>
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
