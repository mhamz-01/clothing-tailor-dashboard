// A5 order sheet for the Waistcoat / Pant / Coat / Shirt forms' "Print" button.
// Unlike Shalwar Kameez's sheet (a hand-laid copy of a paper form), this one is
// generated from the garment's definition: measurements, every option group's
// selected choice, checked flags, part designs and the amounts all come from
// the same GarmentDefinition the form renders, so a new garment prints without
// any sheet-specific code.
//
// Standalone HTML document with its own @page rule for the same reason as
// receipt.ts / order-sheet.ts: @page can't be scoped to a CSS class, so each
// print flow gets its own popup document (see print-window.ts).

import {
  BAIN_GALA_IMAGES,
  COLLAR_IMAGES,
  PART_DESIGN_IMAGES,
  SIZE_FRACTION_LABELS,
  STYLE_FLAG_IMAGES,
} from "@/lib/constants/shalwar-kameez"
import { buildOrderSheetHtml, type OrderSheetDesignItem } from "@/lib/utils/order-sheet"
import type { PartDesignKey } from "@/types/shalwar-kameez"
import { escapeHtml } from "@/lib/utils/html"
import { formatSizeLabel } from "@/lib/utils/format-size"
import { printHtmlInPopup } from "@/lib/utils/print-window"
import type { GarmentBilling, GarmentDefinition, GarmentFormValues, OptionChoice } from "@/types/garment-form"

export interface GarmentOrderSheetData {
  definition: GarmentDefinition
  values: GarmentFormValues
  billing: GarmentBilling
  recordNo: string
  clientNo: string
  clientName: string
  phoneNo: string
  bookDate: string // formatted, display-ready
  deliveryDate: string // formatted, display-ready
}

// A blob: popup document can't resolve a bare "/path" (see receipt.ts), so
// every asset needs an absolute same-origin URL.
function resolveAssetUrl(path: string): string {
  return typeof window === "undefined" ? path : `${window.location.origin}${path}`
}

function labelOf(choices: OptionChoice[], value: string): string {
  return choices.find((choice) => choice.value === value)?.label ?? value
}

// Value cell for a picked choice: Urdu (right-to-left) when the choice has an
// Urdu label, otherwise the English label.
function choiceCell(choices: OptionChoice[], value: string, suffix = ""): string {
  const ur = choices.find((choice) => choice.value === value)?.ur
  return ur
    ? `<td class="ur" dir="rtl">${escapeHtml(ur)}${suffix}</td>`
    : `<td>${escapeHtml(labelOf(choices, value))}${suffix}</td>`
}

// Waistcoat Gala picks (waistcoat.ts "gala" values) -> artwork in public/waiscoat-assets.
const GALA_IMAGES: Record<string, { src: string; label: string }> = {
  ban_gala: { src: "/waiscoat-assets/bain-gala-thin.svg", label: "بین گلا" },
  v_gala: { src: "/waiscoat-assets/v-gala.svg", label: "وی گلا" },
  u_gala: { src: "/waiscoat-assets/u-gala.svg", label: "یو گلا" },
}

function galaCell(data: GarmentOrderSheetData): string {
  const gala = GALA_IMAGES[data.values.options.gala ?? ""]
  if (!gala) return ""
  return `<div class="gala-cell"><div class="gala-label ur" dir="rtl">${escapeHtml(gala.label)}</div><img src="${escapeHtml(resolveAssetUrl(gala.src))}" alt="${escapeHtml(gala.label)}" /></div>`
}

function measurementRows(data: GarmentOrderSheetData): string {
  const { definition, values } = data
  return definition.measurements
    .map((m) => {
      const first = values.measurements[m.column] || "—"
      const second = m.secondColumn ? `<td class="val">${escapeHtml(values.measurements[m.secondColumn] || "—")}</td>` : ""
      return `<tr><td class="val">${escapeHtml(first)}</td>${second}<td class="ur" dir="rtl">${escapeHtml(m.ur)}</td></tr>`
    })
    .join("")
}

