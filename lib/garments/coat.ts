import type { GarmentDefinition } from "@/types/garment-form"

// Coat Measurement Dashboard.dc.html -> coat_details.
export const coat: GarmentDefinition = {
  key: "coat",
  titleUr: "کوٹ",
  titleEn: "Coat",
  quantityLabel: "Quantity",
  showOthersAmt: true,
  hasPartDesigns: false,
  measurements: [
    { column: "lambai", ur: "لمبائی" },
    { column: "chaati", ur: "چھاتی" },
    { column: "kamar", ur: "کمر" },
    { column: "hip", ur: "ہپ" },
    { column: "aasteen", ur: "آستین" },
    { column: "teera", ur: "تیرا" },
    { column: "half_back", ur: "بالف بیک" },
  ],
  sections: [
    {
      kind: "radio",
      column: "gala",
      title: "Gala",
      titleSheetUr: "گلا",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "ban_gala", label: "Ban Gala", ur: "بین گلا" },
        { value: "shervani", label: "Shervani", ur: "شیروانی" },
        { value: "gala_band_coat", label: "Gala Band Coat", ur: "گلا بند کوٹ" },
        { value: "none", label: "None", ur: "کوئی نہیں" },
      ],
    },
    {
      kind: "radio",
      column: "damn",
      title: "Damn",
      titleSheetUr: "دامن",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "gol_damn", label: "Gol Damn", ur: "گول دامن" },
        { value: "sedha_damn", label: "Sedha Damn", ur: "سیدھا دامن" },
      ],
    },
    {
      kind: "radio",
      column: "style",
      title: "Style",
      titleSheetUr: "اسٹائل",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "single_breast", label: "Single Breast", ur: "سنگل بریسٹ" },
        { value: "double_breast", label: "Double Breast", ur: "ڈبل بریسٹ" },
        { value: "none", label: "None", ur: "کوئی نہیں" },
      ],
    },
    {
      kind: "radio",
      column: "buttons",
      title: "Button",
      titleSheetUr: "بٹن",
      valueKind: "int",
      defaultValue: "",
      choices: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
      ],
    },
    {
      kind: "radio",
      column: "chaak",
      title: "Chaak",
      titleSheetUr: "چاک",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "single_chaak", label: "Single Chaak", ur: "سنگل چاک" },
        { value: "double_chaak", label: "Double Chaak", ur: "ڈبل چاک" },
      ],
    },
    {
      kind: "radio",
      column: "shoulder",
      title: "Shoulder",
      titleSheetUr: "کندھا",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "shoulder_down", label: "Shoulder Down", ur: "شولڈر ڈاؤن" },
        { value: "none", label: "None", ur: "کوئی نہیں" },
      ],
    },
  ],
}
