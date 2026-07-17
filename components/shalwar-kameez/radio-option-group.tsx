import type { ReactNode } from "react"
import type { RadioItem } from "@/types/shalwar-kameez"

interface RadioOptionGroupProps {
  title: string
  name: string
  options: RadioItem[]
  // Rendered at the far right of the row (margin-left:auto) — the Size
  // quick-pick for Bain/Gala and Collar/Cut, or the Shalwar Zip checkbox for Daman.
  trailingSlot?: ReactNode
  // Row number this group occupies within the ancestor data-nav-container --
  // see StyleOptionsPanel, which stacks Pockets/Bain-Gala/Collar/Daman under
  // the checkbox block in one shared grid so Up/Down flows between all of
  // them instead of stopping at each row's own boundary.
  navRow: number
}

// One bordered row per single-select option group (pocket, bain/gala, collar,
// daman) — each maps to a `*_type_id` FK in the schema. Mirrors the Claude
// Design spec (Shalwar Kameez Dashboard.dc.html) pixel-for-pixel.
//
// Options carry data-nav-row/col so arrow keys can reach them from the panel-
// level handler (see lib/utils/keyboard-nav) -- same as the checkbox group,
// arrow navigation only moves the hover/focus spot, it never selects an
// option by itself. Enter selects the focused one, same convention as
// Enter-to-toggle on checkboxes.
export function RadioOptionGroup({ title, name, options, trailingSlot, navRow }: RadioOptionGroupProps) {
  return (
    <div className="flex items-center gap-3.5 rounded-[5px] border border-[#dcdce1] bg-[#fafafb] px-3 py-[15px]">
      <span className="w-16 shrink-0 text-[12px] font-bold tracking-[0.06em] text-[#8a8a92] uppercase">{title}</span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
        {options.map((option, index) => (
          <label
            key={option.value}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[3px] px-1 py-0.5 text-[14px] font-semibold whitespace-nowrap text-[#222226] [&:has(:focus-visible)]:bg-[#eef0ff]"
          >
            <input
              type="radio"
              name={name}
              checked={option.checked}
              onChange={option.onChange}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return
                e.preventDefault()
                option.onChange()
              }}
              data-nav-row={navRow}
              data-nav-col={index}
              className="size-4 cursor-pointer accent-[#111116]"
            />
            {option.label}
          </label>
        ))}
      </div>
      {trailingSlot}
    </div>
  )
}
