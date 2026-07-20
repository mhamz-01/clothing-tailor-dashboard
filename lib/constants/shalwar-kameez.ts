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

// Hides the browser's up/down spin-button counter on type="number" inputs
// (measurements, Tailoring/Cloth/Shiling/Others Amt) -- these are entered by
// tapping digits, not by clicking through a counter, and the arrows were
// eating into the field's already-tight width.
export const NO_SPINNER_CLASS =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

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
// 20260714010000_add_collar_option_and_seed_images.sql). "none" was dropped
// from COLLAR_OPTIONS below (UI-only -- the DB enum/catalog row still has it,
// untouched, in case any live order already has it saved) and so from this
// whitelist too, since it can no longer be reached by picking a radio option.
export const VALID_COLLAR_TYPE_CODES: string[] = ["american_cut", "english_cut", "french_cut", "collar"]

// Each part-design row opens a picker modal (see PartDesignPickerModal) sourced from
// its own numbered image folder under public/kameez-shalwar-assets. Folder/prefix
// don't always match the part key 1:1 (kuf's files are named "kaf", jaib maps to the
// "pockets" folder) because the asset folders were handed over already named this way.
//
// `images` is an explicit list rather than a plain 1..count run -- design
// numbers aren't always contiguous (Kuf's is, but only because it's been
// kept that way on purpose -- see the renumber note below), don't all share
// one file extension (Kuf's design 5 is a .png, everything else here is
// .jpg -- ext defaults to "jpg" per entry when omitted), and a replaced
// image doesn't always keep the plain `${prefix}${n}` filename either --
// Kuf's design 3 image was swapped in place under the original kaf3.jpg
// name first, but Next's image-optimizer cache is keyed by URL, not file
// content, so the old render kept being served indefinitely (even in
// incognito, since that cache lives server-side) until the file was
// renamed to kaf3-v2.jpg -- a genuinely new URL the cache had never seen.
// `file` overrides the `${prefix}${n}` stem for exactly this situation;
// reach for it again next time a design's image is replaced under the same
// design number rather than trying to reuse the old filename.
//
// Bazu briefly dropped designs 1 and 6 (leaving 2-5 with gaps at both
// ends), then got renumbered back down to a clean 1-4 -- arm2..arm5.jpg
// were renamed on disk to arm1..arm4.jpg (old arm1.jpg/arm6.jpg retired
// entirely), so this list is contiguous again. If Bazu designs ever need
// to change again, prefer renumbering the files to keep this contiguous
// over reintroducing gaps -- see supabase/migrations/
// 20260717020000_bazu_design_renumber_cleanup.sql for the matching catalog
// cleanup this required.
function sequentialImages(count: number): { n: number; ext?: string; file?: string }[] {
  return Array.from({ length: count }, (_, i) => ({ n: i + 1 }))
}

const PART_DESIGN_ASSETS: Record<PartDesignKey, { dir: string; prefix: string; images: { n: number; ext?: string; file?: string }[] }> = {
  bazu: { dir: "arm", prefix: "arm", images: sequentialImages(4) },
  kuf: {
    dir: "kuf",
    prefix: "kaf",
    images: [{ n: 1 }, { n: 2 }, { n: 3, file: "kaf3-v2" }, { n: 4 }, { n: 5, ext: "png" }],
  },
  buttonPatti: { dir: "bpatti", prefix: "bpatti", images: sequentialImages(7) },
  jaib: { dir: "pockets", prefix: "pocket", images: sequentialImages(11) },
}

