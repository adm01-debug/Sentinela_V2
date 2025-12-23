import { api } from '@/plugins/axios';
export class GraphqlGateway {
  private endpoint: string;
  constructor(endpoint = '/graphql') { this.endpoint = endpoint; }
  async query<T>(query: string, variables?: Record<string, any>): Promise<T> { const { data } = await api.post(this.endpoint, { query, variables }); if (data.errors) throw new Error(data.errors[0].message); return data.data; }
  async mutation<T>(mutation: string, variables?: Record<string, any>): Promise<T> { return this.query<T>(mutation, variables); }
}
export const graphqlGateway = new GraphqlGateway();
