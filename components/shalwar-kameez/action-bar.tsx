import { cn } from "@/lib/utils"
import type { StatusKind } from "@/types/shalwar-kameez"

interface ActionBarProps {
  statusMsg: string
  statusKind: StatusKind
  onPrintReceipt: () => void
  onSave: () => void
  onClear: () => void
  onPrev: () => void
  onNext: () => void
  onPrint: () => void
  onDelete: () => void
  onExit: () => void
}

const outlinedBtn =
  "h-8 shrink-0 rounded-[4px] border border-[#c2c2ca] bg-white px-3 text-[16px] font-bold whitespace-nowrap text-[#222226] hover:border-black hover:bg-[#f4f4f6]"

const STATUS_BAR_STYLES: Record<Exclude<StatusKind, "idle">, string> = {
  info: "border-[#c2c2ca] bg-[#f4f4f6] text-[#333338]",
  success: "border-[#1a7f37] bg-[#eaf7ee] text-[#146c2e]",
  error: "border-[#c0392b] bg-[#fdecea] text-[#a5291b]",
}

function StatusIcon({ kind }: { kind: Exclude<StatusKind, "idle"> }) {
  if (kind === "success") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="7" cy="7" r="6" />
        <path d="M4.3 7.2l1.8 1.8 3.6-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (kind === "error") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="7" cy="7" r="6" />
        <path d="M7 4v3.5" strokeLinecap="round" />
        <circle cx="7" cy="9.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="7" cy="7" r="6" />
      <path d="M7 6.4v3.2" strokeLinecap="round" />
      <circle cx="7" cy="4.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

// Full-width single-row bar below the 3-column body. Print Receipt sits on
// the left (outlined, icon+text); Save + the rest of the actions are
// centered together; a matching-width spacer on the right keeps that
// centered group visually balanced. Mirrors the Claude Design spec (Shalwar
// Kameez Dashboard.dc.html) pixel-for-pixel.
export function ActionBar({
  statusMsg,
  statusKind,
  onPrintReceipt,
  onSave,
  onClear,
  onPrev,
  onNext,
  onPrint,
  onDelete,
  onExit,
}: ActionBarProps) {
  return (
    <div className="flex shrink-0 flex-col gap-1.5">
      {statusMsg && statusKind !== "idle" && (
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-[4px] border px-2.5 py-1 text-[13px] font-bold",
            STATUS_BAR_STYLES[statusKind]
          )}
        >
          <StatusIcon kind={statusKind} />
          {statusMsg}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button type="button" onClick={onPrintReceipt} className="flex h-8 shrink-0 items-center gap-1.5 rounded-[4px] border border-black bg-white px-4 text-[13px] font-bold whitespace-nowrap text-black hover:bg-[#f0f0f2]">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="black" strokeWidth="1.4">
            <rect x="3" y="8" width="8" height="4" />
            <path d="M4 8V3h6v5M4 3h6" />
          </svg>
          Print Receipt
        </button>

        <div className="flex flex-1 items-center justify-center gap-1.5">
          <button type="button" onClick={onSave} className="h-8 min-w-[74px] shrink-0 rounded-[4px] border border-black bg-black px-3.5 text-[13px] font-bold whitespace-nowrap text-white hover:bg-[#333]">
            Save
          </button>
          <button type="button" onClick={onClear} className={outlinedBtn}>
            Clear
          </button>
          <button type="button" onClick={onPrev} className={outlinedBtn}>
            Prev
          </button>
          <button type="button" onClick={onNext} className={outlinedBtn}>
            Next
          </button>
          <button type="button" onClick={onPrint} className={outlinedBtn}>
            Print
          </button>
          <button type="button" onClick={onDelete} className={outlinedBtn}>
            Delete
          </button>
          <button type="button" onClick={onExit} className={outlinedBtn}>
            Exit
          </button>
        </div>

        <div className="w-[120px] shrink-0" />
      </div>
    </div>
  )
}
