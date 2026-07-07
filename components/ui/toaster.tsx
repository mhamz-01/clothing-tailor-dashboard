"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/shared/use-toast"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto rounded-lg border bg-white p-4 shadow-lg",
            toast.variant === "destructive"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-slate-200 text-slate-900"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              {toast.title ? <p className="text-sm font-semibold">{toast.title}</p> : null}
              {toast.description ? (
                <p className="text-sm text-slate-700">{toast.description}</p>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-slate-500 hover:text-slate-900"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
