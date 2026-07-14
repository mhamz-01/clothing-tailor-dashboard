// The part-design size lists (PART_DESIGN_SIZE1_OPTIONS / SIZE2_OPTIONS in
// lib/constants/shalwar-kameez.ts) only ever use quarter/half/three-quarter
// fractions, so a fixed lookup covers every case — no general fraction parser
// needed. Display-only: the underlying option string (still "4x4 1/2") stays
// the value used for selection/comparison/storage.
const FRACTION_UNICODE: Record<string, string> = {
  "1/4": "¼",
  "1/2": "½",
  "3/4": "¾",
}

export function formatSizeLabel(value: string): string {
  return value.replace(/1\/4|1\/2|3\/4/g, (match) => FRACTION_UNICODE[match] ?? match)
}
