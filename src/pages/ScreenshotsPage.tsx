import { useState } from 'react';
import { format } from 'date-fns';
import { Grid, List, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { Skeleton } from '@/components/Skeleton';
import { useScreenshots } from '@/hooks/useScreenshots';
import { useEmployees } from '@/hooks/useEmployees';

export default function ScreenshotsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState<Date>();
  const [search, setSearch] = useState('');

  const { data: employees } = useEmployees();
  const { data: screenshots, isLoading } = useScreenshots({ employeeId, date: date?.toISOString(), search });

  const images = screenshots?.map(s => ({ src: s.url, alt: s.application, title: `${s.employeeName} - ${format(new Date(s.capturedAt), 'HH:mm')}` })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Screenshots</h1>
        <div className="flex gap-2">
          <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setView('grid')}><Grid className="h-4 w-4" /></Button>
          <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setView('list')}><List className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por aplicação..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Funcionário" /></SelectTrigger>
          <SelectContent>{employees?.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
        </Select>
        <DatePicker date={date} onDateChange={setDate} placeholder="Selecionar data" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="aspect-video" />)}</div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum screenshot encontrado.</div>
      ) : (
        <ImageGallery images={images} columns={view === 'grid' ? 4 : 2} />
      )}
    </div>
  );
}