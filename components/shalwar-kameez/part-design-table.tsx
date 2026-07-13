import { Fragment, useState } from "react"
import { PartDesignPickerModal } from "@/components/shalwar-kameez/part-design-picker-modal"
import { Input } from "@/components/ui/input"
import { FIELD_CLASS } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"
import type { PartDesignRowState } from "@/types/shalwar-kameez"

interface PartDesignTableProps {
  rows: PartDesignRowState[]
  onSizeChange: (index: number, field: "size1" | "size2" | "designNo", value: string) => void
}

// One row per garment part (bazu / kuf / button patti / jaib) — feeds
// `order_part_designs` (part_type + size1/size2 + design_no) once wired up.
// Mirrors the Claude Design spec (Shalwar Kameez Dashboard.dc.html)
// pixel-for-pixel: flexible 1fr columns (not fixed px) and a plain text
// input for Design # instead of a dropdown. Clicking the Urdu label button
// opens PartDesignPickerModal, which writes back into the same three fields
// as the row's manual inputs below.
export function PartDesignTable({ rows, onSizeChange }: PartDesignTableProps) {
  const [modalIndex, setModalIndex] = useState<number | null>(null)
  const modalRow = modalIndex !== null ? rows[modalIndex] : null

  return (
    <div className="rounded-[5px] border border-[#dcdce1] bg-[#fafafb] p-[9px]">
      <div className="grid grid-cols-[1fr_1fr_1fr_54px] items-center gap-x-1.5 gap-y-[5px]">
        <div className="text-center text-[13px] font-bold tracking-[0.05em] text-[#8a8a92] uppercase">Design #</div>
        <div className="text-center text-[13px] font-bold tracking-[0.05em] text-[#8a8a92] uppercase">Size 1</div>
        <div className="text-center text-[13px] font-bold tracking-[0.05em] text-[#8a8a92] uppercase">Size 2</div>
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
              onClick={() => setModalIndex(index)}
              dir="rtl"
              className="flex h-[29px] items-center justify-center rounded-[3px] border border-black bg-white font-[family-name:var(--font-naskh)] text-[18px] font-bold text-black"
            >
              {row.ur}
            </button>
          </Fragment>
        ))}
      </div>

      <PartDesignPickerModal
        open={modalIndex !== null}
        row={modalRow}
        onOpenChange={(open) => {
          if (!open) setModalIndex(null)
        }}
        onApply={(designNo, size1, size2) => {
          if (modalIndex === null) return
          onSizeChange(modalIndex, "designNo", designNo)
          onSizeChange(modalIndex, "size1", size1)
          onSizeChange(modalIndex, "size2", size2)
        }}
      />
    </div>
  )
}
