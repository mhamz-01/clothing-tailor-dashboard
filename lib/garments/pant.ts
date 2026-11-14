import type { GarmentDefinition } from "@/types/garment-form"

// Pant Measurement Dashboard.dc.html -> pant_details.
// Belt width values are inches and match pant_details.belt_width's check list.
export const pant: GarmentDefinition = {
  key: "pant",
  titleUr: "پتلون",
  titleEn: "Pant",
  quantityLabel: "Quantity",
  showOthersAmt: false,
  hasPartDesigns: false,
  measurements: [
    { column: "kamar", ur: "کمر" },
    { column: "hip", ur: "ہپ" },
    { column: "lambai", ur: "لمبائی" },
    { column: "pancha", ur: "پانچہ" },
    { column: "gidri", ur: "گیدری" },
    { column: "goda", ur: "گوڈا" },
  ],
  sections: [
    {
      kind: "radio",
      column: "paloi",
      title: "Paloi",
      titleSheetUr: "پلوی",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "plain_pant", label: "Plain Pant", ur: "سادہ پتلون" },
        { value: "single_paloi", label: "Single Paloi", ur: "سنگل پلوی" },
        { value: "double_paloi", label: "Dubble Paloi", ur: "ڈبل پلوی" },
      ],
    },
    {
      kind: "radio",
      column: "pancha_style",
      title: "Pancha Style",
      titleSheetUr: "پانچہ سٹائل",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "plain", label: "Plain", ur: "سادہ" },
        { value: "turn", label: "Turn", ur: "ٹرن" },
        { value: "bell_bottom", label: "Bell Bottom", ur: "بیل باٹم" },
      ],
    },
    {
      kind: "radio",
      column: "pocket",
      title: "Pocket",
      titleSheetUr: "پاکٹ",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "sedha", label: "Sedha", ur: "سیدھا" },
        { value: "cross", label: "Cross", ur: "کراس" },
      ],
    },
    {
      kind: "radio",
      column: "back_pockets",
      title: "Back Pocket",
      titleSheetUr: "بیک پاکٹ",
      valueKind: "int",
      defaultValue: "",
      choices: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
      ],
    },
    {
      kind: "radio",
      column: "belt_width",
      title: "Belt",
      titleSheetUr: "بیلٹ",
      valueKind: "decimal",
      defaultValue: "",
      choices: [
        { value: "1", label: '1"' },
        { value: "1.5", label: '1.5"' },
        { value: "1.75", label: '1.75"' },
        { value: "2", label: '2"' },
        { value: "2.25", label: '2.25"' },
      ],
    },
  ],
}
