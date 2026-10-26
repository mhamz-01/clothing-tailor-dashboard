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
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "ban_gala", label: "Ban Gala" },
        { value: "shervani", label: "Shervani" },
        { value: "gala_band_coat", label: "Gala Band Coat" },
        { value: "none", label: "None" },
      ],
    },
    {
      kind: "radio",
      column: "damn",
      title: "Damn",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "gol_damn", label: "Gol Damn" },
        { value: "sedha_damn", label: "Sedha Damn" },
      ],
    },
    {
      kind: "radio",
      column: "style",
      title: "Style",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "single_breast", label: "Single Breast" },
        { value: "double_breast", label: "Double Breast" },
        { value: "none", label: "None" },
      ],
    },
    {
      kind: "radio",
      column: "buttons",
      title: "Button",
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
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "single_chaak", label: "Single Chaak" },
        { value: "double_chaak", label: "Double Chaak" },
      ],
    },
    {
      kind: "radio",
      column: "shoulder",
      title: "Shoulder",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "shoulder_down", label: "Shoulder Down" },
        { value: "none", label: "None" },
      ],
    },
  ],
}
