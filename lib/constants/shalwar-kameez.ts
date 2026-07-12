import type {
  BasicCheckKey,
  CheckDefinition,
  MeasurementDefinition,
  PartDesignDefinition,
  RadioOptionDefinition,
  StyleFlagKey,
} from "@/types/shalwar-kameez"

// Shared field styling for this form — light borders on a white field, read
// against the page's darker slate-100 background (see page.tsx).
export const FIELD_CLASS = "border-slate-200 bg-white"

export const MEASUREMENTS: MeasurementDefinition[] = [
  { key: "lambai", ur: "لمبائی" },
  { key: "chaati", ur: "چھاتی" },
  { key: "bazu", ur: "بازو" },
  { key: "teera", ur: "تیرہ" },
  { key: "collarM", ur: "کالر" },
  { key: "kamar", ur: "کمر" },
  { key: "daman", ur: "دامن" },
  { key: "shalwarLambai", ur: "شلوار لمبائی" },
  { key: "pancha", ur: "پانچہ" },
]

export const BASIC_CHECKS: CheckDefinition<BasicCheckKey>[] = [
  { key: "isNokderTera", label: "Nokdar Tera" },
  { key: "isChalkAsten", label: "Chalk Asten" },
  { key: "isKufDblKaj", label: "Kuf Dbl Kaj" },
  { key: "isLargeButtons", label: "Large Buttons" },
  { key: "shalwarZip", label: "Shalwar Zip" },
]

// Keys match the `style_flag_code` Postgres enum (see tailor-schema-supabase.md §2)
// so each row maps directly onto an `order_style_flags` junction row later.
export const STYLE_FLAGS: CheckDefinition<StyleFlagKey>[] = [
  { key: "kafDboty", label: "Kaf Dboty" },
  { key: "btnDboty", label: "Btn Dboty" },
  { key: "noLbl", label: "No Lbl" },
  { key: "kajPatti", label: "Kaj Patti" },
  { key: "fiveBtn", label: "5 Btn" },
  { key: "twoJeb", label: "2 Jeb" },
  { key: "noJeb", label: "No Jeb" },
]

export const PART_DESIGNS: PartDesignDefinition[] = [
  { key: "bazu", label: "Bazu", ur: "بازو" },
  { key: "kuf", label: "Kuf", ur: "کف" },
  { key: "buttonPatti", label: "Button Patti", ur: "بٹن پٹی" },
  { key: "jaib", label: "Jaib", ur: "جیب" },
]

// Plain numbered options (1-12), shared by every part of the form that just needs a
// design/style number rather than a named option — the part-design "Design #" select
// and the Bain/Gala + Collar quick-pick dropdowns. Maps loosely to `design_catalog
// .design_no` in tailor-schema-supabase.md §4; once that catalog table is wired up,
// this list should come from Supabase instead of being hard-coded here.
export const NUMBERED_OPTIONS: RadioOptionDefinition[] = Array.from({ length: 12 }, (_, i) => {
  const n = String(i + 1)
  return { value: n, label: n }
})

// Option values match the `*_type_code` Postgres enums in tailor-schema-supabase.md §2,
// so the selected `value` can be saved to Supabase as-is once the form is wired up.
export const POCKET_OPTIONS: RadioOptionDefinition[] = [
  { value: "1_side_pocket", label: "1 Side Pocket" },
  { value: "2_side_pocket", label: "2 Side Pocket" },
  { value: "none", label: "None" },
]

export const BAIN_GALA_OPTIONS: RadioOptionDefinition[] = [
  { value: "gool_bain", label: "Gool Bain" },
  { value: "sida_bain", label: "Sida Bain" },
  { value: "half_bain", label: "Half Bain" },
  { value: "gol_gala", label: "Gol Gala" },
  { value: "none", label: "None" },
]

export const COLLAR_OPTIONS: RadioOptionDefinition[] = [
  { value: "american_cut", label: "American Cut" },
  { value: "english_cut", label: "English Cut" },
  { value: "french_cut", label: "French Cut" },
  { value: "none", label: "None" },
]

export const DAMAN_OPTIONS: RadioOptionDefinition[] = [
  { value: "qurta", label: "Qurta" },
  { value: "sida_daman", label: "Sida Daman" },
]

export const BUTTON_TYPE_OPTIONS: RadioOptionDefinition[] = [
  { value: "metal_btn", label: "Metal Btn" },
  { value: "STDS", label: "S.T.D.S" },
  { value: "ST3S", label: "S.T.3.S" },
  { value: "DTSS", label: "D.T.S.S" },
  { value: "DT3S", label: "D.T.3.S" },
  { value: "DTDS", label: "D.T.D.S" },
  { value: "RTSS", label: "R.T.S.S" },
  { value: "RTDS", label: "R.T.D.S" },
  { value: "EMD", label: "EMD" },
]
