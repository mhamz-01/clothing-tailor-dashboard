"use client"

import { useCallback, useState } from "react"
import type { StatusKind } from "@/types/shalwar-kameez"

// Message shown by StatusToast. flash/dismiss are stable (useCallback) because
// the toast re-arms its auto-dismiss timer whenever its onDismiss prop changes.
export function useStatusMessage() {
  const [status, setStatus] = useState<{ message: string; kind: StatusKind }>({ message: "", kind: "idle" })

  const flash = useCallback((message: string, kind: StatusKind = "info") => setStatus({ message, kind }), [])
  const dismiss = useCallback(() => setStatus((prev) => (prev.kind === "idle" ? prev : { message: "", kind: "idle" })), [])

  return { statusMsg: status.message, statusKind: status.kind, flash, dismiss }
}
