const fs = require('fs');
const { startOfWeek, eachDayOfInterval, format } = require('date-fns');

const employees = [
  { id: 'e0000000-0000-0000-0000-000000000001', start: '08:00', end: '17:00' },
  { id: 'e0000000-0000-0000-0000-000000000002', start: '09:00', end: '18:00' },
  { id: 'e0000000-0000-0000-0000-000000000003', start: '08:00', end: '17:00' },
  { id: 'e0000000-0000-0000-0000-000000000004', start: '08:00', end: '17:00' },
  { id: 'e0000000-0000-0000-0000-000000000005', start: '09:00', end: '18:00' },
  { id: 'e0000000-0000-0000-0000-000000000006', start: '09:00', end: '18:00' },
];

const tasks = [
  { proj: '67000000-0000-0000-0000-000000000001', task: '7a000000-0000-0000-0000-000000000002' },
  { proj: '67000000-0000-0000-0000-000000000002', task: '7a000000-0000-0000-0000-000000000004' },
  { proj: '67000000-0000-0000-0000-000000000003', task: '7a000000-0000-0000-0000-000000000006' },
  { proj: '67000000-0000-0000-0000-000000000003', task: '7a000000-0000-0000-0000-000000000007' },
  { proj: '67000000-0000-0000-0000-000000000004', task: '7a000000-0000-0000-0000-000000000009' },
];

const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);
const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
console.log('Semana:', format(weekStart, 'yyyy-MM-dd'), '→', format(weekEnd, 'yyyy-MM-dd'));

const pad = n => String(n).padStart(2, '0');
const hex = n => n.toString(16).padStart(12, '0');
const uuidFor = n => `00000000-0000-0000-0000-${hex(n)}`;

const rows = [];
let counter = 1;
for (const emp of employees) {
  for (const day of days) {
    const dayStr = format(day, 'yyyy-MM-dd');
    const jitter = Math.floor(Math.random() * 16);
    const extra = Math.random() < 0.25 ? Math.floor(Math.random() * 31) : 0;
    const [sh, sm] = emp.start.split(':').map(Number);
    const [eh, em] = emp.end.split(':').map(Number);
    const clockInIso = `${dayStr}T${pad(sh)}:${pad(sm)}-03:00`;
    const clockOutIso = `${dayStr}T${pad(eh)}:${pad(em + extra)}-03:00`;
    const inDate = new Date(`${dayStr}T${pad(sh)}:${pad(sm + jitter)}:00-03:00`);
    const outDate = new Date(`${dayStr}T${pad(eh)}:${pad(em + extra)}:00-03:00`);
    const duration = Math.round((outDate - inDate) / 60000) - 60;
    const t = tasks[counter % tasks.length];
    rows.push({
      id: uuidFor(counter),
      employee_id: emp.id,
      project_id: t.proj,
      task_id: t.task,
      clock_in: clockInIso,
      clock_out: clockOutIso,
      duration_minutes: Math.max(0, duration),
      break_minutes: 60,
      status: 'completed',
      is_manual: false,
      notes: null,
      created_by: 'b7ce87c2-ba3c-42b4-9105-9579dccdfa3a',
    });
    counter++;
  }
}

fs.writeFileSync('seed/time_entries.json', JSON.stringify(rows, null, 2));
console.log('linhas geradas:', rows.length, 'primeira:', rows[0].clock_in, 'última:', rows[rows.length - 1].clock_in);