function optionRows(data: GarmentOrderSheetData): string {
  const { definition, values } = data
  const rows: string[] = []

  for (const section of definition.sections) {
    if (section.kind !== "radio") continue
    if (data.definition.key === "waistcoat" && section.column === "gala" && GALA_IMAGES[data.values.options.gala ?? ""]) continue
    const selected = values.options[section.column]
    if (!selected) continue
    // Waistcoat: "None" means nothing to stitch, so the row is left off the sheet.
    if (section.column === "shoulder" && selected === "none" && (definition.key === "waistcoat" || definition.key === "coat")) continue
    if (definition.key === "waistcoat" && ((section.column !== "shoulder" && selected === "none") || (section.column === "fancy_button" && selected === "no"))) continue

    // Waistcoat Fancy Button: when "Yes", the sheet just says so (one full-width
    // cell); "No" / unselected prints nothing (skipped above).
    if (definition.key === "waistcoat" && section.column === "fancy_button") {
      rows.push(`<tr><td colspan="2" class="ur" dir="rtl" style="text-align:center">${escapeHtml(section.titleSheetUr ?? section.title)}</td></tr>`)
      continue
    }
    const design = section.designNo ? values.options[section.designNo.column] : ""
    const designSuffix = design && section.designNo ? ` &middot; ${escapeHtml(section.designNo.label)} ${escapeHtml(design)}` : ""
    const sheetTitleUr = section.titleSheetUr ?? section.titleUr
    const title = sheetTitleUr
      ? `<td class="ur" dir="rtl">${escapeHtml(sheetTitleUr)}</td>`
      : `<td class="key">${escapeHtml(section.title)}</td>`
    rows.push(`<tr>${choiceCell(section.choices, selected, designSuffix)}${title}</tr>`)
  }

  const checked = definition.sections
    .flatMap((section) => (section.kind === "flags" ? section.flags : []))
    .filter((flag) => values.flags.includes(flag.value))
    .map((flag) => escapeHtml(flag.label))
  if (checked.length > 0) rows.push(`<tr><td>${checked.join(", ")}</td><td class="key">Options</td></tr>`)

  if (definition.buttonType) {
    const picked = values.options[definition.buttonType.column]
    if (picked) rows.push(`<tr><td>${escapeHtml(labelOf(definition.buttonType.choices, picked))}</td><td class="key">Button Type</td></tr>`)
  }
  return rows.join("")
}

function partRows(data: GarmentOrderSheetData): string {
  return data.values.parts
    .filter((row) => row.designNo || row.size1 || row.size2)
    .map((row) => {
      const image = PART_DESIGN_IMAGES[row.key].find((option) => option.value === row.designNo)
      const picture = image ? `<img src="${escapeHtml(resolveAssetUrl(image.src))}" alt="" />` : `<span class="muted">${escapeHtml(row.designNo || "—")}</span>`
      const sizes = [row.size1, row.size2].filter(Boolean).map((size) => escapeHtml(formatSizeLabel(size))).join(" / ")
      return `<tr><td class="ur" dir="rtl">${escapeHtml(row.ur)}</td><td class="pic">${picture}</td><td class="val">${sizes || "—"}</td></tr>`
    })
    .join("")
}

