import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ActionBarProps {
  statusMsg: string
  onSave: () => void
  onClear: () => void
  onPrev: () => void
  onNext: () => void
  onPrint: () => void
  onPrintReceipt: () => void
  onDelete: () => void
  onExit: () => void
}

// 4-column button grid (2 rows instead of 4), full labels (no abbreviating/
// icon-only) — lives in the Order Summary column rather than a full-width
// bar, so the whole form fits a single viewport without scrolling.
export function ActionBar({ statusMsg, onSave, onClear, onPrev, onNext, onPrint, onPrintReceipt, onDelete, onExit }: ActionBarProps) {
  return (
    <div className="flex flex-col gap-1.5 border-t border-slate-200 pt-2">
      <p className="min-h-[14px] text-[11px] font-semibold text-slate-500">{statusMsg}</p>

      <div className="grid grid-cols-4 gap-1">
        <Button type="button" onClick={onSave} className="h-7 px-1 text-[11px]">
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onClear} className="h-7 px-1 text-[11px]">
          Clear
        </Button>
        <Button type="button" variant="outline" onClick={onPrev} className="h-7 px-1 text-[11px]">
          Prev
        </Button>
        <Button type="button" variant="outline" onClick={onNext} className="h-7 px-1 text-[11px]">
          Next
        </Button>
        <Button type="button" variant="outline" onClick={onPrint} className="h-7 px-1 text-[11px] text-slate-700">
          Print
        </Button>
        <Button type="button" variant="outline" onClick={onPrintReceipt} className="h-7 px-0.5 text-[11px]">
          Print Receipt
        </Button>
        <Button type="button" variant="destructive" onClick={onDelete} className="h-7 px-1 text-[11px]">
          Delete
        </Button>
        <Button type="button" variant="secondary" onClick={onExit} className="h-7 border border-slate-300 px-1 text-[11px]">
          <LogOut className="size-3.5" />
          Exit
        </Button>
      </div>
    </div>
  )
}
