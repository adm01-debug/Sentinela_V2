import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({ value, onChange, placeholder = 'Selecionar hora', disabled, className }: TimePickerProps) {
  const [hour, setHour] = React.useState(value?.split(':')[0] || '');
  const [minute, setMinute] = React.useState(value?.split(':')[1] || '');

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  React.useEffect(() => {
    if (hour && minute) onChange?.(`${hour}:${minute}`);
  }, [hour, minute, onChange]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !value && 'text-muted-foreground', className)} disabled={disabled}>
          <Clock className="mr-2 h-4 w-4" />
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex items-center gap-2">
          <Select value={hour} onValueChange={setHour}>
            <SelectTrigger className="w-20"><SelectValue placeholder="HH" /></SelectTrigger>
            <SelectContent>{hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
          </Select>
          <span className="text-xl">:</span>
          <Select value={minute} onValueChange={setMinute}>
            <SelectTrigger className="w-20"><SelectValue placeholder="MM" /></SelectTrigger>
            <SelectContent>{minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