// Shirt prints on the exact Shalwar Kameez sheet (order-sheet.ts) -- the two
// garments share a layout, so the shirt's values are mapped into that sheet's
// data shape instead of keeping a second copy of its CSS. Shirt-only extras the
// Kameez sheet has no place for (Nokdar Tera, Chak Asten, Dobat, Button Type,
// old Bain/Collar design #) are not printed, same as that sheet.
function buildShirtSheetHtml(data: GarmentOrderSheetData): string {
  const { definition, values, billing } = data
  const has = (flag: string) => values.flags.includes(flag)

  function partItem(key: PartDesignKey, labelUr: string, separator = " / ", reverse = false): OrderSheetDesignItem | null {
    const row = values.parts.find((r) => r.key === key)
    if (!row) return null
    const image = PART_DESIGN_IMAGES[key].find((option) => option.value === row.designNo)
    const sizes = [row.size1 && formatSizeLabel(row.size1), row.size2 && formatSizeLabel(row.size2)]
    const size = (reverse ? sizes.reverse() : sizes).filter(Boolean).join(separator) || null
    if (!image && !size) return null
    return { imageSrc: image?.src ?? null, label: labelUr, size }
  }

  function flagItem(flag: string, label: string): OrderSheetDesignItem | null {
    return has(flag) ? { imageSrc: STYLE_FLAG_IMAGES[flag] ?? null, label, size: null } : null
  }

  function pick(column: string, sizeColumn: string, images: Record<string, string>): OrderSheetDesignItem | null {
    const value = values.options[column]
    if (!value || value === "none") return null
    const size = values.options[sizeColumn]
    return { imageSrc: images[value] ?? null, label: value, size: size ? (SIZE_FRACTION_LABELS[size] ?? size) : null }
  }

  return buildOrderSheetHtml({
    recordNo: data.recordNo,
    clientNo: data.clientNo,
    clientName: data.clientName,
    bookDate: data.bookDate,
    deliveryDate: data.deliveryDate,
    quantity: String(billing.quantity),
    measurements: definition.measurements.map((m) => ({
      ur: m.ur,
      value: values.measurements[m.column] ?? "",
      value2: m.secondColumn ? (values.measurements[m.secondColumn] ?? "") : undefined,
    })),
    extraNo1: "",
    extraNo2: "",
    bain: pick("bain_gala", "bain_size", BAIN_GALA_IMAGES),
    bainIsGolGala: values.options.bain_gala === "gol_gala",
    collar: pick("collar_type", "collar_size", COLLAR_IMAGES),
    largeButtons: flagItem("large_buttons", "Large Buttons"),
    btnDboty: null,
    buttonPatti: partItem("buttonPatti", "بٹن پٹی", "-"),
    fiveBtn: has("5_btn"),
    pockets: null,
    jaib: partItem("jaib", "جیب", " / ", true),
    kajPatti: flagItem("kaj_patti", "Kaj Patti"),
    cuff: partItem("kuf", "کف", " / ", true),
    kafDboty: has("kaf_dboty"),
    shalwarZip: null,
    bazu: partItem("bazu", "بازو", " / ", true),
    daman: null,
    noLbl: has("no_lbl"),
    twoJeb: has("2_jeb"),
    note: values.note,
  })
}

