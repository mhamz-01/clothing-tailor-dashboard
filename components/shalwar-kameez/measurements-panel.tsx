import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FIELD_CLASS } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"
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
// Dashboard.dc.html) pixel-for-pixel: input first, Urdu label second (66px),
// note textarea fills the remaining column height.
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
    <div className="flex min-h-0 flex-col gap-1.5 rounded-[5px] border border-[#dcdce1] bg-[#fafafb] p-[9px]">
      <div className="flex items-center justify-between border-b border-[#e4e4e9] pb-[5px]">
        <span className="text-[10px] font-bold tracking-[0.09em] text-[#8a8a92] uppercase">Measurements</span>
        <span className="font-[family-name:var(--font-naskh)] text-[13px] font-bold text-[#8a8a92]" dir="rtl">
          پیمائش
        </span>
      </div>

      {rows.map((row) => (
        <div key={row.key} className="grid grid-cols-[1fr_66px] items-center gap-2">
          <Input
            type="number"
            value={row.value}
            onChange={(e) => row.onChange(e.target.value)}
            placeholder="—"
            className={cn(FIELD_CLASS, "h-[23px]")}
          />
          <label className="font-[family-name:var(--font-naskh)] text-right text-[22px] font-bold text-[#111116]" dir="rtl">
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
          className={cn(FIELD_CLASS, "h-[23px]")}
        />
        <Input
          type="number"
          value={extraNo2}
          onChange={(e) => onExtraNo2Change(e.target.value)}
          placeholder="—"
          className={cn(FIELD_CLASS, "h-[23px]")}
        />
      </div>

      <Textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Note…"
        className={cn(FIELD_CLASS, "min-h-11 flex-1 resize-none")}
      />
    </div>
  )
}
