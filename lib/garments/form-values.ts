import { PART_DESIGNS, PART_TYPE_DB_CODES } from "@/lib/constants/shalwar-kameez"
import {
  numberToInput,
  toNullableInt,
  toNullableNumber,
  toNullableString,
} from "@/lib/utils/number-input"
import type { GarmentDefinition, GarmentFormValues, OptionValueKind } from "@/types/garment-form"
import type { PartDesignInput } from "@/types/garment-order"

// Form <-> database mapping for any garment, driven entirely by its
// definition. The details object's keys are the details-table column names, so
// the create_<garment>_order functions can cast it with jsonb_populate_record.

function measurementColumns(def: GarmentDefinition): string[] {
  return def.measurements.flatMap((m) => (m.secondColumn ? [m.column, m.secondColumn] : [m.column]))
}

function flagColumns(def: GarmentDefinition): string[] {
  const columns = def.sections.flatMap((section) => (section.kind === "flags" ? [section.column] : []))
  return [...new Set(columns)]
}

export function createInitialValues(def: GarmentDefinition): GarmentFormValues {
  const options: Record<string, string> = {}
  for (const section of def.sections) {
    if (section.kind !== "radio") continue
    options[section.column] = section.defaultValue
    if (section.designNo) options[section.designNo.column] = ""
  }
  if (def.buttonType) options[def.buttonType.column] = ""

  return {
    measurements: Object.fromEntries(measurementColumns(def).map((column) => [column, ""])),
    options,
    flags: [],
    parts: def.hasPartDesigns ? PART_DESIGNS.map((part) => ({ ...part, size1: "", size2: "", designNo: "" })) : [],
    note: "",
  }
}

function castOption(value: string, kind: OptionValueKind): string | number | null {
  if (value === "") return null
  if (kind === "int") return toNullableInt(value)
  if (kind === "decimal") return toNullableNumber(value)
  return value
}

export function serializeDetails(def: GarmentDefinition, values: GarmentFormValues): Record<string, unknown> {
  const details: Record<string, unknown> = {}

  for (const column of measurementColumns(def)) details[column] = toNullableNumber(values.measurements[column] ?? "")
  details.note = toNullableString(values.note)

  for (const section of def.sections) {
    if (section.kind !== "radio") continue
    details[section.column] = castOption(values.options[section.column] ?? "", section.valueKind)
    if (section.designNo) {
      details[section.designNo.column] = toNullableInt(values.options[section.designNo.column] ?? "")
    }
  }
  for (const column of flagColumns(def)) details[column] = values.flags
  if (def.buttonType) details[def.buttonType.column] = values.options[def.buttonType.column] || null

  return details
}

export function serializePartDesigns(values: GarmentFormValues): PartDesignInput[] {
  return values.parts
    .filter((row) => row.designNo.trim() || row.size1.trim() || row.size2.trim())
    .map((row) => ({
      partType: PART_TYPE_DB_CODES[row.key],
      size1: toNullableString(row.size1),
      size2: toNullableString(row.size2),
      designNo: toNullableInt(row.designNo),
    }))
}

function optionToInput(value: unknown, fallback: string): string {
  return value === null || value === undefined ? fallback : String(value)
}

// Rebuilds form values from a saved order's details (prefill for a returning
// client, or Search by Record No.). Columns missing from the stored row fall
// back to the definition's defaults rather than leaving a radio unset.
export function valuesFromRecord(
  def: GarmentDefinition,
  details: Record<string, unknown>,
  partDesigns: PartDesignInput[]
): GarmentFormValues {
  const base = createInitialValues(def)

  const measurements = Object.fromEntries(
    Object.keys(base.measurements).map((column) => [column, numberToInput(details[column])])
  )

  const options = { ...base.options }
  for (const section of def.sections) {
    if (section.kind !== "radio") continue
    options[section.column] = optionToInput(details[section.column], section.defaultValue)
    if (section.designNo) options[section.designNo.column] = optionToInput(details[section.designNo.column], "")
  }
  if (def.buttonType) options[def.buttonType.column] = optionToInput(details[def.buttonType.column], "")

  const flags = flagColumns(def).flatMap((column) => {
    const stored = details[column]
    return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === "string") : []
  })

  const partByType = new Map(partDesigns.map((part) => [part.partType, part]))
  const parts = base.parts.map((row) => {
    const match = partByType.get(PART_TYPE_DB_CODES[row.key])
    return {
      ...row,
      size1: match?.size1 ?? "",
      size2: match?.size2 ?? "",
      designNo: match?.designNo != null ? String(match.designNo) : "",
    }
  })

  return { measurements, options, flags, parts, note: typeof details.note === "string" ? details.note : "" }
}
