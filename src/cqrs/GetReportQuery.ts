export interface GetReportQueryInput { id: string; format?: 'json' | 'csv' | 'pdf'; }
export class GetReportQuery {
  constructor(public readonly input: GetReportQueryInput) {}
}
export const getReportQuery = (id: string, format?: 'json' | 'csv' | 'pdf') => new GetReportQuery({ id, format });
