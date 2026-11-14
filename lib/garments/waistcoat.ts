import type { GarmentDefinition } from "@/types/garment-form"

// Waistcoat Measurement Dashboard.dc.html -> waistcoat_details.
export const waistcoat: GarmentDefinition = {
  key: "waistcoat",
  titleUr: "واسکٹ",
  titleEn: "Waistcoat",
  quantityLabel: "Quantity",
  showOthersAmt: true,
  hasPartDesigns: false,
  measurements: [
    { column: "lambai", ur: "لمبائی" },
    { column: "chaati", ur: "چھاتی" },
    { column: "kamar", ur: "کمر" },
    { column: "kandha", ur: "کندھا" },
    { column: "collar", ur: "کالر" },
    { column: "hip", ur: "ہپ" },
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
        { value: "v_gala", label: "V Gala", ur: "وی گلا" },
        { value: "ban_gala", label: "Ban Gala", ur: "بین گلا" },
        { value: "u_gala", label: "U Gala", ur: "یو گلا" },
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
    {
      kind: "radio",
      column: "fancy_button",
      title: "Fancy Button",
      titleSheetUr: "فینسی بٹن",
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "yes", label: "Yes", ur: "جی ہاں" },
        { value: "no", label: "No", ur: "نہیں" },
      ],
    },
  ],
}
