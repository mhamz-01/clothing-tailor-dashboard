import type { RadioItem } from "@/types/shalwar-kameez"

interface ButtonTypePanelProps {
  options: RadioItem[]
}

// Single-select list — a `<button_type_id>` FK, so radios underneath for
// correct exclusivity — but styled as small squares (appearance-none) to
// match the Claude Design spec's checkbox look pixel-for-pixel.
export function ButtonTypePanel({ options }: ButtonTypePanelProps) {
  return (
    <div className="flex w-[98px] shrink-0 flex-col gap-1.5 border-l border-[#e4e4e9] pl-2.5">
      <div className="text-[10px] font-bold tracking-[0.05em] text-[#8a8a92] uppercase">Button Type</div>
      {options.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold text-[#222226]">
          <input
            type="radio"
            name="buttonType"
            checked={option.checked}
            onChange={option.onChange}
            className="size-[14px] shrink-0 cursor-pointer appearance-none rounded-[2px] border border-[#c7c7cf] bg-white checked:border-black checked:bg-black"
          />
          {option.label}
        </label>
      ))}
    </div>
  )
}
