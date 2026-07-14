import type {
  BasicCheckKey,
  CheckDefinition,
  MeasurementDefinition,
  PartDesignDefinition,
  PartDesignImageOption,
  PartDesignKey,
  PartDesignSizeConfig,
  RadioOptionDefinition,
  StyleFlagKey,
} from "@/types/shalwar-kameez"
import type { PartType } from "@/types/garment-order"

// Shared field styling for this form — based on the Claude Design spec
// (Shalwar Kameez Dashboard.dc.html): #c7c7cf borders, 3px radius, black
// focus ring. Text bumped up from the spec's 12px/normal to 13px/medium
// (client request) for readability, since older users read this form.
export const FIELD_CLASS =
  "rounded-[3px] border-[#c7c7cf] bg-white px-[6px] py-0 text-[13px] font-medium text-[#111116] placeholder:text-[#b5b5bd] focus-visible:border-black focus-visible:ring-[3px] focus-visible:ring-black/[0.14]"

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
  { key: "isLargeButtons", label: "Large Buttons" },
  { key: "shalwarZip", label: "Shalwar Zip" },
]

// Rendered inside the Button Patti design picker modal (not the main Style
// Options panel) — maps to the same style_flag_code enum's "5_btn" value.
export const FIVE_BUTTONS_CHECK: CheckDefinition<"fiveBtn"> = { key: "fiveBtn", label: "5 Buttons" }

// Keys match the `style_flag_code` Postgres enum (see tailor-schema-supabase.md §2)
// so each row maps directly onto an `order_style_flags` junction row later.
export const STYLE_FLAGS: CheckDefinition<StyleFlagKey>[] = [
  { key: "kafDboty", label: "Kaf Dboty" },
  { key: "kajPatti", label: "Kaj Patti" },
  { key: "btnDboty", label: "Btn Dboty" },
  { key: "noLbl", label: "No Lbl" },
  { key: "twoJeb", label: "2 Jeb" },
  { key: "noJeb", label: "No Jeb" },
]

export const PART_DESIGNS: PartDesignDefinition[] = [
  { key: "bazu", label: "Bazu", ur: "بازو" },
  { key: "kuf", label: "Kuf", ur: "کف" },
  { key: "buttonPatti", label: "Button Patti", ur: "بٹن پٹی" },
  { key: "jaib", label: "Jaib", ur: "جیب" },
]

// Maps the form's part-design keys to the DB's part_type_enum values
// (supabase/migrations/20260714000000_fix_garment_orders_keys_and_access.sql).
export const PART_TYPE_DB_CODES: Record<PartDesignKey, PartType> = {
  bazu: "bazu",
  kuf: "kuf",
  buttonPatti: "button_patti",
  jaib: "jaib",
}

// Maps every checkbox key (both BASIC_CHECKS and STYLE_FLAGS) to its
// style_flag_code DB value — the two arrays stay visually separate in the UI
// (Large Buttons/Shalwar Zip render in different panel locations) but all
// save into the same order_style_flags junction table.
export const STYLE_FLAG_DB_CODES: Record<BasicCheckKey | StyleFlagKey, string> = {
  kafDboty: "kaf_dboty",
  btnDboty: "btn_dboty",
  noLbl: "no_lbl",
  kajPatti: "kaj_patti",
  twoJeb: "2_jeb",
  noJeb: "no_jeb",
  fiveBtn: "5_btn",
  isLargeButtons: "large_buttons",
  shalwarZip: "shalwar_zip",
}

// Client No is a fixed alphabet-number format (e.g. "A-1", "B-23") — the
// tailor picks the letter and number, but the shape itself is not editable.
export const CLIENT_NO_PATTERN = /^[A-Za-z]-\d+$/

// collar_type_code — confirmed via real images (public/kameez-shalwar-assets/collar)
// that "collar" is a genuine 5th style, not a stray UI option (see
// 20260714010000_add_collar_option_and_seed_images.sql).
export const VALID_COLLAR_TYPE_CODES: string[] = ["american_cut", "english_cut", "french_cut", "collar", "none"]