export function buildGarmentOrderSheetHtml(data: GarmentOrderSheetData): string {
  if (data.definition.key === "shirt") return buildShirtSheetHtml(data)
  const { definition, billing, values } = data
  const measurementHeader = definition.measurements.some((m) => m.secondColumn) ? 2 : 1
  const parts = definition.hasPartDesigns ? partRows(data) : ""
  const isWaistcoat = definition.key === "waistcoat"
  const measurementWidth = measurementHeader === 2 ? "46mm" : "38mm"

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(definition.titleEn)} ${data.recordNo ? escapeHtml(data.recordNo) : "order"}</title>
<style>
  @page { size: 148mm 210mm; margin: 6mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #000; }
  body {
    width: 136mm;
    font-family: Inter, "Segoe UI", Tahoma, Arial, sans-serif;
    font-size: 11px;
    line-height: 1.35;
  }
  [dir="rtl"], .ur { font-family: "Noto Nastaliq Urdu", "Noto Naskh Arabic", "Segoe UI", Tahoma, Arial, sans-serif; }
  /* Page frame, measurement box and design-area box: border widths, padding,
     page height and zoom copied 1:1 from the Shalwar Kameez sheet. */
  .page { position: relative; border: 1.5px solid #000; padding: 2.5mm; display: flex; flex-direction: column; height: 198mm; zoom: 0.96; }
  .body { display: flex; gap: 1.5mm; flex: 1; min-height: 0; align-items: stretch; }
  .measurements { width: ${measurementWidth}; flex-shrink: 0; }
  table.meas { border: 1px solid #000; }
  .design-area { flex: 1; min-width: 0; border: 1px solid #000; padding: 1mm 1mm; display: flex; flex-direction: column; gap: 1mm; }
  /* Header copied 1:1 from the Shalwar Kameez sheet (order-sheet.ts). */
  .title { font-size: 17px; font-weight: 800; text-align: center; letter-spacing: 0.02em; text-transform: uppercase; margin-bottom: 1.5mm; }
  .subheader { display: flex; justify-content: space-between; align-items: baseline; font-size: 11px; font-weight: bold; margin-bottom: 1.5mm; }
  .info-table { display: flex; border: 1px solid #000; margin-bottom: 1.5mm; }
  .info-cell { padding: 1mm 1.5mm; text-align: center; border-right: 1px solid #000; }
  .info-cell:last-child { border-right: none; }
  .info-cell.sno { flex: 0 0 42%; }
  .info-cell.qty { flex: 1; }
  .info-heading { font-size: 8.5px; font-weight: bold; margin-bottom: 0.7mm; }
  .info-value { font-size: 13px; font-weight: bold; }
  .info-value2 { font-size: 10.5px; color: #333; margin-top: 0.3mm; }
  table { width: 100%; border-collapse: collapse; }
  td { border: 1px solid #000; padding: 3px 6px; vertical-align: middle; }
  td.val, td.num { text-align: center; font-variant-numeric: tabular-nums; font-weight: 600; }
  td.num { text-align: right; }
  td.ur { text-align: right; font-size: 14px; font-weight: 700; white-space: nowrap; }
  td.key { font-weight: 700; white-space: nowrap; width: 30%; text-align: right; }
  td.pic { text-align: center; }
  td.pic img { max-height: 16mm; max-width: 22mm; object-fit: contain; }
  /* Larger type so the content fills the fixed-height page. */
  table.meas td { height: 13mm; padding: 5px 8px; }
  table.meas td.val { font-size: 18px; }
  table.meas td.ur { font-size: 21px; }
  table.opts td { padding: 6px 8px; font-size: 14px; }
  table.opts td.key { font-size: 14px; }
  table.opts td.ur { font-size: 18px; }
  table.opts td:first-child { text-align: left; }
  table.opts td:last-child { text-align: right; }
  ${isWaistcoat ? `/* Waistcoat: same page height as the other sheets; the design area is a
     4-row x 2-col grid; options span rows 1-2, the Gala picture sits in row 3, col 1. */
  .design-area { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(4, auto); align-content: start; }
  .design-area > .opts { grid-column: 1 / -1; grid-row: 1 / span 2; }
  .gala-cell { grid-column: 1; grid-row: 3; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 1mm; padding: 2mm 0; }
  .gala-label { font-size: 12px; font-weight: 700; text-align: center; }
  .gala-cell img { max-width: 38mm; max-height: 38mm; object-fit: contain; }` : ""}
  .muted { color: #666; }
  .stack { display: flex; flex-direction: column; gap: 6px; }
  .note { margin-top: 6px; padding: 4px 7px; min-height: 14mm; white-space: pre-wrap; }
  /* Delivery Date: same look and bottom-right spot as the Shalwar Kameez sheet's
     .delivery-pin, but in normal flow (margin-top: auto pushes it to the bottom
     of fixed-height pages) so it can't overlap content on the shorter waistcoat page. */
  .delivery-pin { margin-top: auto; padding: 1.5mm 2mm 0; font-size: 16px; font-weight: bold; text-align: right; }
  .delivery-value { display: inline-block; border-bottom: 1px solid #000; padding-bottom: 0.3mm; min-width: 20mm; }
  .footer { margin-top: 1mm; text-align: center; font-size: 8px; color: #666; }
</style>
</head>
<body>
  <div class="page">
  <div class="title">Paradise Tailor</div>

  <div class="subheader">
    <span>${escapeHtml(data.clientName || "—")}</span>
    <span>B. Date: ${escapeHtml(data.bookDate)}</span>
  </div>

  <div class="info-table">
    <div class="info-cell sno">
      <div class="info-heading">S. No.</div>
      <div class="info-value">${escapeHtml(data.clientNo || "—")}</div>
      <div class="info-value2">${escapeHtml(data.recordNo || "—")}</div>
    </div>
    <div class="info-cell qty">
      <div class="info-heading">Qty</div>
      <div class="info-value">${billing.quantity}</div>
    </div>
  </div>

  <div class="body">
    <div class="measurements"><table class="meas">${measurementRows(data)}</table></div>
    <div class="design-area">
      <table class="opts">${optionRows(data)}</table>
      ${parts ? `<table>${parts}</table>` : ""}
      ${isWaistcoat ? galaCell(data) : ""}
    </div>
  </div>

  <div class="note">${escapeHtml(values.note)}</div>

  <div class="delivery-pin">D. Date: <span class="delivery-value">${escapeHtml(data.deliveryDate)}</span></div>

  <div class="footer">Developed by IntellectualHut &middot; 0304-9024972</div>
  </div>
</body>
</html>`
}

export function printGarmentOrderSheetHtml(html: string): void {
  printHtmlInPopup(html, "width=650,height=850")
}
