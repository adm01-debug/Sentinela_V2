export class Expression {
  constructor(private value: string) {}
  toString(): string { return this.value; }
  static raw(value: string): Expression { return new Expression(value); }
}

export class Aggregates {
  static count(column: string = '*'): Expression { return new Expression('COUNT(' + column + ')'); }
  static sum(column: string): Expression { return new Expression('SUM(' + column + ')'); }
  static avg(column: string): Expression { return new Expression('AVG(' + column + ')'); }
  static min(column: string): Expression { return new Expression('MIN(' + column + ')'); }
  static max(column: string): Expression { return new Expression('MAX(' + column + ')'); }
}

export class Functions {
  static coalesce(...columns: string[]): Expression { return new Expression('COALESCE(' + columns.join(', ') + ')'); }
  static ifNull(column: string, defaultValue: string): Expression { return new Expression('IFNULL(' + column + ', ' + defaultValue + ')'); }
  static concat(...columns: string[]): Expression { return new Expression('CONCAT(' + columns.join(', ') + ')'); }
  static lower(column: string): Expression { return new Expression('LOWER(' + column + ')'); }
  static upper(column: string): Expression { return new Expression('UPPER(' + column + ')'); }
  static now(): Expression { return new Expression('NOW()'); }
}