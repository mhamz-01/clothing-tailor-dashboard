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
      valueKind: "text",
      defaultValue: "",
      choices: [
        { value: "v_gala", label: "V Gala" },
        { value: "ban_gala", label: "Ban Gala" },
        { value: "u_gala", label: "U Gala" },
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
