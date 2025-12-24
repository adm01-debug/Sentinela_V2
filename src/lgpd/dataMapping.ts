export interface DataField { name: string; type: string; purpose: string; legalBasis: string; retention: string; }
export interface DataMapping { entity: string; fields: DataField[]; }
export class DataMappingRegistry {
  private mappings = new Map<string, DataMapping>();
  register(mapping: DataMapping): void { this.mappings.set(mapping.entity, mapping); }
  get(entity: string): DataMapping | undefined { return this.mappings.get(entity); }
  getAll(): DataMapping[] { return Array.from(this.mappings.values()); }
  getFieldsWithPurpose(purpose: string): DataField[] { const result: DataField[] = []; this.mappings.forEach(m => result.push(...m.fields.filter(f => f.purpose === purpose))); return result; }
}
export const dataMappingRegistry = new DataMappingRegistry();
