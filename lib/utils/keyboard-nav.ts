import type { KeyboardEvent } from "react"

// Shared arrow-key navigation for the Shalwar Kameez form's grid-shaped
// panels (measurements, part-design table, checkbox groups) -- lets the
// tailor move between fields with Up/Down/Left/Right instead of a number
// input's native spin behavior eating Up/Down, or arrows doing nothing at
// all on checkboxes/text fields.
//
// Cells opt in with data-nav-row/data-nav-col; a data-nav-container ancestor
// scopes the search. Pure DOM lookup (querySelector), not refs -- works
// through the Input wrapper (components/ui/input.tsx) without any extra
// plumbing, since the attributes land on the real <input> element either way.

const ARROW_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"])

function isCaretAtEdge(input: HTMLInputElement, edge: "start" | "end"): boolean {
  try {
    const { selectionStart, selectionEnd } = input
    // type="number" inputs report no caret position at all (null in current
    // Chromium; older engines throw instead) -- treat that as always at the
    // edge so Left/Right jumps fields immediately rather than silently doing
    // nothing.
    if (selectionStart === null || selectionEnd === null) return true
    const pos = edge === "start" ? 0 : input.value.length
    return selectionStart === pos && selectionEnd === pos
  } catch {
    return true
  }
}

// Vertical moves land on the nearest existing column in the target row
// (not a strict same-column match) so ragged grids -- a shorter last row in
// the checkbox grid, or the measurements panel's two-column final row --
// still navigate to *something* sensible instead of doing nothing.
function closestCellInRow(container: Element, row: number, col: number): HTMLElement | null {
  const cells = Array.from(container.querySelectorAll<HTMLElement>(`[data-nav-row="${row}"]`))
  if (cells.length === 0) return null
  return cells.reduce((best, cell) =>
    Math.abs(Number(cell.dataset.navCol) - col) < Math.abs(Number(best.dataset.navCol) - col) ? cell : best
  )
}

// Landing on a cell is just moving the hover/focus spot -- it never selects
// or toggles anything by itself, for either checkboxes or radios (Enter does
// that, see CheckboxGroup/RadioOptionGroup). Text/number fields are the one
// exception: they get their value selected so typing immediately replaces it,
// which isn't a "selection" in the checked/radio sense.
function landOnCell(cell: HTMLElement) {
  cell.focus()
  if (cell instanceof HTMLInputElement && (cell.type === "text" || cell.type === "number")) cell.select()
}

export function handleGridArrowKeyDown(event: KeyboardEvent<HTMLElement>) {
  if (!ARROW_KEYS.has(event.key)) return

  const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-nav-row]")
  if (!cell) return

  // A textarea (the Note field) only exits on ArrowUp, and only once the
  // caret is already on its first line -- Down/Left/Right, and Up from any
  // later line, keep their normal multi-line meaning (moving the caret
  // through the note's own text) instead of jumping out of the field.
  if (cell instanceof HTMLTextAreaElement) {
    if (event.key !== "ArrowUp") return
    const caretOnFirstLine = !cell.value.slice(0, cell.selectionStart ?? 0).includes("\n")
    if (!caretOnFirstLine) return
    const container = cell.closest("[data-nav-container]")
    if (!container) return
    const row = Number(cell.dataset.navRow)
    const col = Number(cell.dataset.navCol)
    const next = closestCellInRow(container, row - 1, col)
    if (!next) return
    event.preventDefault()
    landOnCell(next)
    return
  }

  // Text-capable fields keep their normal caret movement mid-value -- only
  // jump to the next cell once the caret is already at that edge (or for
  // type="number", which can't report caret position at all).
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    if (cell instanceof HTMLInputElement && (cell.type === "text" || cell.type === "number")) {
      if (!isCaretAtEdge(cell, event.key === "ArrowLeft" ? "start" : "end")) return
    }
  }

  // A number input's native spin must be suppressed unconditionally on
  // Up/Down, even at a grid edge with no cell to move to -- otherwise the
  // boundary case (e.g. the very first measurement field, nothing above it)
  // falls through to the browser's default increment/decrement.
  if (cell instanceof HTMLInputElement && cell.type === "number" && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
    event.preventDefault()
  }

  // A closed <select> (the Bain/Gala and Collar Size quick-pick) has the
  // exact same problem as a number input: a focused-but-closed select spins
  // its own value on Up/Down natively. Suppressed unconditionally on all
  // four arrows -- Left/Right have no native meaning on a select anyway, so
  // there's nothing lost by always treating this cell as pure grid movement.
  // Picking a value is still Space/Enter/click to open it, same as any other
  // native select; once actually open, the dropdown is native OS/browser UI
  // that our keydown listener never even sees, so this can't interfere with it.
  if (cell instanceof HTMLSelectElement) {
    event.preventDefault()
  }

  // A date input (Delivery Date) has the same all-arrows problem as a
  // select: natively, Up/Down step the focused day/month/year segment's
  // value and Left/Right move between segments, on every arrow, even at
  // what this grid considers an edge. Suppressed unconditionally so it
  // behaves as a normal grid cell like everything else here -- opening the
  // date picker is Enter/Space/click instead (see order-summary-panel.tsx).
  if (cell instanceof HTMLInputElement && cell.type === "date") {
    event.preventDefault()
  }

  // A radio input has the same problem again, but on all four arrows: browsers
  // natively treat Up/Down *and* Left/Right as "select the next/previous radio
  // in this same-name group" -- not just at a real boundary within the group,
  // but even when this handler finds no grid cell to move to at all (e.g.
  // ArrowRight on Button Type, a single-column list with nothing to its
  // right). Without this, that case falls through to the browser's own
  // cycling and silently changes the selection instead of doing nothing.
  if (cell instanceof HTMLInputElement && cell.type === "radio") {
    event.preventDefault()
  }

  const container = cell.closest("[data-nav-container]")
  if (!container) return

  const row = Number(cell.dataset.navRow)
  const col = Number(cell.dataset.navCol)

  let next: HTMLElement | null = null
  if (event.key === "ArrowUp") next = closestCellInRow(container, row - 1, col)
  else if (event.key === "ArrowDown") next = closestCellInRow(container, row + 1, col)
  else if (event.key === "ArrowLeft") next = container.querySelector<HTMLElement>(`[data-nav-row="${row}"][data-nav-col="${col - 1}"]`)
  else if (event.key === "ArrowRight") next = container.querySelector<HTMLElement>(`[data-nav-row="${row}"][data-nav-col="${col + 1}"]`)

  // Two ragged, differently-tall columns sitting side by side (Order Summary's
  // amount fields vs. Button Type's longer option list -- see
  // order-summary-panel.tsx) means some rows on the taller side have no exact
  // row/col match on the other side, so the lookup above comes up empty even
  // though there's an obvious place to land: the nearer column's own edge.
  // A cell opts into that via data-nav-left-fallback/data-nav-right-fallback
  // ("row:col"), used only when the normal exact match misses -- everywhere
  // else keeps the exact-match behavior above untouched.
  if (!next && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
    const fallback = event.key === "ArrowLeft" ? cell.dataset.navLeftFallback : cell.dataset.navRightFallback
    if (fallback) {
      const [fallbackRow, fallbackCol] = fallback.split(":")
      next = container.querySelector<HTMLElement>(`[data-nav-row="${fallbackRow}"][data-nav-col="${fallbackCol}"]`)
    }
  }

  if (!next) return
  event.preventDefault()
  landOnCell(next)
}