export const PART_DESIGN_IMAGES: Record<PartDesignKey, PartDesignImageOption[]> = Object.fromEntries(
  Object.entries(PART_DESIGN_ASSETS).map(([key, { dir, prefix, images }]) => [
    key,
    images.map(({ n, ext = "jpg", file }) => ({
      value: String(n),
      src: `/kameez-shalwar-assets/${dir}/${file ?? `${prefix}${n}`}.${ext}`,
    })),
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

// Size quick-picks shown alongside the Bain/Gala and Collar/Cut radio rows.
// Bain/Gala and Collar have no numbered "design" of their own (unlike Bazu/
// Kuf/Button Patti/Jaib, which open a picker modal with actual design
// images) -- these are plain size values, saved as-is to
// shalwar_kameez_details.bain_size / collar_size (free text, not an enum, so
// either list can change without a schema migration). Bain and Collar are
// separate size scales (client request), so they get their own option lists.
// Display-only: native <select> options can't hold styled/partial-size text,
// so the "make the fraction smaller" ask is done with actual Unicode vulgar
// fraction glyphs (½ ¼ ¾) -- a single compact character that reads as a
// proper small fraction in any font, instead of a plain "1/2" string. The
// saved `value` stays the literal string from the client, untouched.
// Exported so lib/utils/order-sheet.ts's print sheet can reuse the exact
// same glyphs for Bain/Collar's size text, instead of a separate
// small-font-span approximation of a "professional" fraction.
export const SIZE_FRACTION_LABELS: Record<string, string> = {
  "1/2": "½",
  "3/4": "¾",
  "1 1/4": "1¼",
  "1 1/2": "1½",
  "1 3/4": "1¾",
  "2 1/4": "2¼",
  "2 1/2": "2½",
  "2 3/4": "2¾",
  "3 1/4": "3¼",
  "3 1/2": "3½",
}

export const BAIN_SIZE_OPTIONS: RadioOptionDefinition[] = [
  "1/2",
  "3/4",
  "1-1",
  "1+1",
  "1 1/4",
  "1 1/2",
  "1 3/4",
  "2",
].map((v) => ({ value: v, label: SIZE_FRACTION_LABELS[v] ?? v }))

export const COLLAR_SIZE_OPTIONS: RadioOptionDefinition[] = [
  "1 1/2",
  "1 3/4",
  "2",
  "2 1/4",
  "2 1/2",
  "2 3/4",
  "3",
  "3 1/4",
  "3 1/2",
].map((v) => ({ value: v, label: SIZE_FRACTION_LABELS[v] ?? v }))

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
  { value: "half_bain_gol", label: "Half Bain Gol" },
]

export const COLLAR_OPTIONS: RadioOptionDefinition[] = [
  { value: "american_cut", label: "American Cut" },
  { value: "english_cut", label: "English Cut" },
  { value: "french_cut", label: "French Cut" },
  { value: "collar", label: "Collar" },
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

// Confirmed real images for Pocket/Bain-Gala/Collar/Daman option values and
// a few style flags -- seeded into the DB (pocket_types/bain_gala_types/
// collar_types/daman_types/style_flag_catalog.image_path) by
// 20260714010000_add_collar_option_and_seed_images.sql,
// 20260714020000_seed_style_flag_images.sql, and
// 20260716030000_add_half_bain_gol_bain_option.sql, but never read by the
// UI itself -- StyleOptionsPanel/CheckboxGroup render these as plain radios/
// checkboxes with no thumbnail, and the DB catalog rows are otherwise
// unused (see PART_DESIGN_IMAGES above for the equivalent, already-wired
// case). Mirrored here as plain frontend maps, same pattern, for the order
// sheet (lib/utils/order-sheet.ts) to look up by the tailor's actual
// selection. Options/flags with no entry here (Button Type entirely; "none"
// on Daman/Pockets; most style flags) never had a confirmed image and fall
// back to label-only, same as any part design with nothing selected.
//
// public/kameez-shalwar-assets/dobat/dobat.jpg exists on disk but isn't
// referenced by any migration or confirmed to belong to a specific style
// flag (kaf_dboty vs btn_dboty are both plausible given the filename) --
// deliberately left unmapped rather than guessed.
export const POCKET_IMAGES: Record<string, string> = {
  "1_side_pocket": "/kameez-shalwar-assets/s-pocket/spocket1.jpg",
  "2_side_pocket": "/kameez-shalwar-assets/s-pocket/spocket2.jpg",
}

export const BAIN_GALA_IMAGES: Record<string, string> = {
  gool_bain: "/kameez-shalwar-assets/bain/gool_bain.jpg",
  sida_bain: "/kameez-shalwar-assets/bain/sida_bain.jpg",
  half_bain: "/kameez-shalwar-assets/bain/half_bain.jpg",
  gol_gala: "/kameez-shalwar-assets/bain/gool_gala.jpg",
  half_bain_gol: "/kameez-shalwar-assets/bain/half-bain-gol.png",
}

export const COLLAR_IMAGES: Record<string, string> = {
  american_cut: "/kameez-shalwar-assets/collar/collor4-removebg.png",
  english_cut: "/kameez-shalwar-assets/collar/collor2-removebg.png",
  french_cut: "/kameez-shalwar-assets/collar/collor1-removebg.png",
  collar: "/kameez-shalwar-assets/collar/collor3-removebg.png",
}

export const DAMAN_IMAGES: Record<string, string> = {
  qurta: "/kameez-shalwar-assets/daman/kurta.jpg",
  sida_daman: "/kameez-shalwar-assets/daman/sidadaman.jpg",
}

export const STYLE_FLAG_IMAGES: Record<string, string> = {
  kaj_patti: "/kameez-shalwar-assets/kajpatti/kajpatti.jpg",
  shalwar_zip: "/kameez-shalwar-assets/shalwar-zip/zip.jpg",
  large_buttons: "/kameez-shalwar-assets/largebuttons/largebtns.jpg",
  btn_dboty: "/kameez-shalwar-assets/btn-dboty/btn-dboty.jpg",
}
