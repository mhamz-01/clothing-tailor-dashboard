import type { CheckboxItem } from "@/types/shalwar-kameez"

interface CheckboxGroupProps {
  items: CheckboxItem[]
  columns?: 2 | 3
}

// Reused for both the plain "basic" checkboxes and the independent style-flag
// checkboxes — same look, different data source (see use-shalwar-kameez-form).
export function CheckboxGroup({ items, columns = 3 }: CheckboxGroupProps) {
  return (
    <div className={columns === 2 ? "grid grid-cols-2 gap-x-4 gap-y-1" : "grid grid-cols-3 gap-x-4 gap-y-1"}>
      {items.map((item) => (
        <label key={item.key} className="flex cursor-pointer items-center gap-1.5 text-[13.5px] font-bold text-black">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={item.onChange}
            className="size-4 cursor-pointer accent-slate-600"
          />
          {item.label}
        </label>
      ))}
    </div>
  )
}
