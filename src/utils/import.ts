export const parseCSV = <T extends Record<string, string>>(csv): T[] => {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return headers.reduce(
      (obj, header, i) => ({ ...obj, [header]: values[i]?.trim() || "" }),
      {} as T
    );
  });
};
export const parseJSON = <T>(json): T | null => {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};
