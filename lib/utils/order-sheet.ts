// A5-portrait order sheet for the Shalwar Kameez form's "Print" button --
// rebuilt to match a specific reference design (a traditional paper
// tailor-shop order form: "Paradise Tailors and Fabrics") pixel-for-pixel
// in structure, not the earlier generic "show every selected thing in an
// auto-flowing grid" version. This one has a fixed, specific layout:
//
// Header: business name, centered -> rule -> Client Name (left) / Book Date
// (right) -> a bordered two-cell info row: S. No. (Client No over Record
// No, stacked) | Qty.
//
// Body: measurements as a bordered column on the left (full page height),
// design area on the right as six fixed rows, each item's size written
// plain above its image (no "Size:" label) and its name below:
//   1. Collar OR Bain/Gala -- never both; whichever is actually selected
//   2. Button Patti + size
//   3. Jaib + size, and the Pockets selection, in the same row
//   4. Kaj Patti + Kaf Dboty + Kuf ("cuff") + Kuf's size
//   5. Shalwar Zip
//   6. Daman
// Delivery Date sits bottom-right of the design area, matching the
// reference. A row/item is only rendered when there's actually something
// selected for it -- same "no empty boxes" rule as before, just applied to
// a fixed row structure instead of a free-flowing grid.
//
// Deliberately dropped versus the previous version, because the reference
// form has no place for them ("nothing extra" per the brief this replaced):
// Phone No, the free-text Note, Button Type, and every style flag other
// than Kaj Patti/Kaf Dboty/Shalwar Zip (so Btn Dboty, No Lbl, 2 Jeb, No
// Jeb, 5 Btn, Large Buttons never appear on this sheet even when checked).
// If any of those turn out to still be needed, that's a real omission to
// flag, not something this file tries to guess back in.
//
// Same standalone-document architecture as lib/utils/receipt.ts, and for
// the same reason: @page can't be scoped by a CSS class, so this sheet's
// @page rule would collide with the receipt's 80mm one (and vice versa) if
// either lived in the app's own stylesheet. Each print flow gets its own
// isolated document instead.

export interface OrderSheetMeasurement {
  ur: string
  value: string
}

// One design slot on the right-hand side (a part design, a selected radio
// option, or a checked style flag) -- all rendered the same way: size
// (plain, no label) above the image, name below. `size`/`label` are
// pre-formatted strings, not raw numbers, since each field's own
// unit/label conventions (or lack of one, per this design) live in
// whichever hook logic builds this.
export interface OrderSheetDesignItem {
  imageSrc: string | null
  label: string | null
  size: string | null
}

export interface OrderSheetData {
  recordNo: string
  clientNo: string
  clientName: string
  bookDate: string // formatted, display-ready
  deliveryDate: string // formatted, display-ready
  quantity: string
  measurements: OrderSheetMeasurement[]
  // Collar and Bain/Gala share one slot -- the reference form has exactly
  // one place for a neckline/collar style, not two, so whichever of the
  // two is actually selected goes here (collar wins if somehow both are).
  collarOrBain: OrderSheetDesignItem | null
  buttonPatti: OrderSheetDesignItem | null
  jaib: OrderSheetDesignItem | null
  pockets: OrderSheetDesignItem | null
  kajPatti: OrderSheetDesignItem | null
  kafDboty: OrderSheetDesignItem | null
  cuff: OrderSheetDesignItem | null
  shalwarZip: OrderSheetDesignItem | null
  daman: OrderSheetDesignItem | null
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;"
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case '"':
        return "&quot;"
      default:
        return "&#39;"
    }
  })
}

// Same fix already needed for the receipt's logo: a `blob:` popup document
// (see printOrderSheetHtml) can't resolve a plain "/foo.jpg"-style path at
// all -- the image silently never loads, no error, just permanently blank.
// Every image on this sheet needs this. (This sheet has no logo image of
// its own -- the reference design it matches uses a plain text title, no
// icon -- but the same fix still applies to every design-item thumbnail.)
function resolveAssetUrl(path: string): string {
  return typeof window === "undefined" ? path : `${window.location.origin}${path}`
}

function measurementRow(m: OrderSheetMeasurement): string {
  return `<div class="mrow"><span class="mval">${escapeHtml(m.value || "—")}</span><span class="mur" dir="rtl">${escapeHtml(m.ur)}</span></div>`
}

// Renders one design slot -- empty string (not a placeholder box) if there's
// nothing to show, so buildRow below can drop it entirely rather than
// leaving a gap. Size sits plain above the image (no "Size:" prefix, per
// the reference design); name sits below.
function designItem(item: OrderSheetDesignItem | null, labelDir: "rtl" | "ltr"): string {
  if (!item || (!item.imageSrc && !item.label && !item.size)) return ""
  return `<div class="ditem">
    ${item.size ? `<div class="ditem-size">${escapeHtml(item.size)}</div>` : ""}
    ${item.imageSrc ? `<div class="ditem-image"><img src="${resolveAssetUrl(item.imageSrc)}" alt="${escapeHtml(item.label ?? "")}" /></div>` : ""}
    ${item.label ? `<div class="ditem-label" dir="${labelDir}">${escapeHtml(item.label)}</div>` : ""}
  </div>`
}

