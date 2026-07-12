import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NUMBERED_OPTIONS } from "@/lib/constants/shalwar-kameez"

interface NumberedQuickPickProps {
  value: string
  onChange: (value: string) => void
}

// Compact numbered dropdown (1-12) placed alongside a radio option group as a
// quick-pick shortcut, e.g. the Bain/Gala and Collar Type rows.
//
// Wrapped in a fixed-width div because <Select>'s own root element is
// hardcoded `w-full` — as a bare flex item that stretches to fill the whole
// row, pushing the radio options onto the next line. Constraining the width
// one level up keeps it inline with them instead.
export function NumberedQuickPick({ value, onChange }: NumberedQuickPickProps) {
  return (
    <div className="w-12 shrink-0">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-7 border-slate-200 bg-white text-xs font-medium text-slate-700">
          <SelectValue placeholder="#" />
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
  )
}
