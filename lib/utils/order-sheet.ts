// A5-portrait order sheet for the Shalwar Kameez form's "Print" button --
// started from a specific reference design (a traditional paper tailor-shop
// order form: "Paradise Tailors and Fabrics"), since refined by client
// feedback past what that reference literally showed (its N.T./N.C. header
// columns and bottom-of-page design-name caption were both dropped as
// clutter -- see below). The design area is one bordered box with content
// free-flowing in two implicit columns (flex, no per-item cell borders) --
// not a ruled table -- and part-design sizes (Jaib/Kuf/Bazu/Button Patti)
// stack as separate numbers to the right of the icon, not above it like the
// simpler radio-selection items (Bain/Gala, Collar).
//
// Header: business name, centered -> Client Name (left) / Book Date (right)
// -> a bordered two-cell info row: S. No. (Client No over Record No,
// stacked) | Qty.
//
// Body: measurements as a bordered table on the left (one row per
// measurement, a ruled column between the value and its Urdu name, full
// page height), design area on the right as one bordered box, content
// arranged in six implicit rows (no ruled lines between them), each with a
// left/right column pair. No item anywhere in the design area prints a
// name/label under its image (client request) -- just the icon, and its
// size where it has one:
//   1. Bain/Gala (left) | Collar (right) -- independent, both can appear
//   2. Large Buttons, with the Btn Dboty image stacked directly under it
//      when checked (left) | Button Patti + size, with a "5 Button" note if
//      that Button Patti modal checkbox is set (right)
//   3. Pockets, image only, no size (left) | Jaib + stacked size1/size2
//      (right)
//   4. Kaj Patti (left) | Kuf ("cuff") + stacked size1/size2, with a
//      "Kaf Dboty Na Ho" note directly under the Kuf image when Kaf Dboty
//      is NOT checked -- nothing prints there at all when it is checked
//      (right)
//   5. Shalwar Zip (left) | Bazu ("arm") + stacked size1/size2 (right)
//   6. Daman (left) -- Delivery Date is NOT this row's right column anymore;
//      it's pinned via position: absolute to the page's own bottom-right
//      corner (.delivery-pin), independent of the design-area flow
//      entirely. It used to live in this row and its flow height was part
//      of what pushed the sheet's total content past A5 and onto a second
//      printed page.
// Bain/Gala, Collar, Button Patti, Pockets, Jaib, Kuf, Shalwar Zip, Bazu,
// and Daman all print at the larger image size (`opts.large` on
// designItem) -- only Large Buttons and Kaj Patti stay at the base size,
// per client request.
//
// Deliberately dropped versus the previous version, because the reference
// form has no place for them ("nothing extra" per the brief this replaced):
// Phone No, Button Type, and every style flag other than Kaj Patti/Kaf
// Dboty/Shalwar Zip/Large Buttons/5 Btn/No Lbl/2 Jeb (so Btn Dboty and No
// Jeb still never appear on this sheet even when checked -- No Jeb instead
// silently swaps in Jaib's "no pocket" design image, per the hook that
// builds this data). If any of those turn out to still be needed, that's a
// real omission to flag, not something this file tries to guess back in.
//
// No Lbl/2 Jeb and the free-text Note reappeared later (client request) --
// since the reference form has no place for them either, they don't join
// the design-area flow like everything else above. Instead they print as
// stacked lines pinned to the page's own bottom-left corner (.note-pin),
// mirroring how Delivery Date is pinned bottom-right (.delivery-pin) --
// same reasoning: keeping them out of the design-area flow means they add
// no flow height that could tip the sheet onto a second printed page. When
// present, No Lbl and/or 2 Jeb print first (one line each, in that order),
// then the Note text below them, all in that one bottom-left spot -- never
// three separate places on the page.
//
// Same standalone-document architecture as lib/utils/receipt.ts, and for
// the same reason: @page can't be scoped by a CSS class, so this sheet's
// @page rule would collide with the receipt's 80mm one (and vice versa) if
// either lived in the app's own stylesheet. Each print flow gets its own
// isolated document instead. Page size stays fixed at A5 (148mm x 210mm) --
// every element below is sized to fit that without overflowing, not to
// grow the page.

export interface OrderSheetMeasurement {
  ur: string
  value: string
}

