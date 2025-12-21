# Data Model

## Entities

### Employee
- id: UUID
- name: string
- email: string
- department: string

### Activity
- id: UUID
- employee_id: UUID
- app_name: string
- duration: number

### Violation
- id: UUID
- employee_id: UUID
- rule_id: UUID
- severity: enum