import React, { useState } from 'react';
export interface CalendarEvent { id: string; title: string; date: string; color?: string; }
export interface DataCalendarProps { events?: CalendarEvent[]; onDateClick?: (date: Date) => void; onEventClick?: (event: CalendarEvent) => void; className?: string; }
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
export const DataCalendar: React.FC<DataCalendarProps> = ({ events = [], onDateClick, onEventClick, className }) => {
  const [date, setDate] = useState(new Date());
  const year = date.getFullYear(), month = date.getMonth();
  const days = getDaysInMonth(year, month), firstDay = getFirstDayOfMonth(year, month);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const prev = () => setDate(new Date(year, month - 1)); const next = () => setDate(new Date(year, month + 1));
  return (
    <div className={className} style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={prev} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18 }}>‹</button>
        <h3 style={{ margin: 0 }}>{months[month]} {year}</h3>
        <button onClick={next} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18 }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} style={{ padding: 8, textAlign: 'center', fontWeight: 600, fontSize: 12 }}>{d}</div>)}
        {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {Array(days).fill(null).map((_, i) => {
          const d = `${year}-${String(month+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
          const dayEvents = events.filter(e => e.date === d);
          return <div key={i} role="button" tabIndex={0} onClick={() => onDateClick?.(new Date(d))} onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onDateClick?.(new Date(d)); } }} style={{ padding: 4, minHeight: 60, border: '1px solid #f0f0f0', cursor: 'pointer' }}>
            <div style={{ fontSize: 12 }}>{i+1}</div>
            {dayEvents.slice(0,2).map(e => <div key={e.id} role="button" tabIndex={0} onClick={ev => { ev.stopPropagation(); onEventClick?.(e); }} onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ev.stopPropagation(); onEventClick?.(e); } }} style={{ fontSize: 10, padding: 2, backgroundColor: e.color || '#1890ff', color: '#fff', borderRadius: 2, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>)}
          </div>;
        })}
      </div>
    </div>
  );
};
export default DataCalendar;
