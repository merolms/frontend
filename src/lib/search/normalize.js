export function normalizeForSearch(str) {
  return str.toLowerCase().trim()
}

export function searchMatchesAny(fields, query) {
  const q = normalizeForSearch(query)
  return fields.some(f => normalizeForSearch(f).includes(q))
}
