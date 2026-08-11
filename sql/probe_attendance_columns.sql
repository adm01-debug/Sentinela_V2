SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema='public' AND table_name IN ('work_schedules','time_entries','timesheets','employee_status')
ORDER BY table_name, ordinal_position;