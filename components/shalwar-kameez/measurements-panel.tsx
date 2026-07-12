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
}

export function MeasurementsPanel({ rows, note, onNoteChange }: MeasurementsPanelProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-bold tracking-wide text-black uppercase">
        Measurements
      </div>

      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-2">
          <span className="w-16 shrink-0 font-[family-name:var(--font-urdu)] text-[17px] font-bold text-black" dir="rtl">
            {row.ur}
          </span>
          <Input type="number" value={row.value} onChange={(e) => row.onChange(e.target.value)} className={cn(FIELD_CLASS, "h-8")} />
        </div>
      ))}

      <div className="mt-1.5">
        <Label className="mb-1 block text-[12.5px] font-bold text-black">Note</Label>
        <Textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={3}
          placeholder="Additional notes…"
          className={cn(FIELD_CLASS, "min-h-0 resize-y text-[13px]")}
        />
      </div>
    </div>
  )
}
