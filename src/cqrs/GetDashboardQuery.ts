export interface GetDashboardQueryInput { dateRange?: { start: string; end: string }; teamId?: string; }
export class GetDashboardQuery {
  constructor(public readonly input: GetDashboardQueryInput = {}) {}
}
export const getDashboardQuery = (input?: GetDashboardQueryInput) => new GetDashboardQuery(input);
