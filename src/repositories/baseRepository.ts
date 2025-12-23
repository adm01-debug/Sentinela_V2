import { api } from '@/plugins/axios';
export abstract class BaseRepository<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  constructor(protected endpoint: string) {}
  async findAll(params?: Record<string, any>): Promise<T[]> { const { data } = await api.get(this.endpoint, { params }); return data; }
  async findById(id: string): Promise<T> { const { data } = await api.get(this.endpoint + '/' + id); return data; }
  async create(dto: CreateDTO): Promise<T> { const { data } = await api.post(this.endpoint, dto); return data; }
  async update(id: string, dto: UpdateDTO): Promise<T> { const { data } = await api.put(this.endpoint + '/' + id, dto); return data; }
  async delete(id: string): Promise<void> { await api.delete(this.endpoint + '/' + id); }
  async count(params?: Record<string, any>): Promise<number> { const { data } = await api.get(this.endpoint + '/count', { params }); return data.count; }
}
