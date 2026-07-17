import type { RadioItem } from "@/types/shalwar-kameez"

interface ButtonTypePanelProps {
  options: RadioItem[]
  // Column this list occupies within the ancestor data-nav-container -- see
  // OrderSummaryPanel, which places this one column to the right of its
  // amount fields so ArrowRight/ArrowLeft can cross between them. Each
  // option is its own row (index), unlike the horizontal radio rows
  // elsewhere which fix the row and vary the column.
  navCol: number
  // Row/col of Order Summary's last amount field (Advance) -- this list runs
  // longer than that column, so the rows past its end (RTSS/RTDS/EMD) have
  // no row-aligned amount field for ArrowLeft to land on. Those rows fall
  // back to landing here instead of doing nothing (see keyboard-nav's
  // data-nav-left-fallback); rows that do have an aligned field are
  // unaffected, since the exact row match wins first.
  leftFallbackRow: number
  leftFallbackCol: number
}

// Single-select list — a `<button_type_id>` FK, so radios underneath for
// correct exclusivity — but styled as small squares (appearance-none) to
// match the Claude Design spec's checkbox look pixel-for-pixel.
export function ButtonTypePanel({ options, navCol, leftFallbackRow, leftFallbackCol }: ButtonTypePanelProps) {
  return (
    <div className="flex w-[98px] shrink-0 flex-col gap-1.5 border-l border-[#e4e4e9] pl-2.5">
      <div className="text-[10px] font-bold tracking-[0.05em] text-[#8a8a92] uppercase">Button Type</div>
      {options.map((option, index) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-center gap-1.5 rounded-[3px] text-[12px] font-semibold text-[#222226] [&:has(:focus-visible)]:bg-[#eef0ff]"
        >
          <input
            type="radio"
            name="buttonType"
            checked={option.checked}
            onChange={option.onChange}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return
              e.preventDefault()
              option.onChange()
            }}
            data-nav-row={index}
            data-nav-col={navCol}
            data-nav-left-fallback={`${leftFallbackRow}:${leftFallbackCol}`}
            className="size-[14px] shrink-0 cursor-pointer appearance-none rounded-[2px] border border-[#c7c7cf] bg-white checked:border-black checked:bg-black"
          />
          {option.label}
        </label>
      ))}
    </div>
  )
}
