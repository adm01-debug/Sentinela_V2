export const toCSV = <T extends Record<string, unknown>>(
  data: T[],
  columns?: (keyof T)[]
): string => {
  if (data.length === 0) return "";
  const cols = columns || (Object.keys(data[0]) as (keyof T)[]);
  const header = cols.join(",");
  const rows = data.map((row) => cols.map((col) => JSON.stringify(row[col] ?? "")).join(","));
  return [header, ...rows].join("\n");
};
export const toJSON = (data: unknown, pretty = true) => JSON.stringify(data, null, pretty ? 2 : 0);
