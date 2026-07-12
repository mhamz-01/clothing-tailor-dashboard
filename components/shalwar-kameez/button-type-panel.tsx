import type { RadioItem } from "@/types/shalwar-kameez"

interface ButtonTypePanelProps {
  options: RadioItem[]
}

export function ButtonTypePanel({ options }: ButtonTypePanelProps) {
  return (
    <div>
      <div className="mb-1 rounded-md bg-white px-2 py-1 text-[11px] font-bold tracking-wide text-black uppercase">
        Button Type
      </div>
      <div className="grid grid-cols-1 gap-y-0.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-1.5 text-[11px] font-bold whitespace-nowrap text-black">
            <input
              type="radio"
              name="buttonType"
              checked={option.checked}
              onChange={option.onChange}
              className="size-3.5 cursor-pointer accent-slate-600"
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  )
}
