export function normalizeForSearch(str: string): string {
  return str.toLowerCase().trim();
}

export function searchMatchesAny(fields: string[], query: string): boolean {
  const q = normalizeForSearch(query);
  return fields.some((f) => normalizeForSearch(f).includes(q));
}