// Each part-design row opens a picker modal (see PartDesignPickerModal) sourced from
// its own numbered image folder under public/kameez-shalwar-assets. Folder/prefix
// don't always match the part key 1:1 (kuf's files are named "kaf", jaib maps to the
// "pockets" folder) because the asset folders were handed over already named this way.
const PART_DESIGN_IMAGE_FOLDERS: Record<PartDesignKey, { dir: string; prefix: string; count: number }> = {
  bazu: { dir: "arm", prefix: "arm", count: 6 },
  kuf: { dir: "kuf", prefix: "kaf", count: 4 },
  buttonPatti: { dir: "bpatti", prefix: "bpatti", count: 7 },
  jaib: { dir: "pockets", prefix: "pocket", count: 11 },
}

export const PART_DESIGN_IMAGES: Record<PartDesignKey, PartDesignImageOption[]> = Object.fromEntries(
  Object.entries(PART_DESIGN_IMAGE_FOLDERS).map(([key, { dir, prefix, count }]) => [
    key,
    Array.from({ length: count }, (_, i) => {
      const n = String(i + 1)
      return { value: n, src: `/kameez-shalwar-assets/${dir}/${prefix}${n}.jpg` }
    }),
  ])
) as Record<PartDesignKey, PartDesignImageOption[]>

// Visible (non-dropdown) size scroll-lists shown in the part-design picker
// modal — each part has its own vocabulary/range, not one shared list.
// quarterRange/integerRange generate the fixed-step ranges per client spec
// (e.g. bazu "Size": 5 1/2 to 10 in quarter-inch steps).
function formatQuarterValue(value: number): string {
  const whole = Math.floor(value + 1e-9)
  const quarters = Math.round((value - whole) * 4)
  const fraction = quarters === 1 ? " 1/4" : quarters === 2 ? " 1/2" : quarters === 3 ? " 3/4" : ""
  return `${whole}${fraction}`
}

function quarterRange(start: number, end: number): string[] {
  const values: string[] = []
  for (let v = start; v <= end + 1e-9; v += 0.25) {
    values.push(formatQuarterValue(v))
  }
  return values
}

function integerRange(start: number, end: number): string[] {
  const values: string[] = []
  for (let v = start; v <= end; v++) values.push(String(v))
  return values
}

// Jaib kept its original paired-dimension lists (e.g. "4x4 1/2") — the other
// three parts got their own dedicated ranges/labels per client spec below.
const JAIB_SIZE1_OPTIONS: string[] = [
  "4x4 1/2",
  "4x4 3/4",
  "4 1/2 x 5",
  "4 3/4 x 5 1/4",
  "5 x 5 1/4",
  "5 x 5 1/2",
  "5 x 5 3/4",
  "5 1/4 x 5 3/4",
  "5 1/4 x 6",
  "5 1/2 x 6",
]

const JAIB_SIZE2_OPTIONS: string[] = [
  "6",
  "6 1/4",
  "6 1/2",
  "6 3/4",
  "7",
  "7 1/4",
  "7 1/2",
  "7 3/4",
  "8",
  "8 1/4",
  "8 1/2",
  "8 3/4",
  "9",
  "9 1/4",
  "9 1/2",
  "9 3/4",
  "10",
]

export const PART_DESIGN_SIZE_CONFIG: Record<PartDesignKey, PartDesignSizeConfig> = {
  bazu: {
    size1Label: "Size",
    size1Options: quarterRange(5.5, 10),
    size2Label: "Turn",
    size2Options: quarterRange(1, 3.5),
  },
  kuf: {
    size1Label: "Size 1",
    size1Options: quarterRange(8, 12),
    size2Label: "Size 2",
    size2Options: quarterRange(2, 4),
  },
  buttonPatti: {
    size1Label: "Length",
    size1Options: integerRange(5, 20),
    size2Label: "Width",
    size2Options: quarterRange(1.25, 3),
  },
  jaib: {
    size1Label: "Size 1",
    size1Options: JAIB_SIZE1_OPTIONS,
    size2Label: "Size 2",
    size2Options: JAIB_SIZE2_OPTIONS,
  },
}

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
  { value: "collar", label: "Collar" },
  { value: "none", label: "None" },
]

export const DAMAN_OPTIONS: RadioOptionDefinition[] = [
  { value: "qurta", label: "Qurta" },
  { value: "sida_daman", label: "Sida Daman" },
  { value: "none", label: "None" },
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
