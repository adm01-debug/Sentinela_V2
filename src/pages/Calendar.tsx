import { useState } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

export default function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Calendar</h1>
      <CalendarComponent mode='single' selected={date} onSelect={setDate} className='rounded-md border' />
    </div>
  );
}