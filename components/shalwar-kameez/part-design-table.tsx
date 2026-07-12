import { Fragment } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FIELD_CLASS, NUMBERED_OPTIONS } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"
import type { PartDesignRowState } from "@/types/shalwar-kameez"

interface PartDesignTableProps {
  rows: PartDesignRowState[]
  onSizeChange: (index: number, field: "size1" | "size2" | "designNo", value: string) => void
  onLabelClick: (row: PartDesignRowState) => void
}

// One row per garment part (bazu / kuf / button patti / jaib) — feeds
// `order_part_designs` (part_type + size1/size2 + design_no) once wired up.
export function PartDesignTable({ rows, onSizeChange, onLabelClick }: PartDesignTableProps) {
  return (
    <div className="border-t border-slate-200 pt-1.5">
      <div className="grid grid-cols-[1fr_1fr_1fr_1.1fr] items-center gap-2.5">
        <div className="text-[11px] font-bold tracking-wide text-black uppercase">Design #</div>
        <div className="text-[11px] font-bold tracking-wide text-black uppercase">Size 1</div>
        <div className="text-[11px] font-bold tracking-wide text-black uppercase">Size 2</div>
        <div />

        {rows.map((row, index) => (
          <Fragment key={row.key}>
            <Select value={row.designNo} onValueChange={(value) => onSizeChange(index, "designNo", value)}>
              <SelectTrigger className={cn(FIELD_CLASS, "h-8 text-sm")}>
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
            <Input
              type="number"
              value={row.size1}
              onChange={(e) => onSizeChange(index, "size1", e.target.value)}
              className={cn(FIELD_CLASS, "h-8")}
            />
            <Input
              type="number"
              value={row.size2}
              onChange={(e) => onSizeChange(index, "size2", e.target.value)}
              className={cn(FIELD_CLASS, "h-8")}
            />
            <button
              type="button"
              onClick={() => onLabelClick(row)}
              dir="rtl"
              className="rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-center font-[family-name:var(--font-urdu)] text-base font-bold text-black shadow-sm"
            >
              {row.ur}
            </button>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
