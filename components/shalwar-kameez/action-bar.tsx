import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ActionBarProps {
  statusMsg: string
  onSave: () => void
  onClear: () => void
  onPrev: () => void
  onNext: () => void
  onPrint: () => void
  onDelete: () => void
  onExit: () => void
}

// Full-width single-row bar below the 3-column layout — these actions apply
// to the whole form, not just Order Summary, so they don't live inside any
// one column (client request). Negative margin pulls it up closer to the
// grid above; status message only takes space when it actually has text.
export function ActionBar({ statusMsg, onSave, onClear, onPrev, onNext, onPrint, onDelete, onExit }: ActionBarProps) {
  return (
    <div className="-mt-9 flex flex-col gap-0.5">
      {statusMsg && <p className="text-xs font-semibold text-slate-500">{statusMsg}</p>}

      <div className="flex flex-row flex-nowrap justify-center gap-2">
        <Button type="button" onClick={onSave} className="h-9 shrink-0 px-4 text-sm whitespace-nowrap">
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onClear} className="h-9 shrink-0 px-4 text-sm whitespace-nowrap">
          Clear
        </Button>
        <Button type="button" variant="outline" onClick={onPrev} className="h-9 shrink-0 px-4 text-sm whitespace-nowrap">
          Prev
        </Button>
        <Button type="button" variant="outline" onClick={onNext} className="h-9 shrink-0 px-4 text-sm whitespace-nowrap">
          Next
        </Button>
        <Button type="button" variant="outline" onClick={onPrint} className="h-9 shrink-0 px-4 text-sm whitespace-nowrap text-slate-700">
          Print
        </Button>
        <Button type="button" variant="destructive" onClick={onDelete} className="h-9 shrink-0 px-4 text-sm whitespace-nowrap">
          Delete
        </Button>
        <Button type="button" variant="secondary" onClick={onExit} className="h-9 shrink-0 border border-slate-300 px-4 text-sm whitespace-nowrap">
          <LogOut className="size-4" />
          Exit
        </Button>
      </div>
    </div>
  )
}
