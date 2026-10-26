import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FIELD_CLASS, NO_SPINNER_CLASS } from "@/lib/constants/tailor-form"
import { cn } from "@/lib/utils"
import { handleGridArrowKeyDown } from "@/lib/utils/keyboard-nav"
import type { GarmentMeasurement } from "@/types/garment-form"

interface GarmentMeasurementsPanelProps {
  measurements: GarmentMeasurement[]
  values: Record<string, string>
  onChange: (column: string, value: string) => void
  note: string
  onNoteChange: (value: string) => void
}

const inputClass = cn(FIELD_CLASS, NO_SPINNER_CLASS, "h-[23px]")

// Left column: one row per measurement of the garment (one value box, or two on
// the Shirt sheet) with its Urdu name, then the Note box. Rows come straight
// from the garment definition. Arrow keys step between boxes (keyboard-nav),
// same convention as the Shalwar Kameez measurements panel.
export function GarmentMeasurementsPanel({ measurements, values, onChange, note, onNoteChange }: GarmentMeasurementsPanelProps) {
  const hasPairs = measurements.some((m) => m.secondColumn)

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

      {measurements.map((measurement, index) => (
        <div key={measurement.column} className={cn("grid items-center gap-2", hasPairs ? "grid-cols-[1fr_1fr_84px]" : "grid-cols-[1fr_104px]")}>
          <Input
            type="number"
            value={values[measurement.column] ?? ""}
            onChange={(e) => onChange(measurement.column, e.target.value)}
            placeholder="—"
            className={inputClass}
            data-nav-row={index}
            data-nav-col={0}
          />
          {measurement.secondColumn && (
            <Input
              type="number"
              value={values[measurement.secondColumn] ?? ""}
              onChange={(e) => onChange(measurement.secondColumn!, e.target.value)}
              placeholder="—"
              className={inputClass}
              data-nav-row={index}
              data-nav-col={1}
            />
          )}
          <label
            className="font-[family-name:var(--font-naskh)] text-right text-[20px] font-bold whitespace-nowrap text-[#111116]"
            dir="rtl"
          >
            {measurement.ur}
          </label>
        </div>
      ))}

      <Textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Note…"
        className={cn(FIELD_CLASS, "min-h-11 flex-1 resize-none")}
        data-nav-row={measurements.length}
        data-nav-col={0}
      />
    </div>
  )
}
