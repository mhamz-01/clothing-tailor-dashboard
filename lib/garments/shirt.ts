import { BUTTON_TYPE_OPTIONS } from "@/lib/constants/shalwar-kameez"
import type { GarmentDefinition } from "@/types/garment-form"

const DESIGN_NUMBERS = ["1", "2", "3"].map((value) => ({ value, label: value }))

// Shirt Measurement Dashboard copy.dc.html -> shirt_details + shirt_part_designs.
// Flag values are style_flag_code enum members shared with Shalwar Kameez
// ("Kuf Dubble Kaj" is the same flag as Kaf Dboty). Button types are the
// Shalwar Kameez button_types catalog, so Settings prices apply to both.
export const shirt: GarmentDefinition = {
  key: "shirt",
  titleUr: "شرٹ",
  titleEn: "Shirt",
  quantityLabel: "Suit Qty",
  showOthersAmt: true,
  hasPartDesigns: true,
  measurements: [
    { column: "lambai", secondColumn: "lambai_2", ur: "لمبائی" },
    { column: "chaati", secondColumn: "chaati_2", ur: "چھاتی" },
    { column: "bazu", secondColumn: "bazu_2", ur: "بازو" },
    { column: "teera", secondColumn: "teera_2", ur: "تیرہ" },
    { column: "collar", secondColumn: "collar_2", ur: "کالر" },
    { column: "kamar", secondColumn: "kamar_2", ur: "کمر" },
    { column: "daman", secondColumn: "daman_2", ur: "دامن" },
  ],
  sections: [
    {
      kind: "flags",
      column: "style_flags",
      flags: [
        { value: "nokdar_tera", label: "Nokdar Tera" },
        { value: "chak_asten", label: "Chak Asten" },
        { value: "kaf_dboty", label: "Kuf Dubble Kaj" },
        { value: "large_buttons", label: "Large Buttons" },
      ],
    },
    {
      kind: "flags",
      column: "style_flags",
      flags: [
        { value: "kaj_patti", label: "Kaj Patti" },
        { value: "dobat", label: "Dobat" },
        { value: "5_btn", label: "5 Btn" },
        { value: "no_lbl", label: "No Lbl" },
        { value: "2_jeb", label: "2 Jeb" },
      ],
    },
    {
      kind: "radio",
      column: "bain_gala",
      title: "Bain / Gala",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "gool_bain", label: "Gool Bain" },
        { value: "sida_bain", label: "Sida Bain" },
        { value: "half_bain", label: "Half Bain" },
        { value: "gol_gala", label: "Gol Gala" },
        { value: "none", label: "None" },
      ],
      designNo: { column: "bain_design_no", label: "Design #", choices: DESIGN_NUMBERS },
    },
    {
      kind: "radio",
      column: "collar_type",
      title: "Collar / Cut",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "collar", label: "Collar" },
        { value: "american_cut", label: "American Cut" },
        { value: "english_cut", label: "English Cut" },
        { value: "french_cut", label: "French Cut" },
        { value: "none", label: "None" },
      ],
      designNo: { column: "collar_design_no", label: "Design #", choices: DESIGN_NUMBERS },
    },
  ],
  buttonType: { column: "button_type", choices: BUTTON_TYPE_OPTIONS },
}
