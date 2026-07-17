// Thermal-receipt HTML for the Shalwar Kameez order form's "Print Receipt"
// button -- deliberately built as a standalone HTML string (own <style>,
// own @page rule) rather than reusing the app's Tailwind-styled markup,
// because @page can't be scoped by a CSS class/selector: if the receipt's
// 80mm @page rule lived in the app's own stylesheet, it would also apply to
// the *existing*, unrelated "Print" button (which prints the whole board on
// regular paper) the moment either one printed. Rendering the receipt into
// its own popup window/document keeps the two print flows from ever
// touching each other. The same HTML string is also shown on-screen for
// confirmation via an <iframe srcDoc>, so what's approved is pixel-identical
// to what prints (see ReceiptPreviewDialog).

export interface ReceiptData {
  // Kept for the print popup's own window/tab title only -- not shown on the
  // printed receipt body itself (see buildReceiptHtml's <title> below).
  recordNo: string
  clientNo: string
  clientName: string
  bookDate: string // formatted, display-ready (dd/mm/yyyy or "—")
  quantity: string
  deliveryDate: string // formatted, display-ready
  buttonTypeLabel: string | null
  tailoringAmount: string // formatted "Rs 0.00"
  clothAmount: string
  shillingAmt: string
  othersAmt: string
  total: string
  advance: string
  balance: string
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

function row(label: string, value: string, className = ""): string {
  return `<div class="row ${className}"><span>${escapeHtml(label)}</span><span>${escapeHtml(value || "—")}</span></div>`
}

const LOGO_PATH = "/paradise-tailor-logo-lightbackground.png"

// The receipt is eventually printed from a `blob:` URL popup (see
// printReceiptHtml) whose document has no real path to resolve a plain
// "/logo.png" reference against -- the browser silently never even
// requests it (no failed network request, just a permanently blank <img>).
// A same-origin absolute URL resolves correctly there, so build one from
// the current page's origin rather than leaving the path relative. Falls
// back to the bare path if `window` isn't available (e.g. any future
// non-browser use of this pure builder) rather than throwing.
function resolveAssetUrl(path: string): string {
  return typeof window === "undefined" ? path : `${window.location.origin}${path}`
}

export function buildReceiptHtml(data: ReceiptData, paperWidthMm = 80): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Receipt${data.recordNo ? " " + data.recordNo : ""}</title>
<style>
  @page { size: ${paperWidthMm}mm auto; margin: 0; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #000;
    font-family: "Courier New", Courier, monospace;
  }
  body {
    width: ${paperWidthMm}mm;
    padding: 8px 10px;
    font-size: 12px;
    line-height: 1.5;
  }
  h1 { font-size: 15px; text-align: center; margin: 0 0 2px; letter-spacing: 0.05em; }
  .center { text-align: center; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  .row { display: flex; justify-content: space-between; gap: 10px; }
  .row.total { font-weight: bold; font-size: 13px; }
  .muted { color: #444; font-size: 11px; }
  .brand { display: flex; flex-direction: column; align-items: center; gap: 2px; margin-bottom: 4px; }
  .brand img { width: 44px; height: 44px; object-fit: contain; }
  .brand-name { font-size: 15px; font-weight: bold; letter-spacing: 0.06em; }
  .dev-credit { font-size: 9px; color: #666; margin-top: 3px; }
</style>
</head>
<body>
  <div class="brand">
    <img src="${resolveAssetUrl(LOGO_PATH)}" alt="Paradise Tailor" />
    <div class="brand-name">Paradise Tailor</div>
  </div>
  <h1>Receipt</h1>
  <div class="divider"></div>
  ${row("Client No", data.clientNo)}
  ${row("Name", data.clientName)}
  ${row("Book Date", data.bookDate)}
  <div class="divider"></div>
  ${row("Suit Qty", data.quantity)}
  ${row("Delivery Date", data.deliveryDate)}
  ${data.buttonTypeLabel ? row("Button Type", data.buttonTypeLabel) : ""}
  <div class="divider"></div>
  ${row("Tailoring Amt", data.tailoringAmount)}
  ${row("Cloth Amount", data.clothAmount)}
  ${row("Shiling Amt", data.shillingAmt)}
  ${row("Others Amt", data.othersAmt)}
  <div class="divider"></div>
  ${row("Total", data.total, "total")}
  ${row("Advance", data.advance)}
  ${row("Balance", data.balance, "total")}
  <div class="divider"></div>
  <div class="center">Thank you!</div>
  <div class="center dev-credit">Developed by IntellectualHut &middot; 0304-9024972</div>
</body>
</html>`
}

// Opens the receipt in its own window (not an iframe) so its @page rule
// governs that print job in isolation, prints it, and closes the window
// again once the print dialog is dismissed (afterprint fires whether the
// tailor actually printed or cancelled). Navigates the popup to a Blob URL
// rather than document.write (deprecated, and its timing is less reliable
// across browsers) -- printing waits for the popup's own `load` event so
// the content is actually painted first, and the object URL is released
// once printing is done with it.
export function printReceiptHtml(html: string): void {
  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)

  const printWindow = window.open(url, "_blank", "width=400,height=640")
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
