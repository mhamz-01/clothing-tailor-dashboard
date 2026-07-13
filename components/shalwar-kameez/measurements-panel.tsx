import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <div className="-mt-12 flex flex-col gap-0.5">
      <div className="rounded-md bg-white px-2.5 py-1 text-xs font-bold tracking-wide text-black uppercase">
        Measurements
      </div>

      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-2">
          <span className="w-16 shrink-0 font-[family-name:var(--font-urdu)] text-[15px] font-bold text-black" dir="rtl">
            {row.ur}
          </span>
          <Input type="number" value={row.value} onChange={(e) => row.onChange(e.target.value)} className={cn(FIELD_CLASS, "h-7")} />
        </div>
      ))}

      {/* Two unlabeled quick-entry boxes below Pancha — combined width equals one
          measurement input above; purpose not decided yet. */}
      <div className="flex items-center gap-2">
        <span className="w-16 shrink-0" />
        <div className="flex flex-1 gap-2">
          <Input type="number" value={extraNo1} onChange={(e) => onExtraNo1Change(e.target.value)} className={cn(FIELD_CLASS, "h-7 flex-1")} />
          <Input type="number" value={extraNo2} onChange={(e) => onExtraNo2Change(e.target.value)} className={cn(FIELD_CLASS, "h-7 flex-1")} />
        </div>
      </div>

      <div className="mt-0.5 flex items-start gap-2">
        <span className="w-16 shrink-0" />
        <div className="flex-1">
          <Label className="mb-0.5 block text-[12.5px] font-bold text-black">Note</Label>
          <Textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            rows={2}
            placeholder="Additional notes…"
            className={cn(FIELD_CLASS, "h-12 min-h-0 w-full resize-none px-2.5 py-1 text-[13px]")}
          />
        </div>
      </div>
    </div>
  )
}