// One of the six fixed rows -- built from whichever of its 1-3 possible
// items actually rendered something; the row itself is dropped entirely if
// none of them did, so an all-unselected row doesn't leave a blank gap in
// the middle of the design area.
function buildRow(items: string[]): string {
  const filled = items.filter((html) => html !== "")
  if (filled.length === 0) return ""
  return `<div class="drow">${filled.join("\n")}</div>`
}

export function buildOrderSheetHtml(data: OrderSheetData): string {
  const rows = [
    buildRow([designItem(data.collarOrBain, "ltr")]),
    buildRow([designItem(data.buttonPatti, "rtl")]),
    buildRow([designItem(data.jaib, "rtl"), designItem(data.pockets, "ltr")]),
    buildRow([designItem(data.kajPatti, "ltr"), designItem(data.kafDboty, "ltr"), designItem(data.cuff, "rtl")]),
    buildRow([designItem(data.shalwarZip, "ltr")]),
    buildRow([designItem(data.daman, "ltr")]),
  ].filter((html) => html !== "")

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Order Sheet${data.recordNo ? " " + data.recordNo : ""}</title>
<style>
  @page { size: 148mm 210mm; margin: 6mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #000; }
  body {
    width: 136mm;
    font-family: "Segoe UI", Tahoma, "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif;
    font-size: 10.5px;
  }
  [dir="rtl"] { font-family: "Noto Nastaliq Urdu", "Noto Naskh Arabic", "Segoe UI", Tahoma, Arial, sans-serif; }

  .page { border: 2px solid #000; padding: 3mm; display: flex; flex-direction: column; min-height: 198mm; }

  .title { font-size: 19px; font-weight: 800; text-align: center; letter-spacing: 0.02em; border-bottom: 1.5px solid #000; padding-bottom: 2mm; margin-bottom: 2mm; }

  .subheader { display: flex; justify-content: space-between; align-items: baseline; font-size: 11px; font-weight: bold; margin-bottom: 2mm; }

  .info-table { display: flex; border: 1px solid #000; margin-bottom: 2.5mm; }
  .info-cell { padding: 1.5mm 2mm; text-align: center; }
  .info-cell.sno { flex: 0 0 42%; border-right: 1px solid #000; }
  .info-cell.qty { flex: 1; }
  .info-heading { font-size: 8.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #555; margin-bottom: 1mm; }
  .info-value { font-size: 14px; font-weight: bold; }
  .info-value2 { font-size: 11px; color: #333; margin-top: 0.5mm; }

  .body { display: flex; gap: 3.5mm; flex: 1; align-items: stretch; }

  .measurements { width: 34mm; flex-shrink: 0; border: 1px solid #000; border-radius: 2px; padding: 1.5mm; page-break-inside: avoid; }
  .mrow { display: flex; justify-content: space-between; align-items: baseline; padding: 1.2mm 0; border-bottom: 1px dotted #ccc; font-size: 10.5px; }
  .mrow:last-child { border-bottom: none; }
  .mval { font-weight: bold; }
  .mur { font-size: 12.5px; }

  .design-area { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; gap: 1.5mm; }
  .drow { display: flex; align-items: flex-end; justify-content: center; gap: 4mm; }
  .ditem { display: flex; flex-direction: column; align-items: center; text-align: center; }
  .ditem-size { font-size: 10px; font-weight: bold; margin-bottom: 0.7mm; }
  .ditem-image { height: 15mm; width: 15mm; display: flex; align-items: center; justify-content: center; }
  .ditem-image img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .ditem-label { font-size: 9.5px; font-weight: bold; margin-top: 0.7mm; max-width: 22mm; }

  .delivery-date { text-align: right; font-size: 10px; font-weight: bold; margin-top: 1.5mm; }

  .footer { margin-top: 1.5mm; text-align: center; font-size: 7px; color: #999; }
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
        <div class="info-value">${escapeHtml(data.quantity)}</div>
      </div>
    </div>

    <div class="body">
      <div class="measurements">
        ${data.measurements.map(measurementRow).join("\n")}
      </div>

      <div class="design-area">
        ${rows.join("\n")}
        <div class="delivery-date">D. Date: ${escapeHtml(data.deliveryDate)}</div>
      </div>
    </div>

    <div class="footer">Developed by IntellectualHut &middot; 0304-9024972</div>
  </div>
</body>
</html>`
}

// Same Blob-URL popup pattern as printReceiptHtml (see lib/utils/receipt) --
// isolates this sheet's @page rule from the receipt's 80mm one, and avoids
// document.write's deprecation/timing issues. Waits for the popup's own
// `load` event (so images are actually painted) before printing, and
// cleans up the window + object URL once the print dialog is dismissed
// either way.
export function printOrderSheetHtml(html: string): void {
  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)

  const printWindow = window.open(url, "_blank", "width=650,height=850")
  if (!printWindow) {
    URL.revokeObjectURL(url)
    throw new Error("Couldn't open the print window — check if your browser is blocking pop-ups for this site.")
  }

  printWindow.addEventListener("load", () => {
    printWindow.focus()
    printWindow.print()
  })
  printWindow.addEventListener("afterprint", () => {
    printWindow.close()
    URL.revokeObjectURL(url)
  })
}
