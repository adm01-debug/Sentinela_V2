export interface Document {
  _id: string;
  _rev?: string;
  [key: string]: unknown;
}

export interface QueryOptions {
  filter?: Record<string, unknown>;
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
  projection?: string[];
}

export interface IndexDefinition {
  name: string;
  fields: string[];
  unique?: boolean;
  sparse?: boolean;
}