import type { CheckboxItem } from "@/types/shalwar-kameez"

interface CheckboxGroupProps {
  items: CheckboxItem[]
  columns?: 1 | 2 | 3
}

const COLUMNS_CLASS: Record<1 | 2 | 3, string> = {
  1: "grid grid-cols-1 gap-y-1",
  2: "grid grid-cols-2 gap-x-4 gap-y-1",
  3: "grid grid-cols-3 gap-x-4 gap-y-1",
}

// Reused for both the plain "basic" checkboxes and the independent style-flag
// checkboxes — same look, different data source (see use-shalwar-kameez-form).
export function CheckboxGroup({ items, columns = 3 }: CheckboxGroupProps) {
  return (
    <div className={COLUMNS_CLASS[columns]}>
      {items.map((item) => (
        <label key={item.key} className="flex cursor-pointer items-center gap-1.5 text-[14.5px] text-black">
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
