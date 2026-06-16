type SortDirection = "asc" | "desc";

export function sortBy<T>(arr: T[], key: keyof T, dir: SortDirection = "asc"): T[] {
  return [...arr].sort((a, b) => {
    const aVal = a[key],
      bVal = b[key];
    if (aVal < bVal) return dir === "asc" ? -1 : 1;
    if (aVal > bVal) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

export function sortByMultiple<T>(arr: T[], keys: { key: keyof T; dir?: SortDirection }[]): T[] {
  return [...arr].sort((a, b) => {
    for (const { key, dir = "asc" } of keys) {
      const aVal = a[key],
        bVal = b[key];
      if (aVal < bVal) return dir === "asc" ? -1 : 1;
      if (aVal > bVal) return dir === "asc" ? 1 : -1;
    }
    return 0;
  });
}

export function naturalSort(arr: string[]): string[] {
  return [...arr].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );
}
