SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid::regclass::text IN (
  'public.time_entries','public.timesheets','public.projects',
  'public.tasks','public.work_schedules','public.employee_schedules',
  'public.employee_status'
) AND contype = 'c';