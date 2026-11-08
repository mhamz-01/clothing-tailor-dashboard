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

import { PART_DESIGN_IMAGES } from "@/lib/constants/shalwar-kameez"
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

// Waistcoat Gala picks (waistcoat.ts "gala" values) -> artwork in public/waiscoat-assets.
const GALA_IMAGES: Record<string, { src: string; label: string }> = {
  ban_gala: { src: "/waiscoat-assets/bain-gala-thin.svg", label: "Ban Gala" },
  v_gala: { src: "/waiscoat-assets/v-gala.svg", label: "V Gala" },
  u_gala: { src: "/waiscoat-assets/u-gala.svg", label: "U Gala" },
}

function galaCell(data: GarmentOrderSheetData): string {
  const gala = GALA_IMAGES[data.values.options.gala ?? ""]
  if (!gala) return ""
  return `<div class="gala-cell"><div class="gala-label">${escapeHtml(gala.label)}</div><img src="${escapeHtml(resolveAssetUrl(gala.src))}" alt="${escapeHtml(gala.label)}" /></div>`
}

function money(value: number): string {
  return `Rs ${value.toFixed(2)}`
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

    const design = section.designNo ? values.options[section.designNo.column] : ""
    const designSuffix = design && section.designNo ? ` &middot; ${escapeHtml(section.designNo.label)} ${escapeHtml(design)}` : ""
    const title = section.titleUr
      ? `<td class="ur" dir="rtl">${escapeHtml(section.titleUr)}</td>`
      : `<td class="key">${escapeHtml(section.title)}</td>`
    rows.push(`<tr>${title}<td>${escapeHtml(labelOf(section.choices, selected))}${designSuffix}</td></tr>`)
  }

  const checked = definition.sections
    .flatMap((section) => (section.kind === "flags" ? section.flags : []))
    .filter((flag) => values.flags.includes(flag.value))
    .map((flag) => escapeHtml(flag.label))
  if (checked.length > 0) rows.push(`<tr><td class="key">Options</td><td>${checked.join(", ")}</td></tr>`)

  if (definition.buttonType) {
    const picked = values.options[definition.buttonType.column]
    if (picked) rows.push(`<tr><td class="key">Button Type</td><td>${escapeHtml(labelOf(definition.buttonType.choices, picked))}</td></tr>`)
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

function amountRow(label: string, value: string, strong = false): string {
  return `<tr class="${strong ? "strong" : ""}"><td class="key">${escapeHtml(label)}</td><td class="num">${escapeHtml(value)}</td></tr>`
}

export function buildGarmentOrderSheetHtml(data: GarmentOrderSheetData): string {
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
    font-family: "Segoe UI", Tahoma, Arial, sans-serif;
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
  .cols { display: grid; grid-template-columns: ${measurementWidth} 1fr; gap: 6px; }
  table { width: 100%; border-collapse: collapse; }
  td { border: 1px solid #000; padding: 3px 6px; vertical-align: middle; }
  td.val, td.num { text-align: center; font-variant-numeric: tabular-nums; font-weight: 600; }
  td.num { text-align: right; }
  td.ur { text-align: right; font-size: 14px; font-weight: 700; white-space: nowrap; }
  td.key { font-weight: 700; white-space: nowrap; width: 30%; }
  td.pic { text-align: center; }
  td.pic img { max-height: 16mm; max-width: 22mm; object-fit: contain; }
  ${isWaistcoat ? `table.meas td { height: 11mm; padding: 5px 8px; }
  table.meas td.val { font-size: 16px; }
  table.meas td.ur { font-size: 19px; }` : ""}
  ${isWaistcoat ? `/* Waistcoat: shorter sheet (height follows content) and the design area is a
     4-row x 2-col grid; options span rows 1-2, the Gala picture sits in row 3, col 1. */
  .page { height: auto; }
  .design-area { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(4, auto); align-content: start; }
  .design-area > .opts { grid-column: 1 / -1; grid-row: 1 / span 2; }
  .gala-cell { grid-column: 1; grid-row: 3; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 1mm; padding: 2mm 0; }
  .gala-label { font-size: 12px; font-weight: 700; text-align: center; }
  .gala-cell img { max-width: 38mm; max-height: 38mm; object-fit: contain; }` : ""}
  .muted { color: #666; }
  .stack { display: flex; flex-direction: column; gap: 6px; }
  .box { border: 1px solid #000; padding: 4px 7px; min-height: 14mm; white-space: pre-wrap; }
  .box h4 { margin: 0 0 2px; font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; color: #444; }
  .note { margin-top: 6px; padding: 4px 7px; min-height: 14mm; white-space: pre-wrap; }
  tr.strong td { font-weight: 700; font-size: 12px; background: #eee; }
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

  ${
    definition.key === "waistcoat"
      ? `<div class="note">${escapeHtml(values.note)}</div>`
      : `<div class="cols" style="margin-top: 6px">
    <div class="box"><h4>Note</h4>${escapeHtml(values.note)}</div>
    <table>
      ${amountRow("Tailoring Amt", money(billing.tailoringAmount))}
      ${amountRow("Cloth Amount", money(billing.clothAmount))}
      ${amountRow("Shiling Amt", money(billing.shillingAmt))}
      ${definition.showOthersAmt ? amountRow("Others Amt", money(billing.othersAmt)) : ""}
      ${amountRow("Total", money(billing.total), true)}
      ${amountRow("Advance", money(billing.advance))}
      ${amountRow("Balance", money(billing.balance), true)}
    </table>
  </div>`
  }

  <div class="delivery-pin">D. Date: <span class="delivery-value">${escapeHtml(data.deliveryDate)}</span></div>

  <div class="footer">Developed by IntellectualHut &middot; 0304-9024972</div>
  </div>
</body>
</html>`
}

export function printGarmentOrderSheetHtml(html: string): void {
  printHtmlInPopup(html, "width=650,height=850")
}
