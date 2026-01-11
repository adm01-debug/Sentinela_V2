export interface User { id: string; email: string; name: string; }
export interface Employee { id: string; name: string; department: string; status: 'active' | 'inactive'; }
export interface Violation { id: string; employeeId: string; type: string; timestamp: Date; }
