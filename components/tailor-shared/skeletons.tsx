import type { CSSProperties } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Loading placeholders for the tailor module. Each one mirrors the real page
// layout (same grid, same proportions) so content swaps in without the page
// jumping. `.sk` / `.sk-dark` (globals.css) provide the shimmer.

function Block({ className, style, dark }: { className?: string; style?: CSSProperties; dark?: boolean }) {
  return <div aria-hidden className={cn("sk", dark && "sk-dark", className)} style={style} />
}

// Screen-reader + visual hint that something is loading.
function Status({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <div role="status" aria-live="polite" className={cn("flex items-center gap-2 text-xs font-medium", dark ? "text-[#B9C0D0]" : "text-[#6B7285]")}>
      <Loader2 className="size-3.5 animate-spin" />
      {label}
    </div>
  )
}

// /tailor/categories: navy page, header, 3 + 2 cards.
export function CategoriesSkeleton() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[radial-gradient(ellipse_at_20%_0%,rgba(96,132,214,0.45)_0%,transparent_55%),radial-gradient(ellipse_at_90%_100%,rgba(51,80,140,0.55)_0%,transparent_50%),linear-gradient(160deg,#0E1830_0%,#1F2A44_45%,#2C4276_100%)]">
      <div className="flex shrink-0 flex-col items-center gap-3 px-4 pt-[clamp(1rem,3vh,2rem)] pb-[clamp(1rem,3vh,2rem)]">
        <Block dark className="size-[clamp(4rem,11vh,6.5rem)] rounded-full" />
        <Block dark className="h-8 w-44" />
        <Block dark className="h-5 w-24" />
        <Block dark className="h-3 w-56" />
      </div>
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 pb-[clamp(0.75rem,2.5vh,1.5rem)]">
        <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[repeat(3,minmax(0,1fr))] gap-[clamp(0.6rem,1.8vh,1.1rem)] sm:grid-cols-6 sm:grid-rows-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "flex min-h-0 flex-col items-center justify-center gap-3 rounded-2xl border border-[#DDD8CC] bg-white p-4 sm:col-span-2",
                i >= 3 && "sm:col-span-3"
              )}
            >
              <Block className="h-[clamp(3.5rem,13vh,7.5rem)] w-20" />
              <Block className="h-6 w-28" />
              <Block className="h-4 w-20" />
              <Block className="h-7 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// /tailor/orders/**: the order board with title bar, lookup strip, three
// columns (measurements | options | billing) and the action bar.
export function OrderSheetSkeleton() {
  return (
    <div className="flex h-dvh w-screen items-center justify-center overflow-hidden bg-[#0F1626] p-3">
      <div className="flex h-full max-h-[770px] w-full max-w-[1610px] flex-col overflow-hidden bg-[#EDE9DF] shadow-[0_6px_34px_rgba(0,0,0,0.45)]">
        <div className="flex h-8 flex-none items-center gap-3 border-b border-[#0F1626] bg-[#1F2A44] px-3">
          <Block dark className="h-3.5 w-14" />
          <Block dark className="h-3.5 w-56" />
          <div className="ml-auto">
            <Status dark label="Loading order sheet…" />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2 p-2.5">
          <Block className="h-[68px] flex-none" />
          <div className="grid min-h-0 flex-1 grid-cols-[228px_1fr_420px] gap-2">
            <div className="flex flex-col gap-2">
              {Array.from({ length: 7 }, (_, i) => (
                <Block key={i} dark className="h-11 flex-none" />
              ))}
            </div>
            <Block className="h-full" />
            <div className="flex flex-col gap-2">
              <Block className="h-32 flex-none" />
              <Block className="min-h-0 flex-1" />
            </div>
          </div>
          <Block className="h-11 flex-none" />
        </div>
      </div>
    </div>
  )
}

// /tailor/settings
export function SettingsSkeleton() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-4 py-10">
      <Block className="h-4 w-24" />
      <Block className="h-8 w-56" />
      <Block className="h-5 w-40" />
      <div className="mt-2 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-xl border border-[#DDD8CC] bg-white p-4">
            <Block className="mb-3 h-4 w-36" />
            <Block className="h-10 w-full" />
          </div>
        ))}
      </div>
      <Status label="Loading settings…" />
    </div>
  )
}

// /tailor/login: split screen.
export function LoginSkeleton() {
  return (
    <div className="grid min-h-dvh grid-cols-1 bg-[#F6F4EF] lg:grid-cols-2">
      <div className="hidden flex-col items-center justify-center gap-4 bg-[#1F2A44] lg:flex">
        <Block dark className="size-36 rounded-full" />
        <Block dark className="h-9 w-56" />
        <Block dark className="h-5 w-32" />
      </div>
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm space-y-5">
          <Block className="h-9 w-48" />
          <Block className="h-4 w-64" />
          <Block className="h-11 w-full" />
          <Block className="h-11 w-full" />
          <Block className="h-11 w-full" />
        </div>
      </div>
    </div>
  )
}

// Generic fallback for anything under /tailor without its own loading.tsx.
export function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#1F2A44]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-7 animate-spin text-[#B08D57]" />
        <Status dark label="Loading…" />
      </div>
    </div>
  )
}
