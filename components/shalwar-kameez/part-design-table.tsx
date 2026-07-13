import { Fragment } from "react"
import { Input } from "@/components/ui/input"
import { FIELD_CLASS } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"
import type { PartDesignRowState } from "@/types/shalwar-kameez"

interface PartDesignTableProps {
  rows: PartDesignRowState[]
  onSizeChange: (index: number, field: "size1" | "size2" | "designNo", value: string) => void
  onLabelClick: (row: PartDesignRowState) => void
}

// One row per garment part (bazu / kuf / button patti / jaib) — feeds
// `order_part_designs` (part_type + size1/size2 + design_no) once wired up.
// Mirrors the Claude Design spec (Shalwar Kameez Dashboard.dc.html)
// pixel-for-pixel: flexible 1fr columns (not fixed px) and a plain text
// input for Design # instead of a dropdown.
export function PartDesignTable({ rows, onSizeChange, onLabelClick }: PartDesignTableProps) {
  return (
    <div className="rounded-[5px] border border-[#dcdce1] bg-[#fafafb] p-[9px]">
      <div className="grid grid-cols-[1fr_1fr_1fr_54px] items-center gap-x-1.5 gap-y-[5px]">
        <div className="text-center text-[10px] font-bold tracking-[0.05em] text-[#8a8a92] uppercase">Design #</div>
        <div className="text-center text-[10px] font-bold tracking-[0.05em] text-[#8a8a92] uppercase">Size 1</div>
        <div className="text-center text-[10px] font-bold tracking-[0.05em] text-[#8a8a92] uppercase">Size 2</div>
        <div />

        {rows.map((row, index) => (
          <Fragment key={row.key}>
            <Input
              value={row.designNo}
              onChange={(e) => onSizeChange(index, "designNo", e.target.value)}
              placeholder="—"
              className={cn(FIELD_CLASS, "h-[23px] text-center")}
            />
            <Input
              type="number"
              value={row.size1}
              onChange={(e) => onSizeChange(index, "size1", e.target.value)}
              placeholder="—"
              className={cn(FIELD_CLASS, "h-[23px] text-center")}
            />
            <Input
              type="number"
              value={row.size2}
              onChange={(e) => onSizeChange(index, "size2", e.target.value)}
              placeholder="—"
              className={cn(FIELD_CLASS, "h-[23px] text-center")}
            />
            <button
              type="button"
              onClick={() => onLabelClick(row)}
              dir="rtl"
              className="flex h-[23px] items-center justify-center rounded-[3px] border border-black bg-white font-[family-name:var(--font-naskh)] text-[15px] font-bold text-black"
            >
              {row.ur}
            </button>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
