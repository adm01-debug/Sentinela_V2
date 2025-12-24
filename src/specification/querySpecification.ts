// Query Specification - Database Queries
export interface QueryCriteria {
  field: string;
  operator: QueryOperator;
  value: unknown;
}

export type QueryOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "like" | "between";

export interface QuerySpecification<T> {
  toCriteria(): QueryCriteria[];
  toSql(): string;
  toMongo(): Record<string, unknown>;
}

export abstract class BaseQuerySpecification<T> implements QuerySpecification<T> {
  abstract toCriteria(): QueryCriteria[];

  toSql(): string {
    return this.toCriteria().map(c => {
      switch (c.operator) {
        case "eq": return \`\${c.field} = '\${c.value}'\`;
        case "neq": return \`\${c.field} != '\${c.value}'\`;
        case "gt": return \`\${c.field} > \${c.value}\`;
        case "gte": return \`\${c.field} >= \${c.value}\`;
        case "lt": return \`\${c.field} < \${c.value}\`;
        case "lte": return \`\${c.field} <= \${c.value}\`;
        case "in": return \`\${c.field} IN (\${(c.value as unknown[]).map(v => \`'\${v}'\`).join(",")})\`;
        case "like": return \`\${c.field} LIKE '\${c.value}'\`;
        case "between": {
          const [min, max] = c.value as [unknown, unknown];
          return \`\${c.field} BETWEEN \${min} AND \${max}\`;
        }
        default: return "";
      }
    }).join(" AND ");
  }

  toMongo(): Record<string, unknown> {
    const query: Record<string, unknown> = {};
    for (const c of this.toCriteria()) {
      const mongoOp: Record<QueryOperator, string> = {
        eq: "$eq", neq: "$ne", gt: "$gt", gte: "$gte", lt: "$lt", lte: "$lte",
        in: "$in", nin: "$nin", like: "$regex", between: "$gte"
      };
      if (c.operator === "eq") query[c.field] = c.value;
      else query[c.field] = { [mongoOp[c.operator]]: c.value };
    }
    return query;
  }
}

export class FieldSpecification<T> extends BaseQuerySpecification<T> {
  constructor(private criteria: QueryCriteria[]) { super(); }
  toCriteria(): QueryCriteria[] { return this.criteria; }
  
  static field<T>(field: string): FieldBuilder<T> {
    return new FieldBuilder(field);
  }
}

export class FieldBuilder<T> {
  constructor(private field: string) {}
  eq(value: unknown): FieldSpecification<T> { return new FieldSpecification([{ field: this.field, operator: "eq", value }]); }
  gt(value: unknown): FieldSpecification<T> { return new FieldSpecification([{ field: this.field, operator: "gt", value }]); }
  gte(value: unknown): FieldSpecification<T> { return new FieldSpecification([{ field: this.field, operator: "gte", value }]); }
  lt(value: unknown): FieldSpecification<T> { return new FieldSpecification([{ field: this.field, operator: "lt", value }]); }
  lte(value: unknown): FieldSpecification<T> { return new FieldSpecification([{ field: this.field, operator: "lte", value }]); }
  in(values: unknown[]): FieldSpecification<T> { return new FieldSpecification([{ field: this.field, operator: "in", value: values }]); }
  like(pattern: string): FieldSpecification<T> { return new FieldSpecification([{ field: this.field, operator: "like", value: pattern }]); }
  between(min: unknown, max: unknown): FieldSpecification<T> { return new FieldSpecification([{ field: this.field, operator: "between", value: [min, max] }]); }
}
