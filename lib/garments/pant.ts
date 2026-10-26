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
      titleUr: "پلوی",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "plain_pant", label: "Plain Pant" },
        { value: "single_paloi", label: "Single Paloi" },
        { value: "double_paloi", label: "Dubble Paloi" },
      ],
    },
    {
      kind: "radio",
      column: "pancha_style",
      title: "Pancha Style",
      titleUr: "پانچہ سٹائل",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "plain", label: "Plain" },
        { value: "turn", label: "Turn" },
        { value: "bell_bottom", label: "Bell Bottom" },
      ],
    },
    {
      kind: "radio",
      column: "pocket",
      title: "Pocket",
      titleUr: "پاکٹ",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "sedha", label: "Sedha" },
        { value: "cross", label: "Cross" },
      ],
    },
    {
      kind: "radio",
      column: "back_pockets",
      title: "Back Pocket",
      titleUr: "بیک پاکٹ",
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
      titleUr: "بیلٹ",
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
