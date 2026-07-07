export function normalizeTailorJoin<TRow extends { tailor: unknown }, TTailor>(
  row: TRow
): Omit<TRow, "tailor"> & { tailor: TTailor | null } {
  const raw = row.tailor as TTailor[] | TTailor | null
  const tailor = Array.isArray(raw) ? raw[0] ?? null : raw ?? null
  return { ...row, tailor }
}
