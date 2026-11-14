import type { ReactNode } from "react"
import { CHOICE_LABEL_CLASS, RadioMark } from "@/components/tailor-shared/choice-marks"
import type { RadioItem } from "@/types/shalwar-kameez"

interface RadioOptionGroupProps {
  title: string
  // Urdu title shown instead of `title` (Pant sheet labels its groups in Urdu).
  titleUr?: string
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

// Rows sit inside a shared option card (see OptionCard) separated by dividers,
// so a row carries no border, background or radius of its own.
const ROW_CLASS = "flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-[#F7F4EA]"

// One bordered row per single-select option group (pocket, bain/gala, collar,
// daman) — each maps to a `*_type_id` FK in the schema. Mirrors the Claude
// Design spec (Shalwar Kameez Dashboard.dc.html) pixel-for-pixel.
//
// Options carry data-nav-row/col so arrow keys can reach them from the panel-
// level handler (see lib/utils/keyboard-nav) -- same as the checkbox group,
// arrow navigation only moves the hover/focus spot, it never selects an
// option by itself. Enter selects the focused one, same convention as
// Enter-to-toggle on checkboxes.
export function RadioOptionGroup({ title, titleUr, name, options, trailingSlot, navRow }: RadioOptionGroupProps) {
  return (
    <div className={ROW_CLASS}>
      {titleUr ? (
        <span className="flex w-28 shrink-0 flex-col gap-0.5">
          <span className="font-[family-name:var(--font-naskh)] text-[18px] font-bold text-[#1B2233]" dir="rtl">{titleUr}</span>
        </span>
      ) : (
        <span className="flex w-28 shrink-0 flex-col gap-0.5">
          <span className="text-[12px] font-bold tracking-[0.06em] text-[#1B2233] uppercase">{title}</span>
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-1">
        {options.map((option, index) => (
          <label key={option.value} className={CHOICE_LABEL_CLASS}>
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
              className="peer sr-only"
            />
            <RadioMark />
            {option.label}
          </label>
        ))}
      </div>
      {trailingSlot}
    </div>
  )
}
