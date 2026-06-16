# Database Schema

## Tables

### users

- `id` UUID PRIMARY KEY
- `email` VARCHAR UNIQUE
- `role` VARCHAR
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

### employees

- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES users
- `name` VARCHAR
- `department` VARCHAR
- `status` VARCHAR
- `created_at` TIMESTAMP

### violations

- `id` UUID PRIMARY KEY
- `employee_id` UUID REFERENCES employees
- `type` VARCHAR
- `severity` VARCHAR
- `description` TEXT
- `created_at` TIMESTAMP

### activities

- `id` UUID PRIMARY KEY
- `employee_id` UUID REFERENCES employees
- `type` VARCHAR
- `data` JSONB
- `timestamp` TIMESTAMP

### reports

- `id` UUID PRIMARY KEY
- `type` VARCHAR
- `status` VARCHAR
- `data` JSONB
- `created_at` TIMESTAMP

## Indexes

- `idx_employees_user_id`
- `idx_violations_employee_id`
- `idx_activities_employee_timestamp`

## RLS Policies

All tables have Row Level Security enabled.
