export const normalizeHeader = (value: unknown): string =>
  String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

export const isEconomicHeader = (value: string): boolean =>
  /^laju pertumbuhan \(y-on-y\) pdrb triwulan(?:an|\s+(?:[ivx]+|\d+))$/i.test(normalizeHeader(value));

// Numeric keys preserve the existing annual contract while distinguishing quarters.
export const parseIndicatorPeriod = (value: unknown): { key: number; label: string } | null => {
  const text = String(value ?? "").trim();
  const match = text.match(/^(\d{4})(?:\s+(?:TW|Triwulan)\s+(I{1,3}|IV|[1-4]))?$/i);
  if (!match) return null;
  const year = Number(match[1]);
  const quarterText = match[2]?.toUpperCase();
  if (!quarterText) return { key: year, label: String(year) };
  const quarters: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4 };
  const quarter = quarters[quarterText] ?? Number(quarterText);
  return { key: year + quarter / 10, label: `${year} · Triwulan ${["I", "II", "III", "IV"][quarter - 1]}` };
};