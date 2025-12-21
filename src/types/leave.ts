export interface Leave {
  id: string;
  employeeId: string;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  approvedBy?: string;
  approvedAt?: string;
}