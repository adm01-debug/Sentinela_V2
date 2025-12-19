import { memo, useCallback, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateRangePickerProps {
  value?: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date } | undefined) => void;
  className?: string;
  placeholder?: string;
}

function DateRangePickerComponent({
  value,
  onChange,
  className,
  placeholder = 'Selecione o período',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback((range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onChange({ from: range.from, to: range.to });
      setOpen(false);
    } else if (!range) {
      onChange(undefined);
    }
  }, [onChange]);

  const displayText = value?.from && value?.to
    ? `${format(value.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(value.to, 'dd/MM/yyyy', { locale: ptBR })}`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={value?.from}
          selected={value ? { from: value.from, to: value.to } : undefined}
          onSelect={handleSelect}
          numberOfMonths={2}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}

export const DateRangePicker = memo(DateRangePickerComponent);
