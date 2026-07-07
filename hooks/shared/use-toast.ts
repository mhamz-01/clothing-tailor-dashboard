"use client"

import * as React from "react"
import { TOAST_LIMIT, TOAST_AUTO_DISMISS_MS } from "@/lib/constants/ui"

type Toast = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

type ToastInput = Omit<Toast, "id">

type ToastState = {
  toasts: Toast[]
}

const listeners = new Set<(state: ToastState) => void>()
let memoryState: ToastState = { toasts: [] }

function emit(state: ToastState) {
  memoryState = state
  listeners.forEach((listener) => listener(memoryState))
}

function dismiss(id: string) {
  emit({
    toasts: memoryState.toasts.filter((toast) => toast.id !== id),
  })
}

function addToast(input: ToastInput) {
  const id = crypto.randomUUID()
  const toast: Toast = { id, ...input }

  emit({
    toasts: [toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
  })

  window.setTimeout(() => dismiss(id), TOAST_AUTO_DISMISS_MS)

  return {
    id,
    dismiss: () => dismiss(id),
  }
}

function toast(input: ToastInput) {
  return addToast(input)
}

function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState)

  React.useEffect(() => {
    listeners.add(setState)
    return () => {
      listeners.delete(setState)
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss,
  }
}

export { toast, useToast }
