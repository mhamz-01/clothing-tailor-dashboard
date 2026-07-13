import type { ReactNode } from "react"
import type { RadioItem } from "@/types/shalwar-kameez"

interface RadioOptionGroupProps {
  title: string
  name: string
  options: RadioItem[]
  // Rendered at the far right of the row (margin-left:auto) — the Design #
  // quick-pick for Bain/Gala and Collar/Cut, or the Shalwar Zip checkbox for Daman.
  trailingSlot?: ReactNode
}

// One bordered row per single-select option group (pocket, bain/gala, collar,
// daman) — each maps to a `*_type_id` FK in the schema. Mirrors the Claude
// Design spec (Shalwar Kameez Dashboard.dc.html) pixel-for-pixel.
export function RadioOptionGroup({ title, name, options, trailingSlot }: RadioOptionGroupProps) {
  return (
    <div className="flex items-center gap-3.5 rounded-[5px] border border-[#dcdce1] bg-[#fafafb] px-3 py-[15px]">
      <span className="w-16 shrink-0 text-[12px] font-bold tracking-[0.06em] text-[#8a8a92] uppercase">{title}</span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[14px] font-semibold whitespace-nowrap text-[#222226]">
            <input
              type="radio"
              name={name}
              checked={option.checked}
              onChange={option.onChange}
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
