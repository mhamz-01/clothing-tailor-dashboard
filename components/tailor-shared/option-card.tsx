import type { ReactNode } from "react"

// One card holding every option row of a form's middle column. Rows are
// separated by hairline dividers instead of being separate boxes with gaps,
// so the whole block reads as a single, calm surface.
export function OptionCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col divide-y divide-[#C9C0A8] overflow-hidden rounded-md border border-t-[3px] border-[#C9C0A8] border-t-[#B08D57] bg-[#E3DCCB] shadow-[0_2px_8px_rgba(15,22,38,0.18)]">
      {children}
    </div>
  )
}
