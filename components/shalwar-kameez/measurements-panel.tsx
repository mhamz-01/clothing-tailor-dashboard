import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FIELD_CLASS, NO_SPINNER_CLASS } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"
import { handleGridArrowKeyDown } from "@/lib/utils/keyboard-nav"
import type { MeasurementRow } from "@/types/shalwar-kameez"

interface MeasurementsPanelProps {
  rows: MeasurementRow[]
  note: string
  onNoteChange: (value: string) => void
  extraNo1: string
  onExtraNo1Change: (value: string) => void
  extraNo2: string
  onExtraNo2Change: (value: string) => void
}

// Left column of the form. Mirrors the Claude Design spec (Shalwar Kameez
// Dashboard.dc.html) pixel-for-pixel: input first, Urdu label second (84px --
// wide enough for the longest label, "شلوار لمبائی", which is two words and
// wrapped inside the original 66px), note textarea fills the remaining
// column height.
//
// Up/Down/Left/Right step between the measurement inputs instead of the
// browser's native number-input spin behavior (see lib/utils/keyboard-nav) --
// the 9 measurements form a single nav column (row = index), and the
// extraNo1/extraNo2 pair below them shares the next row split across two
// columns, so Left/Right moves between those two and Up/Down still reaches
// them from Pancha above. Down from either of those reaches the Note
// textarea below in turn, and Up from the Note's first line steps back out
// to it -- everywhere else inside Note, arrows keep their normal multi-line
// meaning (moving the caret through the note's own text).
export function MeasurementsPanel({
  rows,
  note,
  onNoteChange,
  extraNo1,
  onExtraNo1Change,
  extraNo2,
  onExtraNo2Change,
}: MeasurementsPanelProps) {
  return (
    <div
      className="flex min-h-0 flex-col gap-1.5 rounded-[5px] border border-[#dcdce1] bg-[#fafafb] p-[9px]"
      data-nav-container
      onKeyDown={handleGridArrowKeyDown}
    >
      <div className="flex items-center justify-between border-b border-[#e4e4e9] pb-[5px]">
        <span className="text-[10px] font-bold tracking-[0.09em] text-[#8a8a92] uppercase">Measurements</span>
        <span className="font-[family-name:var(--font-naskh)] text-[13px] font-bold text-[#8a8a92]" dir="rtl">
          پیمائش
        </span>
      </div>

      {rows.map((row, index) => (
        <div key={row.key} className="grid grid-cols-[1fr_104px] items-center gap-2  ">
          <Input
            type="number"
            value={row.value}
            onChange={(e) => row.onChange(e.target.value)}
            placeholder="—"
            className={cn(FIELD_CLASS, NO_SPINNER_CLASS, "h-[23px]")}
            data-nav-row={index}
            data-nav-col={0}
          />
          <label
            className="font-[family-name:var(--font-naskh)] text-right text-[20px] font-bold whitespace-nowrap text-[#111116]"
            dir="rtl"
          >
            {row.ur}
          </label>
        </div>
      ))}

      {/* Two unlabeled quick-entry boxes below Pancha — combined width equals one
          measurement input above; purpose not decided yet. */}
      <div className="mt-px grid grid-cols-2 gap-1.5">
        <Input
          type="number"
          value={extraNo1}
          onChange={(e) => onExtraNo1Change(e.target.value)}
          placeholder="—"
          className={cn(FIELD_CLASS, NO_SPINNER_CLASS, "h-[23px]")}
          data-nav-row={rows.length}
          data-nav-col={0}
        />
        <Input
          type="number"
          value={extraNo2}
          onChange={(e) => onExtraNo2Change(e.target.value)}
          placeholder="—"
          className={cn(FIELD_CLASS, NO_SPINNER_CLASS, "h-[23px]")}
          data-nav-row={rows.length}
          data-nav-col={1}
        />
      </div>

      <Textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Note…"
        className={cn(FIELD_CLASS, "min-h-11 flex-1 resize-none")}
        data-nav-row={rows.length + 1}
        data-nav-col={0}
      />
    </div>
  )
}
