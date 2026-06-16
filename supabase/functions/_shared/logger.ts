import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface LogEntry {
  function_name: string;
  request_id: string;
  agent_key_id?: string;
  employee_id?: string;
  company_id?: string;
  method: string;
  status: number;
  duration_ms: number;
  error_message?: string;
  payload_summary?: any;
}

export class Logger {
  private startTime: number;
  private requestId: string;
  private functionName: string;

  constructor(functionName: string) {
    this.functionName = functionName;
    this.startTime = Date.now();
    this.requestId = crypto.randomUUID();
  }

  getRequestId() {
    return this.requestId;
  }

  async log(supabase: SupabaseClient, entry: Partial<LogEntry>) {
    const duration = Date.now() - this.startTime;
    const fullEntry: LogEntry = {
      function_name: this.functionName,
      request_id: this.requestId,
      method: entry.method || 'UNKNOWN',
      status: entry.status || 200,
      duration_ms: duration,
      ...entry,
    };

    console.log(`[${this.functionName}] [${this.requestId}] ${fullEntry.method} ${fullEntry.status} ${duration}ms`);
    
    if (fullEntry.error_message) {
      console.error(`[${this.functionName}] [${this.requestId}] Error: ${fullEntry.error_message}`);
    }

    try {
      const { error } = await supabase
        .from('edge_function_logs')
        .insert(fullEntry);
      
      if (error) {
        console.error('Failed to save log to database:', error);
      }
    } catch (err) {
      console.error('Logger error:', err);
    }
  }
}
