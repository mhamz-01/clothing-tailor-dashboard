import type { ReactNode } from "react"
import type { RadioItem } from "@/types/shalwar-kameez"

interface RadioOptionGroupProps {
  title: string
  name: string
  options: RadioItem[]
  // Rendered immediately after the last radio option (e.g. right next to "None")
  // — used by Bain/Gala Type and Collar Type for their numbered quick-pick dropdown.
  trailingSlot?: ReactNode
}

// Reused for every single-select option group on the form (pocket, bain/gala,
// collar, daman, button type) — each maps to a `*_type_id` FK in the schema.
export function RadioOptionGroup({ title, name, options, trailingSlot }: RadioOptionGroupProps) {
  return (
    <div>
      <div className="mb-1.5 text-[11.5px] font-bold tracking-wide text-black uppercase">{title}</div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-1.5 text-[13.5px] font-bold whitespace-nowrap text-black">
            <input
              type="radio"
              name={name}
              checked={option.checked}
              onChange={option.onChange}
              className="size-3.5 cursor-pointer accent-slate-600"
            />
            {option.label}
          </label>
        ))}
        {trailingSlot}
      </div>
    </div>
  )
}
