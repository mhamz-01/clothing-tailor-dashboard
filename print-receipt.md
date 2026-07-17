# Print Receipt (thermal printer)

Reference map for the Shalwar Kameez order form's "Print Receipt" button —
what each file does, why the implementation is shaped this way, and what to
check/change once a real thermal printer is connected. See
`components/shalwar-kameez/` for the order form this button lives on.

## What it does today

1. Tailor clicks **Print Receipt** in the action bar.
2. A confirmation dialog opens showing an exact preview of the receipt —
   client identity + full Order Summary (Suit Qty, Delivery Date, Button
   Type, Tailoring/Cloth/Shiling/Others Amt, Total, Advance, Balance).
3. **Confirm & Print** opens the browser's native print dialog, pre-sized
   for an 80mm thermal roll. The tailor picks the printer (or it's already
   default) and prints. **Cancel** closes the dialog, nothing is sent
   anywhere.

This is "Approach A" from the original design discussion (browser print
dialog, one extra click after confirm) — chosen over building a local
print-agent service because a) the printer wasn't in hand yet to test
against, and b) one extra click in the OS dialog was explicitly fine. See
[When you get the printer](#when-you-get-the-printer) below for what
changes if that ever needs to become fully silent.

## Files, and what each one owns

| File | Role |
| --- | --- |
| `lib/utils/receipt.ts` | The core logic. `buildReceiptHtml(data, paperWidthMm?)` returns a **standalone HTML string** (own `<style>`, own `@page` rule) — this is the actual receipt content. `printReceiptHtml(html)` opens that string in its own popup window and drives the print. |
| `components/shalwar-kameez/receipt-preview-dialog.tsx` | The confirmation modal. Renders the *exact* HTML string from `buildReceiptHtml` inside an `<iframe srcDoc={html}>`, so what's approved is pixel-identical to what prints — not a separate mockup that could drift out of sync. |
| `hooks/shalwar-kameez/use-shalwar-kameez-form.ts` | Wires it together — `receiptPreviewOpen` (dialog open/closed), `receiptHtml` (rebuilt fresh every render from live form state, see lines 862–876), `handlePrintReceipt` (opens the dialog), `closeReceiptPreview`, `confirmPrintReceipt` (calls `printReceiptHtml`, catches a blocked-popup error via the existing `flashStatus` toast). |
| `components/shalwar-kameez/shalwar-kameez-form.tsx` | Renders `<ReceiptPreviewDialog>`, wired to the four hook values/handlers above. |
| `components/shalwar-kameez/action-bar.tsx` | Unchanged — already had the "Print Receipt" button calling `onPrintReceipt`, which now does something instead of a stub. |

**Not touched by this feature:** the plain **Print** button
(`handlePrint` in the hook, calls `window.print()` directly) — that prints
the whole order-entry board on regular paper and is a completely separate
flow. This distinction is load-bearing, see below.

## Why a popup window, not printing the current page

A CSS `@page` rule (the thing that sets the paper size) **cannot be scoped
to a class or element** — it applies to the whole print job, full stop. If
the receipt's `@page { size: 80mm auto }` lived in the app's own
stylesheet, it would also hijack the *existing* plain **Print** button the
next time someone used it, shrinking the whole order board down to
receipt width. Building the receipt as its own standalone HTML document
and printing it in a separate popup keeps the two print flows from ever
touching each other. Don't try to "simplify" this by merging them into one
`@media print` block in `globals.css` — that reintroduces the collision.

`printReceiptHtml` also deliberately does **not** use `document.write()`
(deprecated, and its timing is less reliable across browsers) — it writes
the HTML to a `Blob`, opens the popup on that blob's URL, and waits for the
popup's own `load` event before calling `.print()`. It closes and revokes
the URL on `afterprint`, whether the tailor actually printed or hit Cancel
in the OS dialog.

## What's on the receipt, and how to change it

Content lives entirely in `buildReceiptHtml`'s template
(`lib/utils/receipt.ts`) as plain HTML strings + a `row()` helper — no
Tailwind, no React, on purpose (the popup window doesn't load the app's
compiled CSS, so styling has to be self-contained inline `<style>`).

- **To add/remove/reorder a line**: edit the `row(...)` calls in
  `buildReceiptHtml`'s template directly — each is one `label, value` pair.
- **To change what data feeds those rows**: edit the object passed to
  `buildReceiptHtml(...)` in `use-shalwar-kameez-form.ts` (~line 862) —
  that's the single place that maps live form state to receipt fields.
- **To restyle** (font, spacing, dashes, bold rows): edit the `<style>`
  block inside `buildReceiptHtml` — it's plain CSS, no build step involved.

## When you get the printer

Test the flow first with **whatever printer/PDF option Windows already
offers** — the OS print dialog appears the same way regardless. To check
the receipt renders correctly without wasting paper, pick "Microsoft
Print to PDF" (or similar) as the destination once, open the PDF, confirm
it looks right, *then* point it at the real thermal printer.

Things to verify/adjust once the real printer is connected:

- **It should just work as a normal Windows printer first.** Print a test
  page from Notepad or anywhere else before touching this app — if that
  doesn't work, it's a driver/OS problem, not something to debug here.
- **Paper width** — `buildReceiptHtml` defaults to `paperWidthMm = 80`
  (see the function signature in `lib/utils/receipt.ts`). If the roll
  turns out to be 58mm, pass `buildReceiptHtml({...}, 58)` at the call
  site in `use-shalwar-kameez-form.ts` (~line 862) instead of leaving the
  second argument off.
- **Default printer** — Windows' "Set as default printer" on the thermal
  printer means the OS dialog opens with it pre-selected, so confirming a
  print is closer to one click instead of two.
- **If it later needs to be fully silent** (zero dialog after Confirm) —
  that needs a different architecture: either a Chrome shortcut launched
  with `--kiosk-printing` (forces silent printing to the default printer,
  only realistic if this app always runs from one dedicated kiosk-mode
  shortcut on the shop PC), or a small local print-agent service that
  receives the receipt data over `localhost` and talks to the printer
  directly via raw ESC/POS commands. Both are real additional builds, not
  a config toggle — flag it if this becomes a requirement rather than
  "one extra click is fine."
