// Conversions between the order forms' string-typed inputs and the numbers /
// nulls the database expects. Inputs stay strings in state so a half-typed
// value ("1.") is never rewritten under the cursor.

export function toAmount(value: string): number {
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

// Blank means "not overridden" -> use the fallback; anything typed (including
// 0) is the tailor's own value and wins.
export function amountOrDefault(value: string, fallback: number): number {
  return value.trim() === "" ? fallback : toAmount(value)
}

export function toNullableNumber(value: string): number | null {
  if (value.trim() === "") return null
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? null : parsed
}

export function toNullableInt(value: string): number | null {
  if (value.trim() === "") return null
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

export function toNullableString(value: string): string | null {
  return value.trim() === "" ? null : value.trim()
}

export function numberToInput(value: unknown): string {
  return typeof value === "number" ? String(value) : ""
}
