import type { ReactNode } from "react"

// One card holding every option row of a form's middle column. Rows are
// separated by hairline dividers instead of being separate boxes with gaps,
// so the whole block reads as a single, calm surface.
export function OptionCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col divide-y divide-[#D9D4C6] overflow-hidden rounded-lg border border-[#857F70] bg-white shadow-[0_1px_3px_rgba(31,42,68,0.12)]">
      {children}
    </div>
  )
}
