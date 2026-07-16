"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { TOAST_AUTO_DISMISS_MS } from "@/lib/constants/ui"
import type { StatusKind } from "@/types/shalwar-kameez"

interface StatusToastProps {
  statusMsg: string
  statusKind: StatusKind
  onDismiss: () => void
}

const TOAST_STYLES: Record<Exclude<StatusKind, "idle">, string> = {
  info: "border-[#c2c2ca] border-l-[#8a8a92] bg-[#f4f4f6] text-[#333338]",
  success: "border-[#bfe4c9] border-l-[#1a7f37] bg-[#eaf7ee] text-[#146c2e]",
  error: "border-[#f3c6c0] border-l-[#c0392b] bg-[#fdecea] text-[#a5291b]",
}

const TOAST_ICON_STYLES: Record<Exclude<StatusKind, "idle">, string> = {
  info: "bg-[#e2e2e6] text-[#5c5c64]",
  success: "bg-[#d3efdb] text-[#146c2e]",
  error: "bg-[#f9d9d4] text-[#a5291b]",
}

function StatusIcon({ kind }: { kind: Exclude<StatusKind, "idle"> }) {
  if (kind === "success") {
    return (
      <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="7" cy="7" r="6" />
        <path d="M4.3 7.2l1.8 1.8 3.6-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (kind === "error") {
    return (
      <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="7" cy="7" r="6" />
        <path d="M7 4v3.5" strokeLinecap="round" />
        <circle cx="7" cy="9.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="7" cy="7" r="6" />
      <path d="M7 6.4v3.2" strokeLinecap="round" />
      <circle cx="7" cy="4.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

// Fixed to the actual viewport's bottom-right corner -- rendered as a
// sibling of the board, not nested inside it, since the board is
// CSS-transform-scaled to fit the screen and anything nested inside it
// would shrink along with it (that's what made an earlier version of this
// toast unreadably small on any screen under 1610x770). Sized generously so
// it stays legible regardless of how small the board itself is scaled.
//
// `content` is latched into local state so the pill can keep rendering
// (running its exit animation) for a beat after the hook clears
// statusMsg/statusKind back to idle, and the toast auto-dismisses itself on
// a timer so the tailor never has to manually clear a stale "Saved.".
export function StatusToast({ statusMsg, statusKind, onDismiss }: StatusToastProps) {
  const [content, setContent] = useState<{ msg: string; kind: Exclude<StatusKind, "idle"> } | null>(null)
  const [closing, setClosing] = useState(false)

  // Render-time state adjustment (see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  // rather than a useEffect, since this is a one-off reaction to the
  // incoming status changing, not an ongoing sync -- keeps React from
  // flashing a stale frame before the effect gets a chance to run.
  const incomingKey = statusMsg && statusKind !== "idle" ? `${statusKind}:${statusMsg}` : ""
  const [lastSyncedKey, setLastSyncedKey] = useState("")
  if (incomingKey !== lastSyncedKey) {
    setLastSyncedKey(incomingKey)
    if (incomingKey) {
      setContent({ msg: statusMsg, kind: statusKind as Exclude<StatusKind, "idle"> })
      setClosing(false)
    } else {
      setClosing(true)
    }
  }

  useEffect(() => {
    if (!content || closing) return
    const timer = window.setTimeout(onDismiss, TOAST_AUTO_DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [content, closing, onDismiss])

  useEffect(() => {
    if (!closing || !content) return
    const timer = window.setTimeout(() => setContent(null), 220)
    return () => window.clearTimeout(timer)
  }, [closing, content])

  if (!content) return null

  return (
    <div className="pointer-events-none fixed right-6 bottom-6 z-50 flex max-w-[440px] justify-end">
      <div
        key={`${content.kind}:${content.msg}`}
        role="status"
        className={cn(
          "pointer-events-auto flex items-center gap-3 rounded-[8px] border border-l-[4px] py-3 pr-3 pl-3.5 text-[16px] font-bold shadow-[0_10px_30px_rgba(0,0,0,0.22)] duration-200 ease-out",
          closing ? "animate-out fade-out-0 slide-out-to-right-2" : "animate-in fade-in-0 slide-in-from-right-2",
          TOAST_STYLES[content.kind]
        )}
      >
        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", TOAST_ICON_STYLES[content.kind])}>
          <StatusIcon kind={content.kind} />
        </span>
        <span className="min-w-0 leading-snug">{content.msg}</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full opacity-60 hover:opacity-100"
        >
          <svg width="12" height="12" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M1 1l7 7M8 1l-7 7" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
