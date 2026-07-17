import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { RadioOptionDefinition } from "@/types/shalwar-kameez"

interface SizeQuickPickProps {
  value: string
  onChange: (value: string) => void
  // Bain/Gala and Collar are separate size scales -- caller passes its own
  // option list (BAIN_SIZE_OPTIONS / COLLAR_SIZE_OPTIONS) rather than this
  // component hardcoding one shared list.
  options: RadioOptionDefinition[]
  // Position within the ancestor data-nav-container -- see StyleOptionsPanel,
  // which places this one column past the Bain/Gala or Collar/Cut row's last
  // radio option, so arrow keys can reach it same as any other cell there.
  navRow: number
  navCol: number
}

// Compact "Size" quick-pick dropdown placed alongside a radio option row
// (Bain/Gala, Collar/Cut) — mirrors the Claude Design spec pixel-for-pixel.
//
// Wrapped in a fixed-width div because <Select>'s own root element is
// hardcoded `w-full` — as a bare flex item that stretches to fill the whole
// row, pushing the radio options onto the next line. Constraining the width
// one level up keeps it inline with them instead.
//
// Reachable by arrow-key navigation like everything else in the panel (see
// lib/utils/keyboard-nav) -- Up/Down/Left/Right always just move focus onto
// or off of it and never touch its value, same "arrows hover, Enter/Space/
// click selects" convention as the checkboxes and radio options around it.
export function SizeQuickPick({ value, onChange, options, navRow, navCol }: SizeQuickPickProps) {
  return (
    <label className="ml-auto flex shrink-0 items-center gap-1.5">
      <span className="text-[11px] font-semibold text-[#777]">Size</span>
      <div className="w-20 shrink-0">
        <Select value={value} onValueChange={onChange} data-nav-row={navRow} data-nav-col={navCol}>
          <SelectTrigger className="flex h-[25px] items-center rounded-[3px] border-[#c7c7cf] bg-white py-0 pr-5 pl-2.5 text-[18px] font-medium text-[#111116]">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
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
