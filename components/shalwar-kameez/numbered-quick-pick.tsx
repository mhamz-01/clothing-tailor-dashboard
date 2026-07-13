import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NUMBERED_OPTIONS } from "@/lib/constants/shalwar-kameez"

interface NumberedQuickPickProps {
  value: string
  onChange: (value: string) => void
}

// Compact "Design #" quick-pick dropdown placed alongside a radio option row
// (Bain/Gala, Collar/Cut) — mirrors the Claude Design spec pixel-for-pixel.
//
// Wrapped in a fixed-width div because <Select>'s own root element is
// hardcoded `w-full` — as a bare flex item that stretches to fill the whole
// row, pushing the radio options onto the next line. Constraining the width
// one level up keeps it inline with them instead.
export function NumberedQuickPick({ value, onChange }: NumberedQuickPickProps) {
  return (
    <label className="ml-auto flex shrink-0 items-center gap-1.5">
      <span className="text-[11px] font-semibold text-[#777]">Design #</span>
      <div className="w-14 shrink-0">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-[23px] rounded-[3px] border-[#c7c7cf] bg-white pr-5 pl-1.5 text-[12px] text-[#111116]">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {NUMBERED_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </label>
  )
}
