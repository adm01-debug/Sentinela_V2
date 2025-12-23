export interface GetUserQueryInput { id: string; }
export class GetUserQuery {
  constructor(public readonly input: GetUserQueryInput) {}
}
export const getUserQuery = (id: string) => new GetUserQuery({ id });