// One design slot (a part design, a selected radio option, or a checked
// style flag) -- size (plain, no label) and image and name. `size`/`label`
// are pre-formatted strings, not raw numbers, since each field's own unit/
// label conventions (or lack of one, per this design) live in whichever
// hook logic builds this. A `size` containing " / " renders as two stacked
// lines instead of one (Jaib/Kuf/Bazu/Button Patti's size1+size2), per the
// reference image's stacked-numbers-beside-the-icon style.
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
  // Bain/Gala and Collar get their own slot now (left/right of row 1) --
  // a client can genuinely have both selected, so unlike an older single
  // shared slot, both render independently when present.
  bain: OrderSheetDesignItem | null
  // Gol Gala's reference image sits differently within its own frame than
  // the other Bain/Gala options (Gool Bain/Sida Bain/Half Bain/Half Bain
  // Gol all share one look) -- so it needs its own position nudge rather
  // than the shared one every other Bain/Gala option uses. This is the
  // only Bain/Gala option that needs the distinction; nothing else about
  // Bain rendering depends on which specific option was picked.
  bainIsGolGala: boolean
  collar: OrderSheetDesignItem | null
  // Large Buttons sits beside Button Patti in row 2 -- it's a style flag,
  // not a part design, so it carries no size of its own. Btn Dboty stacks
  // directly under Large Buttons, in that same left column, when checked.
  largeButtons: OrderSheetDesignItem | null
  btnDboty: OrderSheetDesignItem | null
  buttonPatti: OrderSheetDesignItem | null
  // "5 Button" is a checkbox inside the Button Patti design picker modal,
  // not its own design item -- rendered as a plain note beside it.
  fiveBtn: boolean
  pockets: OrderSheetDesignItem | null
  jaib: OrderSheetDesignItem | null
  kajPatti: OrderSheetDesignItem | null
  cuff: OrderSheetDesignItem | null
  // Whether Kaf Dboty is checked -- when not checked, "Kaf Dboty Na Ho"
  // prints directly under the Kuf image as a note; when checked, that spot
  // is left blank (checked is the assumed default, so it needs no note).
  kafDboty: boolean
  shalwarZip: OrderSheetDesignItem | null
  bazu: OrderSheetDesignItem | null
  daman: OrderSheetDesignItem | null
  // No Lbl/2 Jeb style flags and the free-text Note -- none of these join
  // the design-area flow (see the file-header comment); they print as
  // stacked lines pinned to the page's bottom-left corner instead.
  noLbl: boolean
  twoJeb: boolean
  note: string
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
  return `<tr><td class="mval">${escapeHtml(m.value || "—")}</td><td class="mur" dir="rtl">${escapeHtml(m.ur)}</td></tr>`
}

// Two trailing blank rows -- matching the reference form's own layout,
// which leaves a couple of extra rows for the tailor to hand-write a
// measurement that isn't one of the fixed fields above.
function blankMeasurementRow(): string {
  return `<tr><td class="mval">&nbsp;</td><td class="mur">&nbsp;</td></tr>`
}

// A `size` with " / " in it (Jaib/Kuf/Bazu/Button Patti's size1+size2)
// splits into separate stacked lines -- one number per line, matching the
// reference image's style for those parts (as opposed to Bain/Gala/
// Collar's single size value).
function sizeLines(size: string | null): string[] {
  if (!size) return []
  return size.split(" / ").filter(Boolean)
}

// A plain note with no image/size of its own -- e.g. "5 Button",
// "Kaf Dboty Na Ho".
function note(text: string, extraClass = ""): string {
  return `<div class="dnote ${extraClass}">${escapeHtml(text)}</div>`
}

// Bain/Gala and Collar sizes are raw client-entered strings like "1 1/4" or
// "3/4" (see BAIN_SIZE_OPTIONS/COLLAR_SIZE_OPTIONS) -- the trailing
// `n/n` fraction renders smaller than the whole-number part, like a proper
// typographic fraction, instead of printing as one same-size run of digits.
// Values with no fraction (a plain "2", or "1-1"/"1+1") pass through as-is.
function formatSizeWithFraction(value: string): string {
  const match = value.match(/^(\d+\s+)?(\d+\/\d+)$/)
  if (!match) return escapeHtml(value)
  const [, whole, fraction] = match
  return `${whole ? escapeHtml(whole) : ""}<span class="mfrac">${escapeHtml(fraction)}</span>`
}

