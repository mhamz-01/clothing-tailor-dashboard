import type { CheckboxItem } from "@/types/shalwar-kameez"

interface CheckboxGroupProps {
  items: CheckboxItem[]
  // Omit for a flex-wrap row (e.g. Shirt Options); pass a column count for a
  // fixed CSS grid (e.g. the 4-column feature-checks block).
  columns?: 2 | 3 | 4
}

const COLUMNS_CLASS: Record<2 | 3 | 4, string> = {
  2: "grid grid-cols-2 gap-x-4 gap-y-1.5",
  3: "grid grid-cols-3 gap-x-4 gap-y-1.5",
  4: "grid grid-cols-4 gap-x-2 gap-y-2.5",
}

// Reused for every plain checkbox list on the form — same look, different
// data source (see use-shalwar-kameez-form). Mirrors the Claude Design spec
// (Shalwar Kameez Dashboard.dc.html).
export function CheckboxGroup({ items, columns }: CheckboxGroupProps) {
  return (
    <div className={columns ? COLUMNS_CLASS[columns] : "flex flex-wrap items-center gap-x-4 gap-y-2"}>
      {items.map((item) => (
        <label key={item.key} className="flex cursor-pointer items-center gap-1.5 text-[14px] font-semibold text-[#222226]">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={item.onChange}
            className="size-4 cursor-pointer accent-[#111116]"
          />
          {item.label}
        </label>
      ))}
    </div>
  )
}
