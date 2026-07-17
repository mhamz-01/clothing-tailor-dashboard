import type { CheckboxItem } from "@/types/shalwar-kameez"

interface CheckboxGroupProps {
  items: CheckboxItem[]
  // Omit for a flex-wrap row (e.g. Shirt Options); pass a column count for a
  // fixed CSS grid (e.g. the 4-column feature-checks block).
  columns?: 2 | 3 | 4
  // Row number this group's first row starts at within the ancestor
  // data-nav-container -- see StyleOptionsPanel, which stacks this group
  // above the Pockets/Bain-Gala/Collar/Daman radio rows in one shared grid
  // so arrow keys flow between all of them, not just within this group.
  navRowOffset?: number
}

const COLUMNS_CLASS: Record<2 | 3 | 4, string> = {
  2: "grid grid-cols-2 gap-x-4 gap-y-1.5",
  3: "grid grid-cols-3 gap-x-4 gap-y-1.5",
  4: "grid grid-cols-4 gap-x-2 gap-y-2.5",
}

// Reused for every plain checkbox list on the form — same look, different
// data source (see use-shalwar-kameez-form). Mirrors the Claude Design spec
// (Shalwar Kameez Dashboard.dc.html).
//
// Arrow keys rove focus between items (wired to the grid's actual column
// count so Up/Down land in the right visual spot, not just array order) --
// handled by a data-nav-container ancestor's onKeyDown (see
// StyleOptionsPanel/lib/utils/keyboard-nav), not here, so this group can sit
// inside a bigger shared grid. Enter toggles the focused item same as Space,
// which arrow navigation deliberately does *not* do -- unlike the radio rows
// below it, moving through checkboxes is just "hover", not "select".
// The flex-wrap layout (no `columns`) has no fixed row width to compute
// row/col from, so it's treated as one row: Left/Right still step through
// it, Up/Down are no-ops.
export function CheckboxGroup({ items, columns, navRowOffset = 0 }: CheckboxGroupProps) {
  const columnCount = columns ?? items.length

  return (
    <div className={columns ? COLUMNS_CLASS[columns] : "flex flex-wrap items-center gap-x-4 gap-y-2"}>
      {items.map((item, index) => (
        <label
          key={item.key}
          className="flex cursor-pointer items-center gap-1.5 rounded-[3px] px-1 py-0.5 text-[14px] font-semibold text-[#222226] [&:has(:focus-visible)]:bg-[#eef0ff]"
        >
          <input
            type="checkbox"
            checked={item.checked}
            onChange={item.onChange}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return
              e.preventDefault()
              item.onChange()
            }}
            data-nav-row={navRowOffset + Math.floor(index / columnCount)}
            data-nav-col={index % columnCount}
            className="size-4 cursor-pointer accent-[#111116]"
          />
          {item.label}
        </label>
      ))}
    </div>
  )
}