// Renders one design slot -- empty string if there's nothing to show. No
// name/label text prints under any item (client request -- the icon plus
// its size, where it has one, is enough); `item.label` still feeds the
// image's alt text, just not a visible on-image label. `sizePosition: "top"`
// (the default) writes the size plain above the image, centered, for
// Bain/Gala. `"left"` instead sits it immediately beside the image, close
// on its left, for Collar specifically (client request -- the two sit side
// by side in row 1, but each wants its size positioned differently).
// `"right"` stacks each size line beside the image, for the part-design
// items that carry two measurements (Jaib, Kuf, Bazu, Button Patti), per
// the reference. `opts.large` bumps up the image to the shared "large"
// size (Bain/Collar/Button Patti/Pockets/Jaib/Bazu/Shalwar Zip/Daman all
// use this one). `opts.imageSizeClass` overrides that with a distinct
// class instead, sized on its own independent of every other item -- Kuf
// uses this (`ditem-image-kuf`) so its size can be tuned without dragging
// the other eight items along with it. `opts.belowNote` prints directly
// under the image, inside the same column as it (not spanning the row) --
// used for Kuf's "Kaf Dboty"/"Kaf Dboty Na Ho" note, which only makes
// sense anchored under that image. `opts.belowNoteClass` moves that note
// independently of the image (a sibling, untouched by it) -- position:
// relative + top/left, same pattern as imagePosClass.
// `opts.aboveSizeNote` (only meaningful
// with `sizePosition: "right"`) prints directly above the size text, in
// that same size column -- used for Button Patti's "5 Button" note, which
// sits above its size rather than spanning/trailing the whole row.
function designItem(
  item: OrderSheetDesignItem | null,
  sizePosition: "top" | "left" | "right" = "top",
  opts: {
    large?: boolean
    imageSizeClass?: string
    imagePosClass?: string
    sizeSizeClass?: string
    sizePosClass?: string
    belowNote?: string
    belowNoteClass?: string
    aboveSizeNote?: string
    aboveSizeNoteClass?: string
  } = {}
): string {
  // A `belowNote` is allowed to render even with no item at all -- Kaf
  // Dboty Na Ho (see the Kuf/cuff call site) must print whenever Kaf Dboty
  // is unchecked regardless of whether Kuf itself has anything selected
  // (e.g. the whole sheet is otherwise empty except Collar). Bailing out
  // early on `!item` here used to swallow that note along with the rest of
  // an empty Kuf slot.
  if ((!item || (!item.imageSrc && !item.size)) && opts.belowNote === undefined) return ""
  const lines = sizeLines(item ? item.size : null)
  const sizeModifierClass = opts.imageSizeClass ?? (opts.large ? "ditem-image-lg" : "")
  // `imagePosClass` is separate from the size classes above on purpose --
  // it only ever nudges position (position: relative + top/left), never
  // size, and applies to the image element alone, not the size text next
  // to/above it (that's a sibling, untouched by this). `sizeSizeClass`/
  // `sizePosClass` are the mirror of `imageSizeClass`/`imagePosClass` for
  // the size text itself -- wired up for all three modes: "top"/"left"'s
  // single .ditem-size element, and "right"'s .ditem-size-lines wrapper
  // (used by Kuf/Button Patti, among others) -- deliberately its own
  // element, siblings with (not a parent of) the aboveSizeNote below, so
  // `aboveSizeNoteClass` moves that note independently, without dragging
  // the size numbers along, and vice versa.
  const imageClass = ["ditem-image", sizeModifierClass, opts.imagePosClass].filter(Boolean).join(" ")
  const imageBlock =
    item && item.imageSrc
      ? `<div class="${imageClass}"><img src="${resolveAssetUrl(item.imageSrc)}" alt="${escapeHtml(item.label ?? "")}" /></div>`
      : ""
  // `!== undefined` rather than a truthy check -- callers that want a
  // fixed-height reservation for this note regardless of whether it has
  // text this time around (see Kuf/pos-kafdboty-note) pass "" instead of
  // omitting the option, so the note div (and its reserved height) still
  // renders, just empty.
  const belowNoteBlock = opts.belowNote !== undefined ? note(opts.belowNote, opts.belowNoteClass ?? "") : ""
  const sizeClass = ["ditem-size", opts.sizeSizeClass, opts.sizePosClass].filter(Boolean).join(" ")

  if (sizePosition === "right") {
    const aboveSizeNoteBlock = opts.aboveSizeNote ? note(opts.aboveSizeNote, opts.aboveSizeNoteClass ?? "") : ""
    const sizeLinesClass = ["ditem-size-lines", opts.sizeSizeClass, opts.sizePosClass].filter(Boolean).join(" ")
    const sizeLinesBlock = lines.length
      ? `<div class="${sizeLinesClass}">${lines.map((line) => `<div class="ditem-size-line">${escapeHtml(line)}</div>`).join("")}</div>`
      : ""
    const sizeBlock =
      sizeLinesBlock || aboveSizeNoteBlock ? `<div class="ditem-sizes">${aboveSizeNoteBlock}${sizeLinesBlock}</div>` : ""
    return `<div class="ditem ditem-row">
      <div class="ditem-main">${imageBlock}${belowNoteBlock}</div>
      ${sizeBlock}
    </div>`
  }

  if (sizePosition === "left") {
    const sizeBlock = lines.length ? `<div class="${sizeClass}">${formatSizeWithFraction(lines.join(" / "))}</div>` : ""
    return `<div class="ditem ditem-row">
      ${sizeBlock}
      <div class="ditem-main">${imageBlock}${belowNoteBlock}</div>
    </div>`
  }

  const sizeBlock = lines.length ? `<div class="${sizeClass}">${formatSizeWithFraction(lines.join(" / "))}</div>` : ""
  return `<div class="ditem">${sizeBlock}${imageBlock}${belowNoteBlock}</div>`
}

