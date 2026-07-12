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

export function ActionBar({ statusMsg, onSave, onClear, onPrev, onNext, onPrint, onPrintReceipt, onDelete, onExit }: ActionBarProps) {
  return (
    <div className="flex flex-col items-start gap-2.5 border-t border-slate-200 pt-3">
      <p className="min-h-[18px] text-[13px] font-semibold text-slate-500">{statusMsg}</p>

      <div className="flex flex-wrap gap-2.5">
        <Button type="button" onClick={onSave} className="h-10 px-5">
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onClear} className="h-10 px-5">
          Clear
        </Button>
        <Button type="button" variant="outline" onClick={onPrev} className="h-10 px-5">
          Prev
        </Button>
        <Button type="button" variant="outline" onClick={onNext} className="h-10 px-5">
          Next
        </Button>
        <Button type="button" variant="outline" onClick={onPrint} className="h-10 px-5 text-slate-700">
          Print
        </Button>
        <Button type="button" variant="outline" onClick={onPrintReceipt} className="h-10 px-5">
          Print Receipt
        </Button>
        <Button type="button" variant="outline" onClick={onDelete} className="h-10 px-5">
          Delete
        </Button>
        <Button type="button" variant="secondary" onClick={onExit} className="h-10 px-5">
          Exit
        </Button>
      </div>
    </div>
  )
}
