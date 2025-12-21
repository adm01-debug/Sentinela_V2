export interface Overtime {
  id: string;
  employeeId: string;
  date: string;
  hours: number;
  type: 'regular' | 'weekend' | 'holiday';
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  approvedBy?: string;
}