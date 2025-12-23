export interface ListEmployeesQueryInput { page?: number; limit?: number; teamId?: string; status?: string; search?: string; }
export class ListEmployeesQuery {
  constructor(public readonly input: ListEmployeesQueryInput = {}) {}
}
export const listEmployeesQuery = (input?: ListEmployeesQueryInput) => new ListEmployeesQuery(input);
