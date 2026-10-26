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

const LOGO_PATH = "/paradise-tailor-logo-lightbackground.png"

// A blob: popup document can't resolve a bare "/path" (see receipt.ts), so
// every asset needs an absolute same-origin URL.
function resolveAssetUrl(path: string): string {
  return typeof window === "undefined" ? path : `${window.location.origin}${path}`
}

function labelOf(choices: OptionChoice[], value: string): string {
  return choices.find((choice) => choice.value === value)?.label ?? value
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
  .head { display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 6px; }
  .head img { width: 38px; height: 38px; object-fit: contain; }
  .brand { font-size: 15px; font-weight: 700; letter-spacing: 0.04em; }
  .garment { margin-left: auto; text-align: right; }
  .garment .ur { font-size: 18px; font-weight: 700; }
  .garment .en { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: #444; }
  .info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px 8px; border: 1px solid #000; padding: 5px 7px; margin-bottom: 6px; }
  .info b { font-weight: 700; }
  .cols { display: grid; grid-template-columns: ${measurementHeader === 2 ? "46mm" : "38mm"} 1fr; gap: 6px; }
  table { width: 100%; border-collapse: collapse; }
  td { border: 1px solid #000; padding: 3px 6px; vertical-align: middle; }
  td.val, td.num { text-align: center; font-variant-numeric: tabular-nums; font-weight: 600; }
  td.num { text-align: right; }
  td.ur { text-align: right; font-size: 14px; font-weight: 700; white-space: nowrap; }
  td.key { font-weight: 700; white-space: nowrap; width: 30%; }
  td.pic { text-align: center; }
  td.pic img { max-height: 16mm; max-width: 22mm; object-fit: contain; }
  .muted { color: #666; }
  .stack { display: flex; flex-direction: column; gap: 6px; }
  .box { border: 1px solid #000; padding: 4px 7px; min-height: 14mm; white-space: pre-wrap; }
  .box h4 { margin: 0 0 2px; font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; color: #444; }
  tr.strong td { font-weight: 700; font-size: 12px; background: #eee; }
  .footer { margin-top: 6px; text-align: center; font-size: 8px; color: #666; }
</style>
</head>
<body>
  <div class="head">
    <img src="${escapeHtml(resolveAssetUrl(LOGO_PATH))}" alt="" />
    <div class="brand">Paradise Tailor</div>
    <div class="garment"><div class="ur" dir="rtl">${escapeHtml(definition.titleUr)}</div><div class="en">${escapeHtml(definition.titleEn)} order sheet</div></div>
  </div>

  <div class="info">
    <div><b>Record No.</b> ${escapeHtml(data.recordNo || "—")}</div>
    <div><b>Client No.</b> ${escapeHtml(data.clientNo || "—")}</div>
    <div><b>${escapeHtml(definition.quantityLabel)}</b> ${billing.quantity}</div>
    <div style="grid-column: span 2"><b>Name</b> ${escapeHtml(data.clientName || "—")}</div>
    <div><b>Phone</b> ${escapeHtml(data.phoneNo || "—")}</div>
    <div><b>Book Date</b> ${escapeHtml(data.bookDate)}</div>
    <div style="grid-column: span 2"><b>Delivery Date</b> ${escapeHtml(data.deliveryDate)}</div>
  </div>

  <div class="cols">
    <table>${measurementRows(data)}</table>
    <div class="stack">
      <table>${optionRows(data)}</table>
      ${parts ? `<table>${parts}</table>` : ""}
    </div>
  </div>

  <div class="cols" style="margin-top: 6px">
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
  </div>

  <div class="footer">Developed by IntellectualHut &middot; 0304-9024972</div>
</body>
</html>`
}

export function printGarmentOrderSheetHtml(html: string): void {
  printHtmlInPopup(html, "width=650,height=850")
}
