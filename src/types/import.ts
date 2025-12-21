export interface ImportJob {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileName: string;
  totalRows: number;
  processedRows: number;
  failedRows: number;
  errors: ImportError[];
  createdAt: string;
  completedAt?: string;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
}