SELECT t.typname, e.enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('time_entry_status','timesheet_status','project_status','task_status','task_priority','period_type','employee_online_status')
ORDER BY t.typname, e.enumsortorder;