// No Lbl/2 Jeb (each one checkbox-driven, so at most one line apiece) then
// the free-text Note (which can itself span multiple lines) -- stacked in
// that order inside .note-pin. Empty string (not even an empty .note-pin
// div) when none of the three are present, same as every other optional
// block on this sheet.
function notePinBlock(data: Pick<OrderSheetData, "noLbl" | "twoJeb" | "note">): string {
  const lines: string[] = []
  if (data.noLbl) lines.push("No Lbl")
  if (data.twoJeb) lines.push("2 Jeb")
  if (data.note.trim()) lines.push(data.note.trim())
  if (!lines.length) return ""
  return `<div class="note-pin">${lines.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}</div>`
}

export function buildOrderSheetHtml(data: OrderSheetData): string {
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
    font-size: 10px;
  }
  [dir="rtl"] { font-family: "Noto Nastaliq Urdu", "Noto Naskh Arabic", "Segoe UI", Tahoma, Arial, sans-serif; }

  .page { position: relative; border: 1.5px solid #000; padding: 2.5mm; display: flex; flex-direction: column; height: 198mm; }

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

  .body { display: flex; gap: 1.5mm; flex: 1; min-height: 0; align-items: stretch; }

  .measurements { width: 32mm; flex-shrink: 0; }
  .mtable { width: 100%; border-collapse: collapse; border: 1px solid #000; table-layout: fixed; }
  .mtable td { border: 1px solid #000; padding: 0.8mm 0.6mm; text-align: center; font-size: 18px; }
  .mtable td.mval { font-weight: bold; width: 42%; }
  .mtable td.mur { font-size: 14px; }

  /* The gap property here is a floor, not the whole story -- space-between
     still tops it up with any leftover height, split equally across every
     row-to-row gap. Without this floor, a row that's grown tall (e.g. Kaj
     Patti's own enlarged image) can eat enough of that leftover pool that
     neighboring gaps -- like row 2 (Button Patti) to row 3 (Pockets/Jaib)
     -- visually collapse tighter than the rest. This guarantees every
     unmodified row pair gets at least the same 3mm, row 1's tight-below
     class aside, which still overrides via its own negative margin. */
  .design-area { flex: 1; min-width: 0; border: 1px solid #000; padding: 1mm 1mm; display: flex; flex-direction: column; justify-content: space-between; gap: 1mm; }
  .drow { display: flex; align-items: flex-end; gap: 3mm; }
  .drow.gap-lg { gap: 24mm; }
  /* Pulls the row right after this one up close -- used on row 1
     (Bain/Collar) so it sits tight against row 2 (Large Buttons/Button
     Patti), instead of the even space-between gap every other row pair
     gets. */
  .drow.tight-below { margin-bottom: -14mm; }
  /* Same idea as tight-below, but its own separate dial -- this is what
     controls row 2 (Large Buttons/Button Patti) -> row 3 (Pockets/Jaib)
     specifically, independent of the design-area gap floor above (which
     still applies to every other row pair) and independent of row 1's
     tight-below. 0mm = falls back to that shared floor/space-between gap;
     negative pulls row 3 up closer; positive pushes it further away. */
  .drow.gap-below-row2 { margin-bottom: 3mm; }
  /* Pure visual nudges, item-level -- position: relative + top/left shifts
     just Bain or just Collar, without affecting document flow at all, so
     these don't touch the row's own gap/position dials (tight-below,
     gap-below-row2, or a row-level nudge elsewhere), each other, or
     anything in the rest of the sheet. Negative top = up, negative left =
     left; positive is the opposite of each. */
  .dslot.pos-bain { position: relative; top: 0mm; left: 0mm; }
  .dslot.pos-collar { position: relative; top: -6mm; left: -8mm; }
  .dslot.pos-shalwarzip { position: relative; top: -4mm; left: 6mm; }
  .dslot.pos-daman { position: relative; top: 0mm; left: -18mm; }

  .dslot { flex: 1; min-width: 0; display: flex; }
  .dslot.left { justify-content: flex-end; }
  .dslot.right { justify-content: flex-start; }
  .dslot.pin-end { justify-content: flex-end; }
  /* Left-aligns both columns instead of pulling them toward the center
     divide -- used for rows where the two items should sit at their own
     column's left edge, with the natural column-width gap between them. */
  .drow.spread .dslot.left, .drow.spread .dslot.right { justify-content: flex-start; }
  /* Large Buttons + Btn Dboty's positioning box. Deliberately NOT a flex
     stack -- a flex column would size itself off whichever items are
     actually present, so Large Buttons' rendered position shifted up/down
     depending on whether Btn Dboty was checked. Fixed height/width instead,
     with each image pinned via its own position: absolute class
     (.pos-largebuttons-img / .pos-btndboty-img below) -- each one's top/left
     is a standalone offset from this box's own top-left corner, completely
     independent of whether the other image is present at all. Resize this
     box (height/width) if either image's offset needs more room to move
     into. Height is trimmed to just past Btn Dboty's own bottom edge
     (its top: 14mm + the base 18mm image height) -- both images are
     anchored via top/left, not bottom/right, so this box's height is pure
     reserved flow space with no effect on where either image actually
     paints; shrinking it recovers page height without moving anything
     visible. */
  .dstack { position: relative; height: 34mm; width: 22mm; }
  /* Same fix as .kajpatti-slot further down, generalized to the rest of
     the sheet: .design-area's justify-content: space-between sizes every
     row-to-row gap off the *sum* of all six rows' heights, and each row's
     own height is set by whichever of its two items is tallest. Left
     unreserved, any row where the taller item happens to be unchecked
     shrinks, and that freed height gets redistributed across every gap on
     the page -- shifting every other item's position, even ones in
     unrelated rows (this is what made Collar's position depend on whether
     Bain, or anything else on the sheet, was checked -- Bain's row is the
     one right above it, and once its own height became inconsistent, so
     did every row after it). Each class below reserves its row's
     known-tallest item's full footprint unconditionally -- present or not
     -- so that row's track height, and therefore every gap derived from
     it, stays constant no matter what's checked anywhere else on the
     sheet. Only the tallest item per row needs reserving; a shorter
     sibling can never grow the row past what the reserved one already
     guarantees. Row 2 (dstack above) and row 4 (.kajpatti-slot below) are
     already covered by their own existing fixed boxes. */
  .bain-slot { height: 29mm; width: 22mm; }
  .pockets-slot { height: 22mm; width: 22mm; }
  .shalwarzip-slot { height: 22mm; width: 22mm; }
  .daman-slot { height: 22mm; width: 22mm; }

  .ditem { display: flex; flex-direction: column; align-items: center; text-align: center; }
  .ditem-size { font-size: 20px; font-weight: bold; margin-bottom: 0; }
  .ditem-size .mfrac { font-size: 0.68em; }
  .ditem-image { height: 18mm; width: 18mm; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
  /* Nudges just Bain's image -- its size text (.ditem-size, a sibling
     above it) stays put since this only targets the image element. */
  .pos-bain-img { position: relative; top: -6mm; left: 0mm; }
  /* Nudges just Bain's size text -- its image (a sibling below it) is
     untouched, and this is independent of .dslot.pos-bain (which moves the
     whole item, image included) and .pos-bain-img above. */
  .pos-bain-size { position: relative; top: 0mm; left: 0mm; }
  /* Gol Gala-only overrides -- swapped in for .pos-bain-img/.pos-bain-size
     above (not layered on top of them) whenever the selected Bain/Gala
     option is specifically Gol Gala (see OrderSheetData.bainIsGolGala),
     since its reference image sits differently in its own frame than
     Gool Bain/Sida Bain/Half Bain/Half Bain Gol, which all share one look
     and stay on .pos-bain-img/.pos-bain-size. Editing these only ever
     affects Gol Gala; every other Bain/Gala option is untouched. */
  .pos-bain-img-golgala { position: relative; top: 1mm; left: 0mm; }
  .pos-bain-size-golgala { position: relative; top: 0mm; left: 0mm; }
  .ditem-image img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .ditem-image-lg { height: 22mm; width: 22mm; }
  /* Kuf's own size, independent of .ditem-image-lg above -- edit this one
     to resize just the Kuf ("cuff") picture without touching Bain/Collar/
     Button Patti/Pockets/Jaib/Bazu/Shalwar Zip/Daman. */
  .ditem-image-kuf { height: -2mm; width: 32mm; }
  /* Nudges just Kuf's image -- its size numbers and Kaf Dboty note
     (siblings) are untouched, and this is independent of .pos-kuf-size and
     .pos-kafdboty-note below. */
  .pos-kuf-img { position: relative; top: -5mm; left: -10mm; }
  /* Nudges just Kuf's size numbers (the stacked .ditem-sizes column) --
     its image (a sibling) is untouched. Left-aligned, same reasoning as
     Jaib below (size2 above size1, via cuffItem's reverseSizes, and size2
     being a longer string than size1 would otherwise stagger the two
     centered lines sideways). gap is the vertical space between the two
     stacked size lines -- edit that value to open up or tighten it. */
  .pos-kuf-size { position: relative; top: -8mm; left: -10mm; display: flex; flex-direction: column; align-items: flex-start; text-align: left; gap: 2.4mm; }
  /* Nudges just the "Kaf Dboty"/"Kaf Dboty Na Ho" note under the Kuf image
     -- the image (a sibling) is untouched, and this is independent of
     .pos-kuf-size above (which only moves the size numbers). Also reserves
     this note's height unconditionally: Kuf's image (.ditem-main) and its
     size numbers (.ditem-sizes) are flex siblings in .ditem-row, which
     centers them on each other (align-items: center) -- so when the note
     was only rendered while unchecked, ditem-main's own height changed
     between checked/unchecked, and centering shifted the size numbers up
     or down to match, even though they have nothing to do with Kaf Dboty.
     The explicit height below (plus designItem always rendering this div,
     just empty, when checked -- see the belowNote !== undefined check in
     designItem) keeps ditem-main's height constant either way, so Kuf's
     size numbers no longer move based on the note's presence. */
  .pos-kafdboty-note { position: relative; top: -7mm; left: -11mm; height: 4.5mm; }
  /* Nudges just Jaib's image -- its stacked size numbers (a sibling) are
     untouched. */
  .pos-jaib-img { position: relative; top: 0mm; left: 0mm; }
  /* Nudges just Jaib's stacked size numbers -- its image (a sibling) is
     untouched. Left-aligned (rather than the shared .ditem centered
     default) so size1/size2 share a left edge instead of each centering on
     its own width -- otherwise size2 being a longer string than size1
     visibly staggers the two lines sideways. gap is the vertical space
     between the two lines -- edit that value to open up or tighten it. */
  .pos-jaib-size { position: relative; top: 4mm; left: 0mm; display: flex; flex-direction: column; align-items: flex-start; text-align: left; gap: 2mm; }
  /* Nudges just Bazu's image -- its stacked size numbers (a sibling) are
     untouched. */
  .pos-bazu-img { position: relative; top: -4mm; left: -2mm; }
  /* Nudges just Bazu's stacked size numbers -- its image (a sibling) is
     untouched. Left-aligned, same reasoning as Jaib/Kuf above (size2 above
     size1, via bazuItem's reverseSizes, would otherwise stagger sideways
     against the shorter size1 if centered). gap is the vertical space
     between the two stacked size lines -- edit that value to open up or
     tighten it. */
  .pos-bazu-size { position: relative; top: -2mm; left: -1mm; display: flex; flex-direction: column; align-items: flex-start; text-align: left; gap: 2mm; }
  /* Nudges just Pockets' image (its only content -- no size/label print
     for it, see designItem's guard). */
  .pos-pockets-img { position: relative; top: -2mm; left: 0mm; }
  /* Kaj Patti's own size, same pattern -- edit this one to resize just its
     picture without touching Large Buttons/Btn Dboty, which still share
     the plain .ditem-image base size above. */
  .ditem-image-kajpatti { height: 35mm; width: 18mm; }
  /* Nudges just Kaj Patti's image -- nothing else sits in that dslot (Kaj
     Patti has no size/note of its own), so this is independent of every
     other item's position. */
  .pos-kajpatti-img { position: relative; top: -5mm; left: -10mm; }
  /* .design-area's justify-content: space-between (see above) sizes every
     row-to-row gap off the *sum* of all six rows' heights -- so when Kaj
     Patti is unchecked, its dslot renders nothing, row 4's own flex track
     shrinks from 35mm (Kaj Patti's image height) down to Kuf's ~18mm, and
     that freed-up height gets redistributed across every gap, including
     the one above row 4. Net effect: row 4's own top position -- and
     Kuf's position inside it -- shifted depending on Kaj Patti's checked
     state, even though Kuf has nothing to do with Kaj Patti. This box
     reserves Kaj Patti's full 35mm/18mm footprint unconditionally (same
     fix as .dstack uses for Large Buttons/Btn Dboty, just for a single
     item instead of two stacked ones), so row 4's track height -- and
     Kuf's position -- stay constant whether or not Kaj Patti is present. */
  .kajpatti-slot { height: 35mm; width: 18mm; }
  /* Button Patti's own size, same pattern -- edit this one to resize just
     its picture without touching Bain/Collar/Pockets/Jaib/Bazu/Shalwar
     Zip/Daman, which still share .ditem-image-lg above. */
  .ditem-image-buttonpatti { height: 26mm; width: 20mm; }
  /* Nudges just Button Patti's image -- its size text/"5 Button" note
     (siblings inside .ditem-sizes) stay put since this only targets the
     image element. */
  .pos-buttonpatti-img { position: relative; top: -4mm; left: 4mm; }
  /* Button Patti's own size-text size (font-size of the "12-1 3/4" line),
     independent of the shared .ditem-sizes font-size that Jaib/Kuf/Bazu
     still use. */
  .ditem-sizes-buttonpatti { font-size: 15px; }
  /* Nudges just Button Patti's size numbers ("12-1 3/4") -- independent of
     the "5 Button" note above it and of Button Patti's image (both
     siblings). */
  .pos-buttonpatti-size { position: relative; top: -9mm; left: 0mm; }
  /* Nudges just the "5 Button" note -- independent of Button Patti's size
     numbers below it (a sibling inside the same .ditem-sizes column). */
  .pos-5button-note { position: relative; top:-10mm; left: 1mm; }
  /* Collar's own size, same pattern -- edit this one to resize just its
     picture without touching Bain/Button Patti/Pockets/Jaib/Bazu/Shalwar
     Zip/Daman, which still share .ditem-image-lg above. */
  .ditem-image-collar { height: 20mm; width: 30mm; }
  /* Nudges just Collar's size text -- the image beside it (a sibling) is
     untouched, and this is independent of .dslot.pos-collar (which moves
     the whole item, image included). */
  .pos-collar-size { position: relative; top: -8mm; left: 2mm; }
  /* Nudges just Collar's image -- its size text (a sibling) is untouched,
     and this is independent of .dslot.pos-collar (which moves the whole
     item, image included) and .pos-collar-size above. */
  .pos-collar-img { position: relative; top: -4mm; left: 0mm; }
  /* Large Buttons' own position within .dstack -- position: absolute so it
     sits at a fixed spot in the box regardless of whether Btn Dboty (its
     sibling below) is present at all. Edit top/left to move just this
     image. */
  .pos-largebuttons-img { position: absolute; top: 0mm; left: 11mm; }
  /* Btn Dboty's own position within .dstack -- position: absolute, same
     idea as Large Buttons above, so moving one never shifts the other.
     Edit top/left to move just this image. */
  .pos-btndboty-img { position: absolute; top: 14mm; left: 14mm; }

  .ditem-row { flex-direction: row; align-items: center; gap: 1mm; }
  .ditem-main { display: flex; flex-direction: column; align-items: center; text-align: center; }
  .ditem-sizes { display: flex; flex-direction: column; font-size: 15px; font-weight: bold; line-height: 1.2; }

  .dnote { font-size: 14px; font-weight: bold; text-align: center; margin: 0.5mm 0; }

  .delivery-value { display: inline-block; border-bottom: 1px solid #000; padding-bottom: 0.3mm; min-width: 20mm; }
  /* Delivery Date pins to the page's own bottom-right corner via
     position: absolute on .page above -- deliberately NOT part of the
     Daman row's flex flow anymore, so it no longer adds to the
     design-area's total flow height (which was tipping the sheet onto a
     second printed page) and no longer moves when Daman's own position is
     tuned. right/bottom are its only two dials -- edit those to nudge
     it, independent of everything else on the sheet. Kept within the
     page's own 2.5mm padding inset so it never prints past the border/A5
     edge. */
  .delivery-pin { position: absolute; right: 4.5mm; bottom: 8.5mm;  font-size: 16px; font-weight: bold; text-align: right; }
  /* No Lbl/2 Jeb + the free-text Note pin to the page's own bottom-left
     corner, mirroring .delivery-pin's bottom-right pin above -- same
     reasoning: kept out of the design-area's flow entirely (position:
     absolute on .page) so none of them add flow height that could tip the
     sheet onto a second printed page. Stacked lines, not one run-on line,
     since the Note can be long free text. */
  .note-pin { position: absolute; left: 4.5mm; bottom: 8.5mm; max-width: 60mm; font-size: 12px; font-weight: bold; text-align: left; }
  .note-pin div { margin-top: 0.3mm; }
  .note-pin div:first-child { margin-top: 0; }

  .footer { margin-top: 1mm; text-align: center; font-size: 6.5px; color: #999; }
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
        <table class="mtable">
          <tbody>
            ${data.measurements.map(measurementRow).join("\n")}
            ${blankMeasurementRow()}
          </tbody>
        </table>
      </div>

      <div class="design-area">
        <div class="drow gap-lg spread tight-below pos-row1">
          <div class="dslot left pos-bain"><div class="bain-slot">${designItem(data.bain, "top", {
            large: true,
            imagePosClass: data.bainIsGolGala ? "pos-bain-img-golgala" : "pos-bain-img",
            sizePosClass: data.bainIsGolGala ? "pos-bain-size-golgala" : "pos-bain-size",
          })}</div></div>
          <div class="dslot right pos-collar">${designItem(data.collar, "left", { imageSizeClass: "ditem-image-collar", imagePosClass: "pos-collar-img", sizePosClass: "pos-collar-size" })}</div>
        </div>

        <div class="drow gap-below-row2 pos-row2">
          <div class="dslot left">
            <div class="dstack">
              ${designItem(data.largeButtons, "top", { imagePosClass: "pos-largebuttons-img" })}
              ${designItem(data.btnDboty, "top", { imagePosClass: "pos-btndboty-img" })}
            </div>
          </div>
          <div class="dslot right">
            ${designItem(data.buttonPatti, "right", {
              imageSizeClass: "ditem-image-buttonpatti",
              imagePosClass: "pos-buttonpatti-img",
              sizeSizeClass: "ditem-sizes-buttonpatti",
              sizePosClass: "pos-buttonpatti-size",
              aboveSizeNote: data.fiveBtn ? "5 Button" : undefined,
              aboveSizeNoteClass: "pos-5button-note",
            })}
          </div>
        </div>

        <div class="drow spread">
          <div class="dslot left"><div class="pockets-slot">${designItem(data.pockets, "top", { large: true, imagePosClass: "pos-pockets-img" })}</div></div>
          <div class="dslot right">${designItem(data.jaib, "right", {
            large: true,
            imagePosClass: "pos-jaib-img",
            sizePosClass: "pos-jaib-size",
          })}</div>
        </div>

        <div class="drow">
          <div class="dslot left"><div class="kajpatti-slot">${designItem(data.kajPatti, "top", {
            imageSizeClass: "ditem-image-kajpatti",
            imagePosClass: "pos-kajpatti-img",
          })}</div></div>
          <div class="dslot right">
            ${designItem(data.cuff, "right", {
              imageSizeClass: "ditem-image-kuf",
              imagePosClass: "pos-kuf-img",
              sizePosClass: "pos-kuf-size",
              belowNote: data.kafDboty ? "" : "Kaf Dboty Na Ho",
              belowNoteClass: "pos-kafdboty-note",
            })}
          </div>
        </div>

        <div class="drow spread">
          <div class="dslot left pos-shalwarzip"><div class="shalwarzip-slot">${designItem(data.shalwarZip, "top", { large: true })}</div></div>
          <div class="dslot right">${designItem(data.bazu, "right", {
            large: true,
            imagePosClass: "pos-bazu-img",
            sizePosClass: "pos-bazu-size",
          })}</div>
        </div>

        <div class="drow">
          <div class="dslot left pos-daman"><div class="daman-slot">${designItem(data.daman, "top", { large: true })}</div></div>
          <div class="dslot right"></div>
        </div>
      </div>
    </div>

    ${notePinBlock(data)}

    <div class="delivery-pin">D. Date:       <span class="delivery-value">${escapeHtml(data.deliveryDate)}</span></div>

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
